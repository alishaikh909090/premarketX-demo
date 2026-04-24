/*
  # Add Logo Upload + Admin Role System

  1. New Tables
    - `admin_users` - Admin access control
      - `id` (uuid, primary key)
      - `email` (text, unique) - Admin email
      - `wallet_address` (text, nullable) - Admin wallet
      - `role` (text) - 'super_admin' or 'admin'
      - `created_at` (timestamptz)

  2. Modified Tables
    - `listings` - Add `logo_url` column for coin logo

  3. Security
    - Enable RLS on admin_users
    - Only super_admins can manage admin_users
*/

-- Add logo_url to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN logo_url text DEFAULT '';
  END IF;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  wallet_address text DEFAULT '',
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can check if a user is admin (needed for UI)
CREATE POLICY "Authenticated can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admins can insert new admin users
CREATE POLICY "Super admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'super_admin'
    )
  );

-- Insert the owner as super_admin
INSERT INTO admin_users (email, wallet_address, role) VALUES
  ('gamingtheaa9@gmail.com', '', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default point rules for live launch
INSERT INTO point_rules (rule_name, multiplier, is_active, created_by) VALUES
  ('Trading Volume', 1, true, 'gamingtheaa9@gmail.com'),
  ('New Market Bonus', 2, true, 'gamingtheaa9@gmail.com'),
  ('Referral Bonus', 0.1, true, 'gamingtheaa9@gmail.com'),
  ('Early User Multiplier', 1.5, true, 'gamingtheaa9@gmail.com'),
  ('Vesting NFT Trade', 1.25, true, 'gamingtheaa9@gmail.com')
ON CONFLICT DO NOTHING;
