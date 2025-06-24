import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService, NFT } from '@/lib/supabase';
// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      achievementType, 
      huntId, 
      metadata,
      walletAddress 
    } = await request.json();

    // Validate required parameters
    if (!userId || !achievementType || !walletAddress) {
      return NextResponse.json(
        { error: 'User ID, achievement type, and wallet address are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate wallet address format (basic Algorand address validation)
    if (!isValidAlgorandAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Algorand wallet address' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate NFT metadata
    const nftMetadata = generateNFTMetadata(achievementType, huntId, metadata);
    
    // Mock NFT minting process - in production, this would:
    // 1. Create Algorand Standard Asset (ASA)
    // 2. Set proper metadata following ARC-3 standard
    // 3. Transfer to user's wallet
    // 4. Record transaction on blockchain
    
    const mintResult = await mockMintNFT(userId, walletAddress, nftMetadata);

    if (!mintResult.success) {
      return NextResponse.json(
        { error: mintResult.error },
        { status: 500, headers: corsHeaders }
      );
    }

    // Record NFT in database using Supabase
    const newNft: Partial<NFT> = {
      id: mintResult.nftId, // Use the generated NFT ID
      user_wallet: walletAddress,
      achievement_type: achievementType,
      hunt_id: huntId,
      metadata: nftMetadata, // Store the full generated metadata
      mint_date: new Date().toISOString(), // Use current ISO timestamp
      transaction_id: mintResult.transactionId,
    };

    const { data: insertedNft, error: dbInsertError } = await DatabaseService.insertNFT(newNft);

    if (dbInsertError) {
      console.error('Error inserting NFT into DB:', dbInsertError);
      // If DB insertion fails, we still consider the mint successful from the blockchain perspective
      // but return an error indicating the DB record failed.
      return NextResponse.json(
        {
          success: false,
          error: 'NFT minted but failed to record in database',
          details: dbInsertError.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      nft: { ...insertedNft, assetId: mintResult.assetId, status: 'minted', rarity: determineRarity(achievementType), imageUrl: generateNFTImageUrl(achievementType, nftMetadata) },
      transaction: {
        id: mintResult.transactionId,
        assetId: mintResult.assetId,
        status: 'confirmed'
      },
      message: `Achievement NFT "${nftMetadata.name}" minted successfully!`
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Mint NFT error:', error);
    return NextResponse.json(
      { error: 'Failed to mint NFT' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: 'Either User ID or wallet address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get user's NFT collection
    const nftCollection = await getUserNFTs(userId, walletAddress);

    return NextResponse.json({
      success: true,
      nfts: nftCollection,
      totalCount: nftCollection.length,
      lastUpdated: Date.now()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Get NFTs error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve NFTs' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function isValidAlgorandAddress(address: string): boolean {
  // Basic Algorand address validation
  // Real validation would use algosdk.isValidAddress()
  return address.length === 58 && /^[A-Z2-7]+$/.test(address);
}

function generateNFTMetadata(achievementType: string, huntId?: string, customMetadata?: any) {
  const baseMetadata = {
    name: `MindMiner Achievement: ${formatAchievementName(achievementType)}`,
    description: getAchievementDescription(achievementType),
    image: `https://mindminer.app/nft-images/${achievementType}.png`,
    external_url: 'https://mindminer.app',
    attributes: [
      {
        trait_type: 'Achievement Type',
        value: achievementType
      },
      {
        trait_type: 'Rarity',
        value: determineRarity(achievementType)
      },
      {
        trait_type: 'Minted Date',
        value: new Date().toISOString().split('T')[0]
      }
    ],
    properties: {
      category: 'Achievement',
      creators: [
        {
          address: 'MINDMINER_CREATOR_ADDRESS',
          share: 100
        }
      ]
    }
  };

  // Add hunt-specific metadata
  if (huntId) {
    baseMetadata.attributes.push({
      trait_type: 'Hunt ID',
      value: huntId
    });
  }

  // Merge custom metadata
  if (customMetadata) {
    return {
      ...baseMetadata,
      ...customMetadata,
      attributes: [...baseMetadata.attributes, ...(customMetadata.attributes || [])]
    };
  }

  return baseMetadata;
}

function formatAchievementName(achievementType: string): string {
  return achievementType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getAchievementDescription(achievementType: string): string {
  const descriptions = {
    first_discovery: 'Commemorates your very first successful knowledge hunt on MindMiner.',
    speed_demon: 'Awarded for completing multiple hunts with exceptional speed and accuracy.',
    science_explorer: 'Recognizes mastery in discovering scientific knowledge and research.',
    perfect_streak: 'Celebrates an impressive streak of consecutive successful hunts.',
    community_champion: 'Honors outstanding contributions to the MindMiner community.',
    knowledge_sage: 'The highest honor for accumulated wisdom and discovery achievements.',
    crypto_detective: 'Specialized achievement for uncovering blockchain and crypto insights.',
    tech_pioneer: 'Awarded for discovering cutting-edge technology discussions and innovations.'
  };

  return descriptions[achievementType as keyof typeof descriptions] || 
         `Special achievement earned through exceptional performance in MindMiner hunts.`;
}

function determineRarity(achievementType: string): string {
  const rarityMap = {
    first_discovery: 'common',
    speed_demon: 'rare',
    science_explorer: 'rare',
    perfect_streak: 'epic',
    community_champion: 'epic',
    knowledge_sage: 'legendary',
    crypto_detective: 'rare',
    tech_pioneer: 'rare'
  };

  return rarityMap[achievementType as keyof typeof rarityMap] || 'common';
}

function generateNFTImageUrl(achievementType: string, metadata: any): string {
  // In production, this would generate or retrieve actual NFT artwork
  const imageMap = {
    first_discovery: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    speed_demon: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    science_explorer: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
    perfect_streak: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400',
    community_champion: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
    knowledge_sage: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
    crypto_detective: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
    tech_pioneer: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400'
  };

  return imageMap[achievementType as keyof typeof imageMap] || 
         'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400';
}

async function mockMintNFT(userId: string, walletAddress: string, metadata: any) {
  // Mock NFT minting - in production, this would use Algorand SDK
  try {
    const assetId = Date.now() + Math.floor(Math.random() * 1000);
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
    const nftId = `NFT_${assetId}`;

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      nftId,
      assetId,
      transactionId,
      blockNumber: Math.floor(Math.random() * 1000000) + 500000
    };
  } catch (error) {
    return {
      success: false,
      error: 'Blockchain transaction failed'
    };
  }
}

async function getUserNFTs(userId?: string | null, walletAddress?: string | null) {
  // Mock NFT collection - in production, query blockchain and database
  const mockNFTs = [
    {
      id: 'NFT_001',
      assetId: 1001,
      name: 'First Discovery',
      description: 'Your first successful hunt',
      imageUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
      rarity: 'common',
      mintedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      achievementType: 'first_discovery'
    },
    {
      id: 'NFT_002',
      assetId: 1002,
      name: 'Science Explorer',
      description: 'Master of scientific discoveries',
      imageUrl: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
      rarity: 'rare',
      mintedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      achievementType: 'science_explorer'
    }
  ];

  return mockNFTs;
}