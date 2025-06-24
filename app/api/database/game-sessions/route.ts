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
    const sessionData = await request.json();

    if (!sessionData.user_wallet) {
      return NextResponse.json(
        { error: 'User wallet is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Set default expiration if not provided (30 minutes from now)
    if (!sessionData.expiration_timestamp) {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 5);
      sessionData.expiration_timestamp = expirationTime.toISOString();
    }

    const { data, error } = await DatabaseService.insertGameSession(sessionData);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create game session' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
      message: 'Game session created successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Create game session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const userWallet = searchParams.get('user_wallet');
    const type = searchParams.get('type'); // 'active', 'history'

    if (gameId) {
      // Get specific game session
      const { data, error } = await DatabaseService.getGameSession(gameId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch game session' },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        success: true,
        session: data,
        found: !!data
      }, { headers: corsHeaders });

    } else if (userWallet) {
      // Get user's game sessions
      let result;
      
      if (type === 'active') {
        result = await DatabaseService.getUserActiveGameSessions(userWallet);
      } else {
        const limit = parseInt(searchParams.get('limit') || '10');
        result = await DatabaseService.getUserGameHistory(userWallet, limit);
      }

      const { data, error } = result;

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch game sessions' },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        success: true,
        sessions: data || [],
        count: data?.length || 0
      }, { headers: corsHeaders });

    } else {
      return NextResponse.json(
        { error: 'Either game_id or user_wallet is required' },
        { status: 400, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('Get game sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { game_id, ...updates } = await request.json();

    if (!game_id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data, error } = await DatabaseService.updateGameSession(game_id, updates);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update game session' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
      message: 'Game session updated successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Update game session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}