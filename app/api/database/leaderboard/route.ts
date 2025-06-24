import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

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
    const orderBy = searchParams.get('order_by') as 'total_testnet_algo_earned' | 'total_hunts_completed' | 'avg_completion_time' || 'total_testnet_algo_earned';
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await DatabaseService.getLeaderboard(orderBy, limit);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Add ranking to the results
    const leaderboard = (data || []).map((user, index) => ({
      ...user,
      rank: index + 1, 
      wallet_display: `${user.wallet_address?.slice(0, 6)}...${user.wallet_address?.slice(-4)}`
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
      order_by: orderBy
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}