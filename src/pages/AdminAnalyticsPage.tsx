import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { supabase } from '../lib/supabase';
import { generateVolumeData } from '../data/mockData';

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalVolume: 12450000,
    activeUsers: 8420,
    totalListings: 156,
    revenue: 37350,
    conversionRate: 68.5,
    pendingListings: 12,
  });
  const [chartData] = useState(generateVolumeData(30));

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        if (listingCount !== null) setStats((prev) => ({ ...prev, totalListings: listingCount }));
        if (pendingCount !== null) setStats((prev) => ({ ...prev, pendingListings: pendingCount }));
      } catch {}
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Volume',
      value: `$${(stats.totalVolume / 1_000_000).toFixed(2)}M`,
      change: '+18.2%',
      positive: true,
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: '+12.4%',
      positive: true,
      icon: <Users className="w-5 h-5 text-cyan-400" />,
    },
    {
      label: 'Total Listings',
      value: stats.totalListings.toString(),
      change: '+8.1%',
      positive: true,
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
    },
    {
      label: 'Revenue (Fees)',
      value: `$${stats.revenue.toLocaleString()}`,
      change: '+22.7%',
      positive: true,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+3.2%',
      positive: true,
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
    },
    {
      label: 'Pending Listings',
      value: stats.pendingListings.toString(),
      change: null,
      positive: false,
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Platform performance metrics and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
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
              {stat.change && (
                <span className={`text-xs mb-1 flex items-center gap-0.5 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        {/* Volume Chart */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="font-semibold mb-4">Volume Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value) => [`$${(Number(value) / 1_000_000).toFixed(2)}M`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="font-semibold mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="users" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
        <h3 className="font-semibold mb-4">Recent Platform Activity</h3>
        <div className="space-y-2">
          {[
            { time: '2 min ago', event: 'New listing: StarkNet pre-TGE by 0x71C7...976F', type: 'listing' },
            { time: '5 min ago', event: 'Trade filled: 5,000 ZK at $0.28', type: 'trade' },
            { time: '12 min ago', event: 'User signup: 0x3f5C...3e8', type: 'signup' },
            { time: '18 min ago', event: 'Listing approved: LayerZero vesting', type: 'approval' },
            { time: '25 min ago', event: 'Trade filled: 8,000 ZRO at $1.82', type: 'trade' },
            { time: '1 hr ago', event: 'Points awarded: 500 to WhaleKing', type: 'points' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  item.type === 'trade' ? 'bg-emerald-400' :
                  item.type === 'listing' ? 'bg-amber-400' :
                  item.type === 'approval' ? 'bg-cyan-400' :
                  'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-300">{item.event}</span>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
