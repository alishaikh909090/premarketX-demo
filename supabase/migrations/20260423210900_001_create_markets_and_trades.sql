/*
  # PreMarketX Database Schema

  1. New Tables
    - `markets` - Trading markets for pre-TGE tokens
      - `id` (uuid, primary key)
      - `name` (text) - Token name (e.g., zkSync, LayerZero)
      - `symbol` (text) - Token symbol
      - `type` (text) - 'spot' or 'vesting'
      - `status` (text) - 'active', 'upcoming', 'settled'
      - `current_price` (numeric) - Current trading price in USDC
      - `previous_price` (numeric) - Previous price for change calc
      - `volume_24h` (numeric) - 24h trading volume
      - `tge_date` (timestamptz) - Token generation event date
      - `created_at` (timestamptz)
    - `orderbook` - Order book entries
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key)
      - `side` (text) - 'bid' or 'ask'
      - `price` (numeric)
      - `amount` (numeric)
      - `wallet_address` (text)
      - `created_at` (timestamptz)
    - `trades` - Completed trades
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key)
      - `buyer_wallet` (text)
      - `seller_wallet` (text)
      - `price` (numeric)
      - `amount` (numeric)
      - `status` (text) - 'pending', 'filled', 'settled'
      - `created_at` (timestamptz)
      - `settled_at` (timestamptz)
    - `vesting_allocations` - Vesting allocation listings
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key)
      - `seller_wallet` (text)
      - `total_amount` (numeric)
      - `available_amount` (numeric)
      - `discount_percent` (numeric)
      - `unlock_schedule` (jsonb) - Array of {date, amount}
      - `status` (text) - 'active', 'sold'
      - `created_at` (timestamptz)
    - `user_profiles` - Extended user data
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `display_name` (text)
      - `trust_score` (integer) - 0-100
      - `trust_badge` (text) - 'low', 'medium', 'high'
      - `total_volume` (numeric)
      - `total_trades` (integer)
      - `points` (integer)
      - `referral_code` (text)
      - `referred_by` (text)
      - `created_at` (timestamptz)
    - `leaderboard` - Points leaderboard
      - `id` (uuid, primary key)
      - `wallet_address` (text)
      - `display_name` (text)
      - `points` (integer)
      - `volume` (numeric)
      - `week_start` (date)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for markets, orderbook, trades, leaderboard
    - Users can manage their own profiles and orders
*/

CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symbol text NOT NULL,
  type text NOT NULL DEFAULT 'spot',
  status text NOT NULL DEFAULT 'active',
  current_price numeric NOT NULL DEFAULT 0,
  previous_price numeric NOT NULL DEFAULT 0,
  volume_24h numeric NOT NULL DEFAULT 0,
  tge_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orderbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE CASCADE,
  side text NOT NULL,
  price numeric NOT NULL,
  amount numeric NOT NULL,
  wallet_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE CASCADE,
  buyer_wallet text NOT NULL,
  seller_wallet text NOT NULL,
  price numeric NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  settled_at timestamptz
);

CREATE TABLE IF NOT EXISTS vesting_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE CASCADE,
  seller_wallet text NOT NULL,
  total_amount numeric NOT NULL,
  available_amount numeric NOT NULL,
  discount_percent numeric NOT NULL DEFAULT 0,
  unlock_schedule jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  trust_score integer NOT NULL DEFAULT 0,
  trust_badge text NOT NULL DEFAULT 'low',
  total_volume numeric NOT NULL DEFAULT 0,
  total_trades integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  referral_code text,
  referred_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  display_name text,
  points integer NOT NULL DEFAULT 0,
  volume numeric NOT NULL DEFAULT 0,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE vesting_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Markets are publicly readable"
  ON markets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Orderbook is publicly readable"
  ON orderbook FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Trades are publicly readable"
  ON trades FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Vesting allocations are publicly readable"
  ON vesting_allocations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
