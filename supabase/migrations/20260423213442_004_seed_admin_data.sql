/*
  # Seed Admin System Data

  1. Listings - Sample pending/approved/rejected listings
  2. Admin Actions - Sample audit trail
  3. Notifications - Sample notifications
  4. Analytics Events - Sample analytics data
  5. Point Rules - Default multipliers
*/

INSERT INTO listings (wallet_address, project_name, listing_type, status, token_amount, price_per_token, discount_percent, tge_unlock_percent, vesting_duration_months, cliff_months, expected_tge_price, settlement_date, proof_url) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'zkSync', 'pre_tge', 'approved', 50000, 0.28, 0, 0, 0, 0, 0.35, '2026-06-15', 'https://proof.example.com/zk-sync-wallet.png'),
  ('0x8ba1f109551bD432803012645Hac136c82C3e8', 'LayerZero', 'vesting', 'approved', 100000, 1.45, 30, 10, 24, 6, 2.10, '2026-05-20', 'https://proof.example.com/lz-vesting.png'),
  ('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'StarkNet', 'pre_tge', 'pending', 25000, 0.92, 0, 0, 0, 0, 1.00, '2026-07-01', 'https://proof.example.com/strk-proof.png'),
  ('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 'zkSync', 'vesting', 'pending', 200000, 0.22, 25, 15, 36, 12, 0.35, '2026-06-15', 'https://proof.example.com/zk-vesting2.png'),
  ('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'LayerZero', 'pre_tge', 'rejected', 30000, 2.50, 0, 0, 0, 0, 2.10, '2026-05-20', ''),
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'StarkNet', 'vesting', 'approved', 75000, 0.70, 20, 10, 18, 3, 1.00, '2026-07-01', 'https://proof.example.com/strk-vesting.png'),
  ('0x8ba1f109551bD432803012645Hac136c82C3e8', 'zkSync', 'pre_tge', 'pending', 40000, 0.26, 0, 0, 0, 0, 0.35, '2026-06-15', 'https://proof.example.com/zk-proof2.png')
ON CONFLICT DO NOTHING;

INSERT INTO admin_actions (admin_wallet, target_type, target_id, action, details) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'listing', '1', 'approve', '{"note": "Verified wallet proof"}'),
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'listing', '2', 'approve', '{"note": "Valid vesting schedule"}'),
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'listing', '5', 'reject', '{"reason": "No proof uploaded"}')
ON CONFLICT DO NOTHING;

INSERT INTO notifications (wallet_address, type, title, message) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'listing_approved', 'Listing Approved', 'Your zkSync pre-TGE listing has been approved'),
  ('0x8ba1f109551bD432803012645Hac136c82C3e8', 'listing_approved', 'Listing Approved', 'Your LayerZero vesting listing has been approved'),
  ('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'new_listing', 'New Listing', 'A new StarkNet pre-TGE listing is pending review'),
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'trade_filled', 'Trade Filled', 'Your buy order for 5,000 ZK has been filled at $0.28'),
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'points_earned', 'Points Earned', 'You earned 500 points for completing a trade')
ON CONFLICT DO NOTHING;

INSERT INTO analytics_events (event_type, wallet_address, value, metadata) VALUES
  ('listing_created', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 50000, '{"project": "zkSync"}'),
  ('listing_created', '0x8ba1f109551bD432803012645Hac136c82C3e8', 100000, '{"project": "LayerZero"}'),
  ('trade_executed', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 14000, '{"market": "ZK", "price": 0.28}'),
  ('trade_executed', '0x8ba1f109551bD432803012645Hac136c82C3e8', 14560, '{"market": "ZRO", "price": 1.82}'),
  ('volume', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 4500000, '{"period": "weekly"}'),
  ('user_signup', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 0, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO point_rules (rule_name, multiplier, is_active, created_by) VALUES
  ('Trading Volume', 1, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ('New Market Bonus', 2, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ('Referral Bonus', 0.1, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ('Early User Multiplier', 1.5, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ('Vesting NFT Trade', 1.25, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
ON CONFLICT DO NOTHING;
