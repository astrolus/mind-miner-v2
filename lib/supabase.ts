import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for frontend operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface User {
  wallet_address: string;
  avg_completion_time: number;
  total_testnet_algo_earned: number;
  total_hunts_completed: number;
  last_general_fact: string;
  created_at: string;
}

export interface GameSession {
  game_id: string;
  user_wallet: string;
  reddit_post_url: string;
  winning_comment_permalink: string;
  clue_text: string;
  extracted_fact: string;
  expiration_timestamp: string;
  status: 'active' | 'won' | 'lost' | 'timeout';
  created_at: string;
  submitted_permalink: string;
  completion_time: number;
  algo_reward: number;
  transaction_id: string;
}

// Database functions
export class DatabaseService {
  
  /**
   * Upsert a user into the users table
   */
  static async upsertUser(userData: Partial<User>): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(userData, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error upserting user:', error);
      return { data: null, error };
    }
  }

  /**
   * Insert a new game session
   */
  static async insertGameSession(sessionData: Partial<GameSession>): Promise<{ data: GameSession | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .insert(sessionData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error inserting game session:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a game session's status and other details
   */
  static async updateGameSession(
    gameId: string, 
    updates: Partial<GameSession>
  ): Promise<{ data: GameSession | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .update(updates)
        .eq('game_id', gameId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating game session:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch a user's stats from the users table
   */
  static async getUserStats(walletAddress: string): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch a specific game session
   */
  static async getGameSession(gameId: string): Promise<{ data: GameSession | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching game session:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's active game sessions
   */
  static async getUserActiveGameSessions(walletAddress: string): Promise<{ data: GameSession[] | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .select('*')
        .eq('user_wallet', walletAddress)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching active game sessions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's game session history
   */
  static async getUserGameHistory(
    walletAddress: string, 
    limit: number = 10
  ): Promise<{ data: GameSession[] | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .select('*')
        .eq('user_wallet', walletAddress)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error fetching game history:', error);
      return { data: null, error };
    }
  }

  /**
   * Update user statistics after hunt completion
   */
  static async updateUserStatsAfterHunt(
    walletAddress: string,
    completionTime: number,
    algoEarned: number,
    completed: boolean
  ): Promise<{ data: User | null; error: any }> {
    try {
      // First get current stats
      const { data: currentUser, error: fetchError } = await this.getUserStats(walletAddress);
      
      if (fetchError || !currentUser) {
        return { data: null, error: fetchError };
      }

      // Calculate new averages and totals
      const newTotalHunts = completed ? currentUser.total_hunts_completed + 1 : currentUser.total_hunts_completed;
      const newTotalAlgo = currentUser.total_testnet_algo_earned + algoEarned;
      
      // Calculate new average completion time (only for completed hunts)
      let newAvgTime = currentUser.avg_completion_time;
      if (completed && newTotalHunts > 0) {
        const totalTime = (currentUser.avg_completion_time * currentUser.total_hunts_completed) + completionTime;
        newAvgTime = totalTime / newTotalHunts;
      }

      const updates = {
        avg_completion_time: newAvgTime,
        total_testnet_algo_earned: newTotalAlgo,
        total_hunts_completed: newTotalHunts
      };

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user stats after hunt:', error);
      return { data: null, error };
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(
    orderBy: 'total_testnet_algo_earned' | 'total_hunts_completed' | 'avg_completion_time' = 'total_testnet_algo_earned',
    limit: number = 10
  ): Promise<{ data: Partial<User>[] | null; error: any }> {
    try {
      const ascending = orderBy === 'avg_completion_time'; // Lower time is better
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('wallet_address, total_testnet_algo_earned, total_hunts_completed, avg_completion_time')
        .order(orderBy, { ascending })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { data: null, error };
    }
  }

  /**
   * Clean up expired game sessions
   */
  static async cleanupExpiredSessions(): Promise<{ count: number; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('game_sessions')
        .update({ status: 'timeout' })
        .eq('status', 'active')
        .lt('expiration_timestamp', new Date().toISOString())
        .select('game_id');

      return { count: data?.length || 0, error };
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return { count: 0, error };
    }
  }
}