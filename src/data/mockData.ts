import type { Market, OrderbookEntry, Trade, VestingAllocation, UserProfile, LeaderboardEntry, Listing, AdminAction, Notification, PointRule } from '../types';

export const mockMarkets: Market[] = [
  { id: '1', name: 'zkSync', symbol: 'ZK', type: 'spot', status: 'active', current_price: 0.28, previous_price: 0.25, volume_24h: 2450000, tge_date: '2026-06-15T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'LayerZero', symbol: 'ZRO', type: 'spot', status: 'active', current_price: 1.85, previous_price: 1.72, volume_24h: 1890000, tge_date: '2026-05-20T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', name: 'StarkNet', symbol: 'STRK', type: 'spot', status: 'active', current_price: 0.92, previous_price: 0.88, volume_24h: 3200000, tge_date: '2026-07-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
  { id: '4', name: 'zkSync Vesting', symbol: 'ZK-V', type: 'vesting', status: 'active', current_price: 0.22, previous_price: 0.20, volume_24h: 890000, tge_date: '2026-06-15T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
  { id: '5', name: 'LayerZero Vesting', symbol: 'ZRO-V', type: 'vesting', status: 'active', current_price: 1.45, previous_price: 1.38, volume_24h: 560000, tge_date: '2026-05-20T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
];

export const mockOrderbook: OrderbookEntry[] = [
  { id: '1', market_id: '1', side: 'bid', price: 0.275, amount: 50000, wallet_address: '0x742d...0bEb', created_at: '' },
  { id: '2', market_id: '1', side: 'bid', price: 0.270, amount: 75000, wallet_address: '0x8ba1...C3e8', created_at: '' },
  { id: '3', market_id: '1', side: 'bid', price: 0.265, amount: 120000, wallet_address: '0x3f5C...3e8', created_at: '' },
  { id: '4', market_id: '1', side: 'ask', price: 0.285, amount: 45000, wallet_address: '0x71C7...976F', created_at: '' },
  { id: '5', market_id: '1', side: 'ask', price: 0.290, amount: 80000, wallet_address: '0xAb58...C9B', created_at: '' },
  { id: '6', market_id: '1', side: 'ask', price: 0.295, amount: 60000, wallet_address: '0xdAC1...1ec7', created_at: '' },
];

export const mockTrades: Trade[] = [
  { id: '1', market_id: '1', buyer_wallet: '0x8ba1...C3e8', seller_wallet: '0x742d...0bEb', price: 0.275, amount: 25000, status: 'settled', created_at: '2026-04-21T10:00:00Z', settled_at: '2026-04-22T10:00:00Z' },
  { id: '2', market_id: '1', buyer_wallet: '0x71C7...976F', seller_wallet: '0x8ba1...C3e8', price: 0.28, amount: 15000, status: 'filled', created_at: '2026-04-22T14:00:00Z', settled_at: null },
  { id: '3', market_id: '2', buyer_wallet: '0x742d...0bEb', seller_wallet: '0x71C7...976F', price: 1.82, amount: 8000, status: 'settled', created_at: '2026-04-20T09:00:00Z', settled_at: '2026-04-21T09:00:00Z' },
  { id: '4', market_id: '3', buyer_wallet: '0xdAC1...1ec7', seller_wallet: '0xAb58...C9B', price: 0.91, amount: 20000, status: 'pending', created_at: '2026-04-23T12:00:00Z', settled_at: null },
];

export const mockVestingAllocations: VestingAllocation[] = [
  { id: '1', market_id: '4', seller_wallet: '0x742d...0bEb', total_amount: 500000, available_amount: 250000, discount_percent: 25, unlock_schedule: [{ date: '2026-06-15', amount: 100000 }, { date: '2026-09-15', amount: 150000 }, { date: '2026-12-15', amount: 250000 }], status: 'active', created_at: '2026-04-01T00:00:00Z' },
  { id: '2', market_id: '4', seller_wallet: '0x8ba1...C3e8', total_amount: 200000, available_amount: 100000, discount_percent: 20, unlock_schedule: [{ date: '2026-06-15', amount: 50000 }, { date: '2026-12-15', amount: 150000 }], status: 'active', created_at: '2026-04-05T00:00:00Z' },
  { id: '3', market_id: '5', seller_wallet: '0x71C7...976F', total_amount: 100000, available_amount: 50000, discount_percent: 30, unlock_schedule: [{ date: '2026-05-20', amount: 25000 }, { date: '2026-08-20', amount: 35000 }, { date: '2026-11-20', amount: 40000 }], status: 'active', created_at: '2026-04-10T00:00:00Z' },
];

export const mockUserProfiles: UserProfile[] = [
  { id: '1', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', display_name: 'WhaleKing', trust_score: 92, trust_badge: 'high', total_volume: 4500000, total_trades: 234, points: 125000, referral_code: 'WHALE001', referred_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', wallet_address: '0x8ba1f109551bD432803012645Hac136c82C3e8', display_name: 'EarlyBird', trust_score: 78, trust_badge: 'high', total_volume: 2800000, total_trades: 156, points: 89000, referral_code: 'EARLY002', referred_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '3', wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', display_name: 'DegenTrader', trust_score: 45, trust_badge: 'medium', total_volume: 1200000, total_trades: 89, points: 45000, referral_code: 'DEGEN003', referred_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '4', wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', display_name: 'NewApe', trust_score: 22, trust_badge: 'low', total_volume: 150000, total_trades: 12, points: 8000, referral_code: 'NEWB004', referred_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '5', wallet_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', display_name: 'CryptoVet', trust_score: 88, trust_badge: 'high', total_volume: 3800000, total_trades: 198, points: 102000, referral_code: 'VET005', referred_by: null, created_at: '2026-01-01T00:00:00Z' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', display_name: 'WhaleKing', points: 125000, volume: 4500000, week_start: '2026-04-21', created_at: '2026-04-21T00:00:00Z' },
  { id: '2', wallet_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', display_name: 'CryptoVet', points: 102000, volume: 3800000, week_start: '2026-04-21', created_at: '2026-04-21T00:00:00Z' },
  { id: '3', wallet_address: '0x8ba1f109551bD432803012645Hac136c82C3e8', display_name: 'EarlyBird', points: 89000, volume: 2800000, week_start: '2026-04-21', created_at: '2026-04-21T00:00:00Z' },
  { id: '4', wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', display_name: 'DegenTrader', points: 45000, volume: 1200000, week_start: '2026-04-21', created_at: '2026-04-21T00:00:00Z' },
  { id: '5', wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', display_name: 'NewApe', points: 8000, volume: 150000, week_start: '2026-04-21', created_at: '2026-04-21T00:00:00Z' },
];

export function generateChartData(basePrice: number, points: number = 100) {
  const data = [];
  let price = basePrice;
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Number(price.toFixed(4)),
      volume: Math.floor(Math.random() * 50000) + 10000,
    });
  }
  return data;
}

// Admin system mock data

export const mockListings: Listing[] = [
  { id: '1', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', project_name: 'zkSync', listing_type: 'pre_tge', status: 'approved', token_amount: 50000, price_per_token: 0.28, discount_percent: 0, tge_unlock_percent: 0, vesting_duration_months: 0, cliff_months: 0, expected_tge_price: 0.35, settlement_date: '2026-06-15T00:00:00Z', proof_url: 'https://proof.example.com/zk-sync-wallet.png', logo_url: '', admin_notes: 'Verified wallet proof', reviewed_by: '0x742d...0bEb', reviewed_at: '2026-04-20T10:00:00Z', created_at: '2026-04-19T08:00:00Z', updated_at: '2026-04-20T10:00:00Z' },
  { id: '2', wallet_address: '0x8ba1f109551bD432803012645Hac136c82C3e8', project_name: 'LayerZero', listing_type: 'vesting', status: 'approved', token_amount: 100000, price_per_token: 1.45, discount_percent: 30, tge_unlock_percent: 10, vesting_duration_months: 24, cliff_months: 6, expected_tge_price: 2.10, settlement_date: '2026-05-20T00:00:00Z', proof_url: 'https://proof.example.com/lz-vesting.png', logo_url: '', admin_notes: 'Valid vesting schedule', reviewed_by: '0x742d...0bEb', reviewed_at: '2026-04-21T12:00:00Z', created_at: '2026-04-20T14:00:00Z', updated_at: '2026-04-21T12:00:00Z' },
  { id: '3', wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', project_name: 'StarkNet', listing_type: 'pre_tge', status: 'pending', token_amount: 25000, price_per_token: 0.92, discount_percent: 0, tge_unlock_percent: 0, vesting_duration_months: 0, cliff_months: 0, expected_tge_price: 1.00, settlement_date: '2026-07-01T00:00:00Z', proof_url: 'https://proof.example.com/strk-proof.png', logo_url: '', admin_notes: '', reviewed_by: null, reviewed_at: null, created_at: '2026-04-22T09:00:00Z', updated_at: '2026-04-22T09:00:00Z' },
  { id: '4', wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', project_name: 'zkSync', listing_type: 'vesting', status: 'pending', token_amount: 200000, price_per_token: 0.22, discount_percent: 25, tge_unlock_percent: 15, vesting_duration_months: 36, cliff_months: 12, expected_tge_price: 0.35, settlement_date: '2026-06-15T00:00:00Z', proof_url: 'https://proof.example.com/zk-vesting2.png', logo_url: '', admin_notes: '', reviewed_by: null, reviewed_at: null, created_at: '2026-04-22T16:00:00Z', updated_at: '2026-04-22T16:00:00Z' },
  { id: '5', wallet_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', project_name: 'LayerZero', listing_type: 'pre_tge', status: 'rejected', token_amount: 30000, price_per_token: 2.50, discount_percent: 0, tge_unlock_percent: 0, vesting_duration_months: 0, cliff_months: 0, expected_tge_price: 2.10, settlement_date: '2026-05-20T00:00:00Z', proof_url: '', logo_url: '', admin_notes: 'No proof uploaded', reviewed_by: '0x742d...0bEb', reviewed_at: '2026-04-21T15:00:00Z', created_at: '2026-04-21T10:00:00Z', updated_at: '2026-04-21T15:00:00Z' },
  { id: '6', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', project_name: 'StarkNet', listing_type: 'vesting', status: 'approved', token_amount: 75000, price_per_token: 0.70, discount_percent: 20, tge_unlock_percent: 10, vesting_duration_months: 18, cliff_months: 3, expected_tge_price: 1.00, settlement_date: '2026-07-01T00:00:00Z', proof_url: 'https://proof.example.com/strk-vesting.png', logo_url: '', admin_notes: '', reviewed_by: '0x742d...0bEb', reviewed_at: '2026-04-22T11:00:00Z', created_at: '2026-04-22T08:00:00Z', updated_at: '2026-04-22T11:00:00Z' },
  { id: '7', wallet_address: '0x8ba1f109551bD432803012645Hac136c82C3e8', project_name: 'zkSync', listing_type: 'pre_tge', status: 'pending', token_amount: 40000, price_per_token: 0.26, discount_percent: 0, tge_unlock_percent: 0, vesting_duration_months: 0, cliff_months: 0, expected_tge_price: 0.35, settlement_date: '2026-06-15T00:00:00Z', proof_url: 'https://proof.example.com/zk-proof2.png', logo_url: '', admin_notes: '', reviewed_by: null, reviewed_at: null, created_at: '2026-04-23T08:00:00Z', updated_at: '2026-04-23T08:00:00Z' },
];

export const mockAdminActions: AdminAction[] = [
  { id: '1', admin_wallet: '0x742d...0bEb', target_type: 'listing', target_id: '1', action: 'approve', details: { note: 'Verified wallet proof' }, created_at: '2026-04-20T10:00:00Z' },
  { id: '2', admin_wallet: '0x742d...0bEb', target_type: 'listing', target_id: '2', action: 'approve', details: { note: 'Valid vesting schedule' }, created_at: '2026-04-21T12:00:00Z' },
  { id: '3', admin_wallet: '0x742d...0bEb', target_type: 'listing', target_id: '5', action: 'reject', details: { reason: 'No proof uploaded' }, created_at: '2026-04-21T15:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: '1', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', type: 'listing_approved', title: 'Listing Approved', message: 'Your zkSync pre-TGE listing has been approved', read: false, created_at: '2026-04-22T10:00:00Z' },
  { id: '2', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', type: 'trade_filled', title: 'Trade Filled', message: 'Your buy order for 5,000 ZK has been filled at $0.28', read: false, created_at: '2026-04-22T14:00:00Z' },
  { id: '3', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', type: 'points_earned', title: 'Points Earned', message: 'You earned 500 points for completing a trade', read: true, created_at: '2026-04-22T14:30:00Z' },
  { id: '4', wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', type: 'new_listing', title: 'New Listing', message: 'A new StarkNet pre-TGE listing is pending review', read: false, created_at: '2026-04-23T08:00:00Z' },
];

export const mockPointRules: PointRule[] = [
  { id: '1', rule_name: 'Trading Volume', multiplier: 1, is_active: true, created_by: '0x742d...0bEb', created_at: '2026-04-01T00:00:00Z' },
  { id: '2', rule_name: 'New Market Bonus', multiplier: 2, is_active: true, created_by: '0x742d...0bEb', created_at: '2026-04-01T00:00:00Z' },
  { id: '3', rule_name: 'Referral Bonus', multiplier: 0.1, is_active: true, created_by: '0x742d...0bEb', created_at: '2026-04-01T00:00:00Z' },
  { id: '4', rule_name: 'Early User Multiplier', multiplier: 1.5, is_active: true, created_by: '0x742d...0bEb', created_at: '2026-04-01T00:00:00Z' },
  { id: '5', rule_name: 'Vesting NFT Trade', multiplier: 1.25, is_active: true, created_by: '0x742d...0bEb', created_at: '2026-04-01T00:00:00Z' },
];

export function generateVolumeData(days: number = 30) {
  const data = [];
  const now = new Date();
  let volume = 500000;
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    volume = volume * (1 + (Math.random() - 0.45) * 0.15);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(volume),
      users: Math.floor(Math.random() * 200) + 800,
    });
  }
  return data;
}
