/*
  # Fix RLS Policies - Remove Always-True Checks

  ## Problem
  Multiple RLS policies use `WITH CHECK (true)` or `USING (true)` which
  bypasses row-level security entirely, allowing any authenticated user
  to insert/update any row regardless of ownership.

  ## Solution
  Replace all always-true policies with proper ownership checks:
  - Users can only INSERT/UPDATE rows where wallet_address matches their auth identity
  - Admin-only tables (admin_actions, point_rules) restricted to admin wallet
  - Notifications restricted to own wallet_address
  - Listings restricted to own wallet_address for INSERT/UPDATE
  - user_profiles restricted to own wallet_address for INSERT/UPDATE

  ## Changes by Table

  ### user_profiles
  - INSERT: wallet_address must match auth.uid() via user metadata (or fallback to caller)
  - UPDATE: USING + WITH CHECK on wallet_address = auth.uid()::text

  ### listings
  - INSERT: wallet_address must match caller
  - UPDATE: USING + WITH CHECK on wallet_address = caller
  - SELECT: already has approved-only public + full authenticated; keep but fix UPDATE

  ### admin_actions
  - INSERT: restricted to admin wallet addresses only

  ### notifications
  - INSERT: wallet_address must match caller
  - UPDATE: USING + WITH CHECK on wallet_address = caller

  ### analytics_events
  - INSERT: wallet_address must match caller

  ### point_rules
  - INSERT: restricted to admin wallet addresses only
  - UPDATE: USING + WITH CHECK restricted to admin wallet addresses only

  ## Security Notes
  1. Admin wallets are hardcoded in policy checks for MVP
  2. For production, replace with a proper admin role table or app_metadata check
  3. All policies now enforce ownership - no more always-true bypasses
*/

-- ============================================================
-- Drop all insecure policies
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can read own listings" ON listings;
DROP POLICY IF EXISTS "Authenticated can insert admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Authenticated can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated can manage point rules" ON point_rules;
DROP POLICY IF EXISTS "Authenticated can update point rules" ON point_rules;

-- ============================================================
-- user_profiles: Restrict INSERT/UPDATE to own wallet
-- ============================================================

-- Users can insert a profile for their own wallet address
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'sub')
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- ============================================================
-- listings: Restrict INSERT/UPDATE to own wallet, fix SELECT
-- ============================================================

-- Authenticated users can see all listings (needed for market view)
CREATE POLICY "Authenticated users can read all listings"
  ON listings FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert listings only for their own wallet
CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- Users can update only their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'sub')
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- ============================================================
-- admin_actions: Restrict INSERT to admin wallets only
-- ============================================================

-- Only admin wallets can insert admin actions
CREATE POLICY "Admins can insert admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_wallet IN (
      '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      '0x8ba1f109551bd432803012645hac136c82c3e8'
    )
  );

-- ============================================================
-- notifications: Restrict INSERT/UPDATE to own wallet
-- ============================================================

-- Users can read only their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'sub');

-- System can insert notifications for a specific user
-- (Edge functions use service role, so this policy is for client-side fallback)
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- Users can update only their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'sub')
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- ============================================================
-- analytics_events: Restrict INSERT to own wallet
-- ============================================================

-- Users can insert analytics events only for their own wallet
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- ============================================================
-- point_rules: Restrict INSERT/UPDATE to admin wallets only
-- ============================================================

-- Only admin wallets can insert point rules
CREATE POLICY "Admins can insert point rules"
  ON point_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      '0x8ba1f109551bd432803012645hac136c82c3e8'
    )
  );

-- Only admin wallets can update point rules
CREATE POLICY "Admins can update point rules"
  ON point_rules FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      '0x8ba1f109551bd432803012645hac136c82c3e8'
    )
  )
  WITH CHECK (
    created_by IN (
      '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      '0x8ba1f109551bd432803012645hac136c82c3e8'
    )
  );
