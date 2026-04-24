export interface Market {
  id: string;
  name: string;
  symbol: string;
  type: 'spot' | 'vesting';
  status: 'active' | 'upcoming' | 'settled';
  current_price: number;
  previous_price: number;
  volume_24h: number;
  tge_date: string;
  created_at: string;
}

export interface OrderbookEntry {
  id: string;
  market_id: string;
  side: 'bid' | 'ask';
  price: number;
  amount: number;
  wallet_address: string;
  created_at: string;
}

export interface Trade {
  id: string;
  market_id: string;
  buyer_wallet: string;
  seller_wallet: string;
  price: number;
  amount: number;
  status: 'pending' | 'filled' | 'settled';
  created_at: string;
  settled_at: string | null;
}

export interface VestingAllocation {
  id: string;
  market_id: string;
  seller_wallet: string;
  total_amount: number;
  available_amount: number;
  discount_percent: number;
  unlock_schedule: { date: string; amount: number }[];
  status: 'active' | 'sold';
  created_at: string;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  display_name: string | null;
  trust_score: number;
  trust_badge: 'low' | 'medium' | 'high';
  total_volume: number;
  total_trades: number;
  points: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  wallet_address: string;
  display_name: string | null;
  points: number;
  volume: number;
  week_start: string;
  created_at: string;
}

export interface Listing {
  id: string;
  wallet_address: string;
  project_name: string;
  listing_type: 'pre_tge' | 'vesting';
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'cancelled' | 'frozen';
  token_amount: number;
  price_per_token: number;
  discount_percent: number;
  tge_unlock_percent: number;
  vesting_duration_months: number;
  cliff_months: number;
  expected_tge_price: number;
  settlement_date: string;
  proof_url: string;
  logo_url: string;
  admin_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: string;
  admin_wallet: string;
  target_type: 'listing' | 'user' | 'points';
  target_id: string;
  action: 'approve' | 'reject' | 'flag' | 'cancel' | 'freeze' | 'unfreeze' | 'edit' | 'reward' | 'ban_farming';
  details: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  wallet_address: string;
  type: 'listing_approved' | 'listing_rejected' | 'trade_filled' | 'new_listing' | 'points_earned';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  wallet_address: string;
  value: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PointRule {
  id: string;
  rule_name: string;
  multiplier: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export type UserRole = 'admin' | 'user';

export type Page = 'landing' | 'markets' | 'trade' | 'vesting' | 'dashboard' | 'leaderboard' | 'deploy' | 'create-listing' | 'admin-listings' | 'admin-analytics' | 'admin-points' | 'live-feed';
