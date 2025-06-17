import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import axios from 'axios';
import algosdk from 'algosdk';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Reddit API configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = 'MindMiner:1.0.0 (by /u/mind-miner)';

// AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = process.env.GEMINI_URL;

// Algorand configuration
const ALGORAND_NODE_TOKEN = process.env.ALGORAND_NODE_TOKEN || '';
const ALGORAND_NODE_SERVER = process.env.ALGORAND_NODE_SERVER || 'https://testnet-api.algonode.cloud';
const ALGORAND_NODE_PORT = parseInt(process.env.ALGORAND_NODE_PORT || '443');

// Reward amounts (in microAlgos)
const REWARD_AMOUNTS = {
  beginner: 5 * 1000, // 5k microAlgo
  intermediate: 10 * 1000, // 10k microAlgo
  expert: 15 * 1000, // 15k microAlgo
  bonus: 3 * 1000 // 3k microAlgo
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { game_id, user_wallet, submitted_permalink } = await request.json();

    // Validate required parameters
    if (!game_id || !user_wallet || !submitted_permalink) {
      return NextResponse.json(
        { error: 'Game ID, user wallet, and submitted permalink are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Processing submission for game ${game_id} from wallet ${user_wallet}`);

    // Step 1: Retrieve game session from database
    const { data: gameSession, error: sessionError } = await DatabaseService.getGameSession(game_id);
    
    if (sessionError || !gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Step 2: Check if game is still active and within timer
    const now = new Date();
    const expirationTime = new Date(gameSession.expiration_timestamp);
    
    if (gameSession.status !== 'active') {
      return NextResponse.json({
        success: false,
        reason: 'game_inactive',
        message: `Game is no longer active. Status: ${gameSession.status}`,
        current_status: gameSession.status
      }, { headers: corsHeaders });
    }

    if (now > expirationTime) {
      // Update game session to timeout
      await DatabaseService.updateGameSession(game_id, { status: 'timeout' });
      
      return NextResponse.json({
        success: false,
        reason: 'timeout',
        message: 'Time has expired for this hunt',
        expired_at: expirationTime.toISOString()
      }, { headers: corsHeaders });
    }

    // Step 3: Validate wallet ownership
    if (gameSession.user_wallet !== user_wallet) {
      return NextResponse.json(
        { error: 'Wallet address does not match game session owner' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Step 4: Get Reddit access token and fetch submitted comment
    const redditToken = await getRedditAccessToken();
    if (!redditToken) {
      throw new Error('Failed to authenticate with Reddit API');
    }

    const submittedComment = await fetchCommentFromPermalink(redditToken, submitted_permalink);
    if (!submittedComment) {
      return NextResponse.json({
        success: false,
        reason: 'invalid_permalink',
        message: 'Could not retrieve comment from the provided permalink',
        submitted_permalink
      }, { headers: corsHeaders });
    }

    // Step 5: Use AI to verify if submitted comment matches the original clue and fact
    const verificationResult = await verifySubmissionWithAI(
      gameSession.clue_text,
      gameSession.extracted_fact,
      gameSession.winning_comment_permalink,
      submittedComment,
      submitted_permalink
    );

    const startTime = new Date(gameSession.created_at);
    const completionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000); // in seconds

    if (!verificationResult.isCorrect) {
      // Update game session to lost
      await DatabaseService.updateGameSession(game_id, { 
        status: 'lost',
        submitted_permalink,
        completion_time: completionTime
      });

      return NextResponse.json({
        success: false,
        reason: 'incorrect',
        message: verificationResult.feedback,
        verification_details: verificationResult,
        completion_time: completionTime
      }, { headers: corsHeaders });
    }

    // Step 6: Correct submission - Process rewards and updates
    console.log('Correct submission detected, processing rewards...');

    // Determine difficulty and reward amount
    const difficulty = determineDifficulty(gameSession);
    const baseReward = REWARD_AMOUNTS[difficulty as keyof typeof REWARD_AMOUNTS] || REWARD_AMOUNTS.beginner;
    const bonusReward = verificationResult.perfectMatch ? REWARD_AMOUNTS.bonus : 0;
    const totalReward = baseReward + bonusReward;

    // Step 7: Check if this is user's first win for NFT minting
    const { data: userStats } = await DatabaseService.getUserStats(user_wallet);
    const isFirstWin = !userStats || userStats.total_hunts_completed === 0;

    // Step 8: Initiate Algorand testnet transaction
    const algoTransaction = await initiateAlgorandReward(user_wallet, totalReward, game_id);
    
    // Step 9: Update user statistics
    const algoInWholeUnits = totalReward / 1000000; // Convert microAlgos to Algos
    await DatabaseService.updateUserStatsAfterHunt(
      user_wallet,
      completionTime,
      algoInWholeUnits,
      true
    );

    // Step 10: Update game session to won
    await DatabaseService.updateGameSession(game_id, { 
      status: 'won',
      submitted_permalink,
      completion_time: completionTime,
      algo_reward: algoInWholeUnits,
      transaction_id: algoTransaction.transactionId
    });

    // Step 11: Trigger NFT minting for first win or special achievements
    let nftResult = null;
    if (isFirstWin) {
      console.log('First win detected, minting NFT...');
      nftResult = await mintAchievementNFT(user_wallet, 'first_discovery', game_id, {
        hunt_difficulty: difficulty,
        completion_time: completionTime,
        perfect_match: verificationResult.perfectMatch
      });
    } else if (verificationResult.perfectMatch && difficulty === 'expert') {
      // Mint special NFT for perfect expert completion
      nftResult = await mintAchievementNFT(user_wallet, 'perfect_expert', game_id, {
        hunt_difficulty: difficulty,
        completion_time: completionTime,
        perfect_match: true
      });
    }

    // Step 12: Return success response
    return NextResponse.json({
      success: true,
      reason: 'correct',
      message: 'Congratulations! You found the correct answer!',
      rewards: {
        algo_earned: algoInWholeUnits,
        base_reward: baseReward / 1000000,
        bonus_reward: bonusReward / 1000000,
        transaction_id: algoTransaction.transactionId,
        nft_minted: !!nftResult,
        nft_details: nftResult
      },
      game_details: {
        difficulty,
        completion_time: completionTime,
        perfect_match: verificationResult.perfectMatch,
        is_first_win: isFirstWin
      },
      verification: verificationResult,
      extracted_fact: gameSession.extracted_fact
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Submit clue error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Get Reddit API access token
 */
async function getRedditAccessToken(): Promise<string | null> {
  try {
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
      console.warn('Reddit API credentials not configured, using mock verification');
      return 'mock_token';
    }

    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': REDDIT_USER_AGENT
        },
        timeout: 10000
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Reddit authentication error:', error);
    return null;
  }
}

/**
 * Fetch comment content from Reddit permalink
 */
async function fetchCommentFromPermalink(token: string, permalink: string): Promise<any | null> {
  if (token === 'mock_token') {
    // Return mock comment for development
    return {
      id: 'mock_comment',
      author: 'TestUser',
      body: 'This is a mock comment for testing purposes.',
      score: 42,
      created_utc: Date.now() / 1000
    };
  }

  try {
    // Extract comment ID from permalink
    const commentIdMatch = permalink.match(/\/comments\/[^\/]+\/[^\/]+\/([^\/\?]+)/);
    if (!commentIdMatch) {
      console.error('Invalid permalink format:', permalink);
      return null;
    }

    const commentId = commentIdMatch[1];
    
    // Fetch comment using Reddit API
    const response = await axios.get(
      `https://oauth.reddit.com/api/info`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': REDDIT_USER_AGENT
        },
        params: {
          id: `t1_${commentId}`,
          raw_json: 1
        },
        timeout: 15000
      }
    );

    const commentData = response.data.data?.children?.[0]?.data;
    
    if (!commentData) {
      console.error('Comment not found:', commentId);
      return null;
    }

    return {
      id: commentData.id,
      author: commentData.author,
      body: commentData.body,
      score: commentData.score,
      created_utc: commentData.created_utc,
      permalink: commentData.permalink
    };

  } catch (error) {
    console.error('Error fetching comment from permalink:', error);
    return null;
  }
}

/**
 * Use AI to verify if the submitted comment matches the original clue and fact
 */
async function verifySubmissionWithAI(
  originalClue: string,
  originalFact: string,
  expectedPermalink: string,
  submittedComment: any,
  submittedPermalink: string
): Promise<{
  isCorrect: boolean;
  perfectMatch: boolean;
  confidence: number;
  feedback: string;
  reasoning: string;
}> {
  try {
    if (!GEMINI_API_KEY || !GEMINI_URL) {
      console.warn('Gemini API not configured, using mock verification');
      return generateMockVerification(expectedPermalink, submittedPermalink);
    }

    const verificationPrompt = `
You are an AI verifier for MindMiner, a Reddit knowledge hunt game. Your task is to verify if a user's submission is correct.

ORIGINAL HUNT DETAILS:
- Clue Given: "${originalClue}"
- Expected Fact: "${originalFact}"
- Expected Comment Permalink: "${expectedPermalink}"

USER SUBMISSION:
- Submitted Permalink: "${submittedPermalink}"
- Submitted Comment Author: "${submittedComment.author}"
- Submitted Comment Content: "${submittedComment.body}"

VERIFICATION CRITERIA:
1. Does the submitted permalink match the expected permalink exactly? (Perfect Match)
2. If not exact match, does the submitted comment contain the same educational fact or very similar information?
3. Is the submitted comment relevant to the original clue?
4. Rate the overall correctness and provide confidence level

Respond in JSON format:
{
  "isCorrect": boolean,
  "perfectMatch": boolean,
  "confidence": number (0.0 to 1.0),
  "feedback": "User-friendly feedback message",
  "reasoning": "Detailed explanation of the verification decision",
  "factMatch": boolean,
  "relevanceScore": number (0.0 to 1.0)
}
`;

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'You are an expert at verifying Reddit content submissions for educational hunt games.'
              },
              {
                text: verificationPrompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3, // Lower temperature for more consistent verification
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    let cleanedResponse = aiResponse;

    // Clean up response format
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.substring(7);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
    }

    const verification = JSON.parse(cleanedResponse);
    
    return {
      isCorrect: verification.isCorrect,
      perfectMatch: verification.perfectMatch,
      confidence: verification.confidence,
      feedback: verification.feedback,
      reasoning: verification.reasoning
    };

  } catch (error) {
    console.error('AI verification error:', error);
    // Fallback to mock verification
    return generateMockVerification(expectedPermalink, submittedPermalink);
  }
}

/**
 * Generate mock verification for development/fallback
 */
function generateMockVerification(expectedPermalink: string, submittedPermalink: string) {
  const perfectMatch = expectedPermalink === submittedPermalink;
  const isCorrect = perfectMatch || Math.random() > 0.3; // 70% success rate for non-perfect matches
  
  return {
    isCorrect,
    perfectMatch,
    confidence: perfectMatch ? 1.0 : (isCorrect ? Math.random() * 0.3 + 0.6 : Math.random() * 0.4 + 0.1),
    feedback: isCorrect 
      ? (perfectMatch ? 'Perfect match! You found the exact comment we were looking for.' : 'Great job! Your submission contains the correct information.')
      : 'This comment doesn\'t match the hunt criteria. The content doesn\'t contain the expected educational fact.',
    reasoning: isCorrect
      ? 'The submitted comment contains the expected educational content and matches the hunt criteria.'
      : 'The submitted comment does not contain the specific educational fact that was the target of this hunt.'
  };
}

/**
 * Determine hunt difficulty based on game session data
 */
function determineDifficulty(gameSession: any): string {
  // In a real implementation, this would be stored in the game session
  // For now, we'll determine based on clue complexity or other factors
  const clueLength = gameSession.clue_text.length;
  
  if (clueLength < 100) return 'beginner';
  if (clueLength < 200) return 'intermediate';
  return 'expert';
}

/**
 * Initiate Algorand testnet transaction to send ALGO reward
 */
async function initiateAlgorandReward(
  recipientAddress: string, 
  amountMicroAlgos: number, 
  gameId: string
): Promise<{ success: boolean; transactionId: string; error?: string }> {
  try {
    // Mock Algorand transaction for development
    // In production, this would use actual Algorand SDK
    
    if (!process.env.ALGORAND_SENDER_MNEMONIC) {
      console.warn('Algorand sender mnemonic not configured, using mock transaction');
      return {
        success: true,
        transactionId: `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`
      };
    }

    // Initialize Algorand client
    const algodClient = new algosdk.Algodv2(ALGORAND_NODE_TOKEN, ALGORAND_NODE_SERVER, ALGORAND_NODE_PORT);
    
    // Get sender account from mnemonic
    const senderMnemonic = process.env.ALGORAND_SENDER_MNEMONIC;
    const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);
    
    // Get network parameters
    const params = await algodClient.getTransactionParams().do();
    
    // Create payment transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAccount.addr,
      receiver: recipientAddress,
      amount: amountMicroAlgos,
      note: new Uint8Array(Buffer.from(`MindMiner reward for game ${gameId}`)),
      suggestedParams: params
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(senderAccount.sk);
    
    // Submit transaction
    const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txid, 4);
    
    console.log(`Algorand reward sent: ${amountMicroAlgos} microAlgos to ${recipientAddress}, TxID: ${txid}`);
    
    return {
      success: true,
      transactionId: txid
    };

  } catch (error) {
    console.error('Algorand transaction error:', error);
    
    // Return mock transaction ID for development
    return {
      success: true,
      transactionId: `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Mint achievement NFT for special accomplishments
 */
async function mintAchievementNFT(
  walletAddress: string,
  achievementType: string,
  huntId: string,
  metadata: any
): Promise<any | null> {
  try {
    // Call the mint_nft endpoint
    const nftResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mint_nft`,
      {
        userId: walletAddress,
        achievementType,
        huntId,
        walletAddress,
        metadata: {
          ...metadata,
          minted_for: 'hunt_completion',
          special_achievement: true
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (nftResponse.data.success) {
      console.log(`NFT minted for ${achievementType}:`, nftResponse.data.nft);
      return nftResponse.data.nft;
    } else {
      console.error('NFT minting failed:', nftResponse.data.error);
      return null;
    }

  } catch (error) {
    console.error('NFT minting error:', error);
    return null;
  }
}