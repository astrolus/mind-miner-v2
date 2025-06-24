import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: nfts, error: dbError } = await DatabaseService.getNFTsByWalletAddress(userId);

    if (dbError) {
      console.error('Error fetching NFTs from DB:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve NFTs', details: dbError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      nfts: nfts || [],
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Get NFTs API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve NFTs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}