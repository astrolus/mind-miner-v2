import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import axios from 'axios';
// Done with this endpoint
// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Predefined subreddits for hunt selection
const HUNT_SUBREDDITS = [
  'todayilearned',
  'explainlikeimfive',
  'science',
  'technology',
  'askscience',
  'history',
  'space',
  'futurology',
  'psychology',
  'philosophy'
];

// Reddit API configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = 'MindMiner:1.0.0 (by /u/mindminer)';

// OpenAI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = process.env.GEMINI_URL;

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { wallet_address } = await request.json();

    // Validate required parameters
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Starting hunt for wallet: ${wallet_address}`);

    // Step 1: Ensure user exists in database
    await ensureUserExists(wallet_address);

    // Step 2: Get Reddit access token
    const redditToken = await getRedditAccessToken();
    if (!redditToken) {
      throw new Error('Failed to authenticate with Reddit API');
    }

    // Step 3: Select random subreddit and find suitable post
    const { subreddit, post } = await findSuitablePost(redditToken);
    if (!post) {
      throw new Error('No suitable posts found after multiple attempts');
    }

    console.log(`Selected post: ${post.id} from r/${subreddit}`);

    // Step 4: Fetch all comments for the chosen post
    const comments = await fetchPostComments(redditToken, post.id);
    if (!comments || comments.length === 0) {
      throw new Error('No comments found for selected post');
    }

    console.log(`Fetched ${comments.length} comments`);

    // Step 5: Use AI to analyze comments and generate clue
    const aiAnalysis = await analyzeCommentsWithAI(post, comments);
    if (!aiAnalysis) {
      throw new Error('AI analysis failed');
    }

    // Step 6: Generate general fun fact using AI
    const generalFact = await generateGeneralFact();

    // Step 7: Store game session in database
    const gameSession = await createGameSession(
      wallet_address,
      post,
      subreddit,
      aiAnalysis,
      generalFact
    );
    console

    // Step 8: Return response to frontend
    return NextResponse.json({
      success: true,
      game_id: gameSession.game_id,
      reddit_post_url: `https://reddit.com/r/${subreddit}/comments/${post.id}`,
      clue: aiAnalysis.clue,
      general_fact: generalFact,
      subreddit: `r/${subreddit}`,
      expiration_time: gameSession.expiration_timestamp,
      hunt_details: {
        post_title: post.title,
        post_score: post.score,
        comment_count: post.num_comments,
        difficulty: determineDifficulty(post.num_comments, post.score)
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Start hunt error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start hunt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Ensure user exists in database, create if not
 */
async function ensureUserExists(walletAddress: string) {
  const { data: existingUser } = await DatabaseService.getUserStats(walletAddress);
  
  if (!existingUser) {
    console.log(`Creating new user: ${walletAddress}`);
    await DatabaseService.upsertUser({
      wallet_address: walletAddress,
      avg_completion_time: 0,
      total_testnet_algo_earned: 0,
      total_hunts_completed: 0,
      last_general_fact: ''
    });
  }
}

/**
 * Get Reddit API access token
 */
async function getRedditAccessToken(): Promise<string | null> {
  try {
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
      console.warn('Reddit API credentials not configured, using mock data');
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
 * Find a suitable post with retry logic
 */
async function findSuitablePost(token: string, maxAttempts: number = 5): Promise<{ subreddit: string; post: any }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Randomly select a subreddit
      const subreddit = HUNT_SUBREDDITS[Math.floor(Math.random() * HUNT_SUBREDDITS.length)];
      console.log(`Attempt ${attempt}: Searching r/${subreddit}`);

      // Fetch hot posts from subreddit
      const posts = await fetchSubredditPosts(token, subreddit);
      
      // Filter posts with num_comments <= 20
      const suitablePosts = posts.filter((post: any) => 
        post.num_comments > 0 && 
        post.num_comments <= 20 &&
        !post.stickied &&
        !post.is_self === false // Prefer link posts
      );

      if (suitablePosts.length > 0) {
        // Randomly select from suitable posts
        const selectedPost = suitablePosts[Math.floor(Math.random() * suitablePosts.length)];
        return { subreddit, post: selectedPost };
      }

      console.log(`No suitable posts found in r/${subreddit}, trying another subreddit...`);
      
      // Wait before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error in attempt ${attempt}:`, error);
      if (attempt === maxAttempts) throw error;
    }
  }

  throw new Error('No suitable posts found after all attempts');
}

/**
 * Fetch posts from a subreddit
 */
async function fetchSubredditPosts(token: string, subreddit: string): Promise<any[]> {
  if (token === 'mock_token') {
    // Return mock data for development
    return generateMockPosts();
  }

  try {
    const response = await axios.get(
      `https://oauth.reddit.com/r/${subreddit}/hot`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': REDDIT_USER_AGENT
        },
        params: {
          limit: 25,
          raw_json: 1
        },
        timeout: 15000
      }
    );

    return response.data.data.children.map((child: any) => child.data);
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch all comments for a post
 */
async function fetchPostComments(token: string, postId: string): Promise<any[]> {
  if (token === 'mock_token') {
    // Return mock comments for development
    return generateMockComments();
  }

  try {
    const response = await axios.get(
      `https://oauth.reddit.com/comments/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': REDDIT_USER_AGENT
        },
        params: {
          raw_json: 1,
          limit: 100
        },
        timeout: 15000
      }
    );

    // Extract comments from Reddit's nested structure
    const commentsData = response.data[1]?.data?.children || [];
    console.log(commentsData);
    return flattenComments(commentsData);
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
}

/**
 * Flatten Reddit's nested comment structure
 */
function flattenComments(comments: any[]): any[] {
  const flattened: any[] = [];
  
  function processComment(comment: any) {
    if (comment.kind === 't1' && comment.data.body && comment.data.body !== '[deleted]') {
      flattened.push({
        id: comment.data.id,
        author: comment.data.author,
        body: comment.data.body,
        score: comment.data.score,
        created_utc: comment.data.created_utc,
        permalink: comment.data.permalink
      });
    }
    
    // Process replies
    if (comment.data.replies && comment.data.replies.data) {
      comment.data.replies.data.children.forEach(processComment);
    }
  }
  
  comments.forEach(processComment);
  return flattened;
}

/**
 * Analyze comments with AI to extract educational fact and generate clue
 */
async function analyzeCommentsWithAI(post: any, comments: any[]): Promise<{ clue: string; fact: string; winningComment: any } | null> {
  try {
    if (!GEMINI_API_KEY || !GEMINI_URL) {
      console.warn('Gemini API key not configured, using mock AI analysis');
      return generateMockAIAnalysis(comments);
    }

    // Prepare content for AI analysis
    const postContent = `Title: ${post.title}\nContent: ${post.selftext || 'Link post'}`;
    const commentsText = comments
      .slice(0, 10) // Limit to first 10 comments for token efficiency
      .map(c => `Comment by ${c.author}: ${c.body}`)
      .join('\n\n');

    const sysPrompt = `
You are an AI assistant for MindMiner, a Reddit knowledge hunt game. Analyze the following Reddit post and comments to:

1. Extract the most educational/interesting fact from the comments
2. Generate a "Ctrl+F resistant" clue that guides players to find the specific comment containing this fact
3. Identify which comment contains the winning fact

POST:
${postContent}

COMMENTS:
${commentsText}

REQUIREMENTS:
- The clue should be specific enough to guide players but not so obvious that they can just Ctrl+F for keywords
- Focus on educational value and interesting facts
- The clue should describe what to look for rather than exact words to search
- Choose a comment that contains genuinely interesting information

Respond in JSON format:
{
  "fact": "The educational fact extracted from the winning comment",
  "clue": "A Ctrl+F resistant clue that guides players to the winning comment",
  "winning_comment_id": "The ID of the comment containing the fact",
  "reasoning": "Brief explanation of why this comment was chosen",
  "index": "Provide the index in the comments array of the winning comment"
}
`;

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [ // Changed from 'messages' to 'contents'
          {
            role: 'user', // For a single-turn prompt, the user provides all input
            parts: [
              {
                text: 'You are an expert at analyzing Reddit content and creating engaging educational hunt clues.' // System instructions are often merged into the first user part
              },
              {
                text: sysPrompt // Your main prompt content comes as another text part
              }
            ]
          }
        ],
        generationConfig: { // Changed from top-level 'max_tokens' to 'generationConfig' object
          maxOutputTokens: 500, // Changed from 'max_tokens' to 'maxOutputTokens'
          temperature: 0.7,
          // You can add other parameters here like topK, topP if needed
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY // Ensure this is your correct Google AI Studio/Gemini API key
        },
        timeout: 30000
      }
    );
    console.log('AI response', response.data.candidates?.[0]?.content?.parts?.[0]?.text);
    const aiResponse = await response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    let cleanedAIReponse = aiResponse;
    // Remove markdown code block wrappers if they exist
    if (cleanedAIReponse.startsWith('```json')) {
      cleanedAIReponse = cleanedAIReponse.substring(7); // Remove '```json'
    }
    if (cleanedAIReponse.endsWith('```')) {
      cleanedAIReponse = cleanedAIReponse.substring(0, cleanedAIReponse.length - 3); // Remove '```'
    }
    console.log(JSON.parse(cleanedAIReponse));
    console.log(JSON.parse(cleanedAIReponse).index);
    const winningComment = comments[parseInt(JSON.parse(cleanedAIReponse).index)];

    if (!winningComment) {
      throw new Error('AI selected invalid comment ID');
    }

    return {
      clue: JSON.parse(cleanedAIReponse).clue,
      fact: JSON.parse(cleanedAIReponse).fact,
      winningComment
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to mock analysis
    return generateMockAIAnalysis(comments);
  }
}

/**
 * Generate a general fun fact using AI
 */
async function generateGeneralFact(): Promise<string> {
  try {
    if (!GEMINI_API_KEY || !GEMINI_URL) {
      return generateMockGeneralFact();
    }

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'You are an expert at analyzing Reddit content and creating engaging educational hunt clues. Generate a fascinating, educational fun fact that would interest Reddit users. Make it surprising and memorable. Keep it under 150 words.'              }
            ]
          }
        ],
        generationConfig: { // Use generationConfig for model parameters
          maxOutputTokens: 500, // <--- Change 'max_tokens' to 'maxOutputTokens'
          temperature: 0.7,
        },
      },
      {
        headers: {
          'x-goog-api-key': GEMINI_API_KEY, // Ensure this is your Google AI Studio/Gemini API key, not an OpenAI key
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('General fact generation error:', error);
    return generateMockGeneralFact();
  }
}

/**
 * Create game session in database
 */
async function createGameSession(
  walletAddress: string,
  post: any,
  subreddit: string,
  aiAnalysis: any,
  generalFact: string
) {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30); // 30 minutes from now

  const sessionData = {
    user_wallet: walletAddress,
    reddit_post_url: `https://reddit.com/r/${subreddit}/comments/${post.id}`,
    winning_comment_permalink: aiAnalysis.winningComment.permalink,
    clue_text: aiAnalysis.clue,
    extracted_fact: aiAnalysis.fact,
    expiration_timestamp: expirationTime.toISOString(),
    status: 'active' as const
  };

  const { data, error } = await DatabaseService.insertGameSession(sessionData);
  
  if (error) {
    throw new Error(`Failed to create game session: ${error.message}`);
  }

  // Update user's last general fact
  await DatabaseService.upsertUser({
    wallet_address: walletAddress,
    last_general_fact: generalFact
  });

  return data!;
}

/**
 * Determine hunt difficulty based on post metrics
 */
function determineDifficulty(commentCount: number, score: number): string {
  if (commentCount <= 5 && score < 100) return 'beginner';
  if (commentCount <= 15 && score < 500) return 'intermediate';
  return 'expert';
}

// Mock data generators for development
function generateMockPosts(): any[] {
  return [
    {
      id: 'mock_post_1',
      title: 'TIL that octopuses have three hearts and blue blood',
      selftext: '',
      score: 1247,
      num_comments: 15,
      created_utc: Date.now() / 1000,
      stickied: false,
      is_self: false
    },
    {
      id: 'mock_post_2',
      title: 'ELI5: Why do we get brain freeze when eating cold things?',
      selftext: 'I never understood this phenomenon...',
      score: 892,
      num_comments: 8,
      created_utc: Date.now() / 1000,
      stickied: false,
      is_self: true
    }
  ];
}

function generateMockComments(): any[] {
  return [
    {
      id: 'comment_1',
      author: 'ScienceExpert',
      body: 'Octopuses actually have three hearts because two pump blood to the gills while the third pumps blood to the rest of the body. Their blue blood comes from copper-based hemocyanin instead of iron-based hemoglobin.',
      score: 156,
      created_utc: Date.now() / 1000,
      permalink: '/r/todayilearned/comments/mock_post_1/comment_1'
    },
    {
      id: 'comment_2',
      author: 'CuriousUser',
      body: 'That\'s fascinating! I had no idea about the copper-based blood.',
      score: 23,
      created_utc: Date.now() / 1000,
      permalink: '/r/todayilearned/comments/mock_post_1/comment_2'
    }
  ];
}

function generateMockAIAnalysis(comments: any[]) {
  const winningComment = comments[0];
  return {
    clue: 'Look for a comment that explains the biological reason behind an unusual cardiovascular system and mentions a specific metal that gives blood its unique color.',
    fact: 'Octopuses have three hearts and blue blood due to copper-based hemocyanin instead of iron-based hemoglobin.',
    winningComment
  };
}

function generateMockGeneralFact(): string {
  const facts = [
    'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
    'A group of flamingos is called a "flamboyance." These birds get their pink color from the carotenoids in the algae and crustaceans they eat.',
    'The human brain uses about 20% of the body\'s total energy, despite only making up about 2% of body weight.',
    'Bananas are berries, but strawberries aren\'t. Botanically speaking, berries must have seeds inside their flesh.',
    'There are more possible games of chess than there are atoms in the observable universe.'
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
}