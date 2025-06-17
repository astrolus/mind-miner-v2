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

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    if (!userData.wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data, error } = await DatabaseService.upsertUser(userData);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to upsert user' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: 'User upserted successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Upsert user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data, error } = await DatabaseService.getUserStats(walletAddress);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user stats' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
      found: !!data
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { wallet_address, completion_time, algo_earned, completed } = await request.json();

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data, error } = await DatabaseService.updateUserStatsAfterHunt(
      wallet_address,
      completion_time || 0,
      algo_earned || 0,
      completed || false
    );

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update user stats' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: 'User stats updated successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Update user stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}