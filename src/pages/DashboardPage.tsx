import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Clock, CheckCircle,
  AlertCircle, Award, Copy, BarChart3, Shield,
  Loader2, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockTrades, mockUserProfiles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useCollateral, useEscrow } from '../hooks/useContracts';
import type { Trade, UserProfile } from '../types';

export function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [copied, setCopied] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [showCollateralPanel, setShowCollateralPanel] = useState(false);
  const { wallet } = useAuth();
  const collateral = useCollateral();
  const escrow = useEscrow();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: tData } = await supabase.from('trades').select('*');
        const { data: pData } = await supabase.from('user_profiles').select('*');
        setTrades(tData && tData.length > 0 ? tData : mockTrades);
        const userProfile = pData?.find((p: UserProfile) => p.wallet_address === wallet.address) || mockUserProfiles[0];
        setProfile(userProfile);
      } catch {
        setTrades(mockTrades);
        setProfile(mockUserProfiles[0]);
      }
    }
    fetchData();
  }, [wallet.address]);

  const openTrades = trades.filter((t) => t.status === 'pending' || t.status === 'filled');
  const completedTrades = trades.filter((t) => t.status === 'settled');
  const displayTrades = activeTab === 'open' ? openTrades : completedTrades;

  const totalPnL = completedTrades.reduce((sum, t) => {
    const pnl = t.status === 'settled' ? (t.price * t.amount * 0.05) : 0;
    return sum + pnl;
  }, 0);

  const copyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'filled': return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'settled': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'filled': return 'Filled';
      case 'settled': return 'Settled';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your trades, track PnL, and earn points</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Portfolio Value',
            value: wallet.isConnected ? `$${wallet.balance}` : '$0.00',
            icon: <Wallet className="w-5 h-5 text-emerald-400" />,
            trend: '+2.4%',
            positive: true,
          },
          {
            label: 'Total PnL',
            value: `+$${totalPnL.toFixed(2)}`,
            icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
            trend: '+12%',
            positive: true,
          },
          {
            label: 'Total Trades',
            value: String(profile?.total_trades || 0),
            icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
            trend: null,
            positive: true,
          },
          {
            label: 'Points',
            value: String((profile?.points || 0).toLocaleString()),
            icon: <Award className="w-5 h-5 text-amber-400" />,
            trend: null,
            positive: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{stat.label}</span>
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.trend && (
                <span className={`text-xs mb-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trades Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Trade History</h3>
              <div className="flex gap-2">
                {(['open', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {displayTrades.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No {activeTab} trades</p>
                </div>
              )}
              {displayTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(trade.status)}
                    <div>
                      <p className="text-sm font-medium">
                        Trade {trade.amount.toLocaleString()} @ ${trade.price.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      trade.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400' :
                      trade.status === 'filled' ? 'bg-cyan-500/10 text-cyan-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {getStatusLabel(trade.status)}
                    </span>
                    {escrow.isDeployed && trade.status !== 'settled' && (
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collateral Vault Panel */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <button
              onClick={() => setShowCollateralPanel(!showCollateralPanel)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold">Collateral Vault</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  collateral.isDeployed
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {collateral.isDeployed ? 'Active' : 'Demo'}
                </span>
              </div>
              {showCollateralPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCollateralPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <p className="text-sm text-gray-400 mb-4">
                  Deposit ETH as collateral to back your sell orders. If you fail to deliver, your collateral will be slashed and sent to the buyer.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Your Collateral</p>
                    <p className="text-xl font-bold">0.5 ETH</p>
                    <p className="text-xs text-gray-500 mt-1">~$1,250.00</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Required</p>
                    <p className="text-xl font-bold">0.3 ETH</p>
                    <p className="text-xs text-emerald-400 mt-1">Sufficient coverage</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => collateral.depositCollateral(collateralAmount || '0')}
                    disabled={collateral.status === 'pending' || collateral.status === 'confirming'}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {(collateral.status === 'pending' || collateral.status === 'confirming') && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Deposit
                  </button>
                </div>

                {/* Collateral Tx Status */}
                {collateral.hash && (
                  <div className="flex items-center gap-2 text-xs mb-3">
                    {collateral.status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    {collateral.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                    {collateral.status === 'success' && (
                      <a
                        href={`https://basescan.org/tx/${collateral.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        View tx <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {collateral.status === 'error' && (
                      <span className="text-red-400">{collateral.error}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => collateral.withdrawCollateral('0.1')}
                    className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition-all"
                  >
                    Withdraw 0.1 ETH
                  </button>
                </div>

                {!collateral.isDeployed && (
                  <p className="text-xs text-amber-400 mt-3">
                    CollateralVault not deployed. Transactions are simulated.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Trust Score */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4">Trust Score</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={profile && profile.trust_score >= 70 ? '#10b981' : profile && profile.trust_score >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(profile?.trust_score || 0) * 2.26} 226`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{profile?.trust_score || 0}</span>
                </div>
              </div>
              <div>
                <p className="font-medium">{profile?.trust_badge || 'low'} Risk</p>
                <p className="text-xs text-gray-400 mt-1">
                  Based on {profile?.total_trades || 0} completed trades
                </p>
              </div>
            </div>
          </div>

          {/* Referral */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-3">Referral Program</h3>
            <p className="text-sm text-gray-400 mb-3">
              Invite friends and earn 10% of their points forever.
            </p>
            {profile?.referral_code ? (
              <button
                onClick={copyReferral}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <span className="text-sm font-mono">{profile.referral_code}</span>
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <p className="text-sm text-gray-500">Connect wallet to get your code</p>
            )}
            {copied && (
              <p className="text-xs text-emerald-400 mt-2">Copied to clipboard!</p>
            )}
          </div>

          {/* Volume */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-3">Trading Volume</h3>
            <p className="text-2xl font-bold">${((profile?.total_volume || 0) / 1_000_000).toFixed(2)}M</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>+23% this week</span>
            </div>
          </div>

          {/* Contract Status */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-3">Contract Status</h3>
            <div className="space-y-2">
              {[
                { name: 'PreMarketEscrow', active: escrow.isDeployed },
                { name: 'CollateralVault', active: collateral.isDeployed },
                { name: 'VestingNFT', active: false },
              ].map((contract) => (
                <div key={contract.name} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-400">{contract.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    contract.active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {contract.active ? 'Deployed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
