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
    const { count, error } = await DatabaseService.cleanupExpiredSessions();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup expired sessions' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      expired_sessions_updated: count,
      message: `${count} expired sessions marked as timeout`
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}