/*
  # Seed Mock Data for PreMarketX

  1. Markets
    - zkSync (Pre-TGE, Spot)
    - LayerZero (Pre-TGE, Spot)
    - StarkNet (Pre-TGE, Spot)
    - zkSync Vesting (Vesting)
    - LayerZero Vesting (Vesting)

  2. Orderbook entries
    - Bids and asks for each spot market

  3. Vesting allocations
    - Sample vesting deals with unlock schedules

  4. User profiles
    - Sample traders with trust scores

  5. Leaderboard
    - Weekly leaderboard entries
*/

INSERT INTO markets (name, symbol, type, status, current_price, previous_price, volume_24h, tge_date) VALUES
  ('zkSync', 'ZK', 'spot', 'active', 0.28, 0.25, 2450000, '2026-06-15'),
  ('LayerZero', 'ZRO', 'spot', 'active', 1.85, 1.72, 1890000, '2026-05-20'),
  ('StarkNet', 'STRK', 'spot', 'active', 0.92, 0.88, 3200000, '2026-07-01'),
  ('zkSync Vesting', 'ZK-V', 'vesting', 'active', 0.22, 0.20, 890000, '2026-06-15'),
  ('LayerZero Vesting', 'ZRO-V', 'vesting', 'active', 1.45, 1.38, 560000, '2026-05-20')
ON CONFLICT DO NOTHING;

INSERT INTO orderbook (market_id, side, price, amount, wallet_address) VALUES
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'bid', 0.275, 50000, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'bid', 0.270, 75000, '0x8ba1f109551bD432803012645Hac136c82C3e8'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'bid', 0.265, 120000, '0x3f5CE5FBFe3E9af3971dD833A45D90fE37D5C3e8'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'ask', 0.285, 45000, '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'ask', 0.290, 80000, '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), 'ask', 0.295, 60000, '0xdAC17F958D2ee523a2206206994597C13D831ec7'),
  ((SELECT id FROM markets WHERE symbol = 'ZRO'), 'bid', 1.82, 12000, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ((SELECT id FROM markets WHERE symbol = 'ZRO'), 'bid', 1.78, 25000, '0x8ba1f109551bD432803012645Hac136c82C3e8'),
  ((SELECT id FROM markets WHERE symbol = 'ZRO'), 'ask', 1.88, 18000, '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'),
  ((SELECT id FROM markets WHERE symbol = 'ZRO'), 'ask', 1.92, 30000, '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'),
  ((SELECT id FROM markets WHERE symbol = 'STRK'), 'bid', 0.90, 40000, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
  ((SELECT id FROM markets WHERE symbol = 'STRK'), 'ask', 0.94, 35000, '0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
ON CONFLICT DO NOTHING;

INSERT INTO vesting_allocations (market_id, seller_wallet, total_amount, available_amount, discount_percent, unlock_schedule, status) VALUES
  ((SELECT id FROM markets WHERE symbol = 'ZK-V'), '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 500000, 250000, 25, '[{"date":"2026-06-15","amount":100000},{"date":"2026-09-15","amount":150000},{"date":"2026-12-15","amount":250000}]', 'active'),
  ((SELECT id FROM markets WHERE symbol = 'ZK-V'), '0x8ba1f109551bD432803012645Hac136c82C3e8', 200000, 100000, 20, '[{"date":"2026-06-15","amount":50000},{"date":"2026-12-15","amount":150000}]', 'active'),
  ((SELECT id FROM markets WHERE symbol = 'ZRO-V'), '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 100000, 50000, 30, '[{"date":"2026-05-20","amount":25000},{"date":"2026-08-20","amount":35000},{"date":"2026-11-20","amount":40000}]', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (wallet_address, display_name, trust_score, trust_badge, total_volume, total_trades, points, referral_code) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'WhaleKing', 92, 'high', 4500000, 234, 125000, 'WHALE001'),
  ('0x8ba1f109551bD432803012645Hac136c82C3e8', 'EarlyBird', 78, 'high', 2800000, 156, 89000, 'EARLY002'),
  ('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'DegenTrader', 45, 'medium', 1200000, 89, 45000, 'DEGEN003'),
  ('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 'NewApe', 22, 'low', 150000, 12, 8000, 'NEWB004'),
  ('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'CryptoVet', 88, 'high', 3800000, 198, 102000, 'VET005')
ON CONFLICT DO NOTHING;

INSERT INTO leaderboard (wallet_address, display_name, points, volume, week_start) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'WhaleKing', 125000, 4500000, CURRENT_DATE),
  ('0x8ba1f109551bD432803012645Hac136c82C3e8', 'EarlyBird', 89000, 2800000, CURRENT_DATE),
  ('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'CryptoVet', 102000, 3800000, CURRENT_DATE),
  ('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'DegenTrader', 45000, 1200000, CURRENT_DATE),
  ('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 'NewApe', 8000, 150000, CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO trades (market_id, buyer_wallet, seller_wallet, price, amount, status, created_at, settled_at) VALUES
  ((SELECT id FROM markets WHERE symbol = 'ZK'), '0x8ba1f109551bD432803012645Hac136c82C3e8', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 0.275, 25000, 'settled', now() - interval '2 days', now() - interval '1 day'),
  ((SELECT id FROM markets WHERE symbol = 'ZK'), '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x8ba1f109551bD432803012645Hac136c82C3e8', 0.28, 15000, 'filled', now() - interval '1 day', null),
  ((SELECT id FROM markets WHERE symbol = 'ZRO'), '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 1.82, 8000, 'settled', now() - interval '3 days', now() - interval '2 days'),
  ((SELECT id FROM markets WHERE symbol = 'STRK'), '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 0.91, 20000, 'pending', now() - interval '4 hours', null)
ON CONFLICT DO NOTHING;
