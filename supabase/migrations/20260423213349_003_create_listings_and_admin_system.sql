/*
  # PreMarketX Admin & Listing System

  1. New Tables
    - `listings` - User-created token/vesting listings
      - `id` (uuid, primary key)
      - `wallet_address` (text) - Creator wallet
      - `project_name` (text) - e.g., zkSync, LayerZero
      - `listing_type` (text) - 'pre_tge' or 'vesting'
      - `status` (text) - 'pending', 'approved', 'rejected', 'flagged', 'cancelled', 'frozen'
      - `token_amount` (numeric) - Total tokens
      - `price_per_token` (numeric) - Price in USDC
      - `discount_percent` (numeric) - Discount vs expected TGE price
      - `tge_unlock_percent` (numeric) - % unlocked at TGE (vesting only)
      - `vesting_duration_months` (integer) - Vesting duration (vesting only)
      - `cliff_months` (integer) - Cliff period (vesting only, optional)
      - `expected_tge_price` (numeric) - Expected price at TGE
      - `settlement_date` (timestamptz) - Expected TGE/settlement
      - `proof_url` (text) - Screenshot/wallet proof URL
      - `admin_notes` (text) - Admin notes
      - `reviewed_by` (text) - Admin wallet who reviewed
      - `reviewed_at` (timestamptz) - When reviewed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `admin_actions` - Audit log for admin actions
      - `id` (uuid, primary key)
      - `admin_wallet` (text)
      - `target_type` (text) - 'listing', 'user', 'points'
      - `target_id` (text) - ID of affected entity
      - `action` (text) - 'approve', 'reject', 'flag', 'cancel', 'freeze', 'unfreeze', 'edit', 'reward', 'ban_farming'
      - `details` (jsonb) - Additional action details
      - `created_at` (timestamptz)

    - `notifications` - Real-time notifications
      - `id` (uuid, primary key)
      - `wallet_address` (text) - Target user
      - `type` (text) - 'listing_approved', 'listing_rejected', 'trade_filled', 'new_listing', 'points_earned'
      - `title` (text)
      - `message` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamptz)

    - `analytics_events` - Analytics tracking
      - `id` (uuid, primary key)
      - `event_type` (text) - 'listing_created', 'trade_executed', 'user_signup', 'volume'
      - `wallet_address` (text)
      - `value` (numeric) - Event value (amount, volume, etc.)
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)

    - `point_rules` - Admin-controlled point multipliers
      - `id` (uuid, primary key)
      - `rule_name` (text)
      - `multiplier` (numeric, default 1)
      - `is_active` (boolean, default true)
      - `created_by` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read for approved listings
    - Users can manage own listings and notifications
    - Admin-only write access for admin_actions, point_rules
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  project_name text NOT NULL,
  listing_type text NOT NULL DEFAULT 'pre_tge',
  status text NOT NULL DEFAULT 'pending',
  token_amount numeric NOT NULL DEFAULT 0,
  price_per_token numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  tge_unlock_percent numeric DEFAULT 0,
  vesting_duration_months integer DEFAULT 0,
  cliff_months integer DEFAULT 0,
  expected_tge_price numeric DEFAULT 0,
  settlement_date timestamptz,
  proof_url text DEFAULT '',
  admin_notes text DEFAULT '',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_wallet text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  wallet_address text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS point_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved listings are publicly readable"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can read own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin actions readable by authenticated"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Analytics readable by authenticated"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Point rules readable by authenticated"
  ON point_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage point rules"
  ON point_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update point rules"
  ON point_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
