/*
  # Create users and game_sessions tables

  1. New Tables
    - `users`
      - `wallet_address` (text, primary key) - unique identifier for the user
      - `avg_completion_time` (decimal) - average time to complete hunts in minutes
      - `total_testnet_algo_earned` (decimal) - total testnet ALGO earned
      - `total_hunts_completed` (integer) - count of completed hunts
      - `last_general_fact` (text) - last general fun fact displayed
      - `created_at` (timestamptz) - account creation timestamp
    
    - `game_sessions`
      - `game_id` (uuid, primary key) - unique identifier for each game session
      - `user_wallet` (text, foreign key) - references users.wallet_address
      - `reddit_post_url` (text) - URL of the Reddit post used for the hunt
      - `winning_comment_permalink` (text) - permalink of the winning comment
      - `clue_text` (text) - AI-generated clue given to the player
      - `extracted_fact` (text) - educational fact extracted from the comment
      - `expiration_timestamp` (timestamptz) - when the hunt expires
      - `status` (text) - hunt status (active, won, lost, timeout)
      - `created_at` (timestamptz) - session creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  wallet_address text PRIMARY KEY,
  avg_completion_time decimal DEFAULT 0,
  total_testnet_algo_earned decimal DEFAULT 0,
  total_hunts_completed integer DEFAULT 0,
  last_general_fact text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  game_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  reddit_post_url text DEFAULT '',
  winning_comment_permalink text DEFAULT '',
  clue_text text DEFAULT '',
  extracted_fact text DEFAULT '',
  expiration_timestamp timestamptz DEFAULT now() + interval '30 minutes',
  status text DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'timeout')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_wallet ON game_sessions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'wallet_address')
  WITH CHECK (wallet_address = auth.jwt() ->> 'wallet_address');

-- Create policies for game_sessions table
CREATE POLICY "Users can read own game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (user_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can insert own game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update own game sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (user_wallet = auth.jwt() ->> 'wallet_address')
  WITH CHECK (user_wallet = auth.jwt() ->> 'wallet_address');

-- Allow public read access for leaderboards (optional)
CREATE POLICY "Public read access for leaderboards"
  ON users
  FOR SELECT
  TO anon
  USING (true);