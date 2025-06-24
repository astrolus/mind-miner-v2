import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';

// Algorand testnet configuration
const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const address = searchParams.get('address');

  try {
    switch (action) {
      case 'balance':
        return await getAccountBalance(address || '');
      case 'transactions':
        return await getAccountTransactions(address || '');
      case 'status':
        return await getNetworkStatus();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Blockchain API error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'reward':
        return await processReward(data);
      case 'create_nft':
        return await createAchievementNFT(data);
      case 'verify_wallet':
        return await verifyWallet(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getAccountBalance(address: string) {
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const accountInfo = await algodClient.accountInformation(address).do();
  
  return NextResponse.json({
    address,
    balance: accountInfo.amount,
    balanceAlgo: Number(accountInfo.amount) / 1000000, // Convert microAlgos to Algos
    assets: accountInfo.assets || [],
    participation: accountInfo.participation || null
  });
}

async function getAccountTransactions(address: string) {
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Mock transaction data - in production, use Algorand indexer
  const mockTransactions = [
    {
      id: 'TX1',
      type: 'reward',
      amount: 100,
      timestamp: Date.now() - 3600000,
      status: 'confirmed',
      huntId: 'HUNT_001'
    },
    {
      id: 'TX2',
      type: 'nft_mint',
      amount: 0,
      timestamp: Date.now() - 7200000,
      status: 'confirmed',
      achievementId: 'ACH_001'
    }
  ];

  return NextResponse.json({
    address,
    transactions: mockTransactions
  });
}

async function getNetworkStatus() {
  const status = await algodClient.status().do();
  
  return NextResponse.json({ 
    lastRound: status.lastRound,
    lastConsensusVersion: status.lastVersion,
    nextConsensusVersion: status.nextVersion,
    nextConsensusVersionRound: status.nextVersionRound,
    nextConsensusVersionSupported: status.nextVersionSupported,
    timeSinceLastRound: status.timeSinceLastRound,
    catchupTime: status.catchupTime
  });
}

async function processReward({ userAddress, amount, huntId, reason }: any) {
  if (!userAddress || !amount || !huntId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Mock reward processing - in production, create and sign actual transaction
  const mockTransaction = {
    id: `REWARD_${Date.now()}`,
    from: 'REWARD_POOL_ADDRESS',
    to: userAddress,
    amount: amount * 1000000, // Convert to microAlgos
    type: 'payment',
    huntId,
    reason,
    status: 'pending',
    timestamp: Date.now()
  };

  // Simulate blockchain confirmation delay
  setTimeout(() => {
    mockTransaction.status = 'confirmed';
  }, 3000);

  return NextResponse.json({
    success: true,
    transaction: mockTransaction,
    message: `${amount} ALGO reward initiated for ${reason}`
  });
}

async function createAchievementNFT({ userAddress, achievementType, metadata }: any) {
  if (!userAddress || !achievementType) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Mock NFT creation - in production, create actual ASA (Algorand Standard Asset)
  const mockNFT = {
    assetId: Date.now(),
    name: `MindMiner Achievement: ${achievementType}`,
    unitName: 'MMACH',
    total: 1,
    decimals: 0,
    creator: 'MINDMINER_CREATOR_ADDRESS',
    owner: userAddress,
    metadata: {
      ...metadata,
      standard: 'arc3',
      created: new Date().toISOString(),
      type: achievementType
    },
    status: 'minted'
  };

  return NextResponse.json({
    success: true,
    nft: mockNFT,
    message: `Achievement NFT created for ${achievementType}`
  });
}

async function verifyWallet({ address, signature, message }: any) {
  if (!address || !signature || !message) {
    return NextResponse.json({ error: 'Missing verification parameters' }, { status: 400 });
  }

  try {
    // Mock wallet verification - in production, verify actual signature
    const isValid = algosdk.isValidAddress(address);
    
    return NextResponse.json({
      valid: isValid,
      address,
      verified: true,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: 'Invalid signature or address'
    }, { status: 400 });
  }
}