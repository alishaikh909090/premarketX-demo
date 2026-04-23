import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockLeaderboard, mockUserProfiles } from '../data/mockData';
import type { LeaderboardEntry, UserProfile } from '../types';

type LeaderboardTab = 'points' | 'profit' | 'early';

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('points');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: lData } = await supabase.from('leaderboard').select('*');
        const { data: pData } = await supabase.from('user_profiles').select('*');
        setEntries(lData && lData.length > 0 ? lData : mockLeaderboard);
        setProfiles(pData && pData.length > 0 ? pData : mockUserProfiles);
      } catch {
        setEntries(mockLeaderboard);
        setProfiles(mockUserProfiles);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-gray-500 font-mono">{rank}</span>;
  };

  const getTrustColor = (badge: string) => {
    if (badge === 'high') return 'text-emerald-400 bg-emerald-500/10';
    if (badge === 'medium') return 'text-amber-400 bg-amber-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const tabs: { key: LeaderboardTab; label: string; icon: React.ReactNode }[] = [
    { key: 'points', label: 'Top Points', icon: <Trophy className="w-4 h-4" /> },
    { key: 'profit', label: 'Most Profit', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'early', label: 'Early Buyers', icon: <Flame className="w-4 h-4" /> },
  ];

  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === 'points') return b.points - a.points;
    if (activeTab === 'profit') return b.volume - a.volume;
    return b.points - a.points;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-400">Compete with the best pre-market traders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {sortedEntries.slice(0, 3).map((entry, i) => {
          const heights = ['h-24', 'h-36', 'h-28'];
          const positions = [1, 0, 2];
          const pos = positions[i];

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-lg font-bold text-black mb-3`}>
                {entry.display_name?.[0] || '?'}
              </div>
              <p className="text-sm font-medium mb-1">{entry.display_name || 'Unknown'}</p>
              <p className="text-xs text-gray-500 mb-2">
                {activeTab === 'points' ? entry.points.toLocaleString() : `$${(entry.volume / 1_000_000).toFixed(2)}M`}
              </p>
              <div className={`w-24 ${heights[pos]} rounded-t-xl bg-gradient-to-t from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center`}>
                <span className="text-2xl font-bold text-emerald-400">#{pos + 1}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">All Traders</span>
        </div>
        <div className="divide-y divide-white/5">
          {sortedEntries.map((entry, i) => {
            const profile = profiles.find((p) => p.wallet_address === entry.wallet_address);
            const rank = i + 1;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 flex items-center justify-center text-sm font-bold">
                  {entry.display_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.display_name || 'Unknown Trader'}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">{entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {activeTab === 'points' ? entry.points.toLocaleString() : `$${(entry.volume / 1_000_000).toFixed(2)}M`}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${getTrustColor(profile?.trust_badge || 'low')}`}>
                    {profile?.trust_badge || 'low'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly Reset Info */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
        <Flame className="w-5 h-5 text-amber-400" />
        <div>
          <p className="text-sm font-medium">Weekly Reset</p>
          <p className="text-xs text-gray-400">Leaderboard resets every Monday. Top 100 get bonus multipliers.</p>
        </div>
      </div>
    </div>
  );
}
