import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockMarkets } from '../data/mockData';
import type { Market, Page } from '../types';

interface MarketsPageProps {
  onNavigate: (page: Page, marketId?: string) => void;
}

type TabType = 'all' | 'spot' | 'vesting';

export function MarketsPage({ onNavigate }: MarketsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const { data, error } = await supabase.from('markets').select('*');
        if (error) throw error;
        setMarkets(data && data.length > 0 ? data : mockMarkets);
      } catch {
        setMarkets(mockMarkets);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, []);

  const filteredMarkets = markets.filter((m) => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
    return `$${vol}`;
  };

  const getChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'spot', label: 'Spot' },
    { key: 'vesting', label: 'Vesting' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Markets</h1>
        <p className="text-gray-400">Trade pre-TGE tokens and vesting allocations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Market Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map((market, i) => {
          const change = getChange(market.current_price, market.previous_price);
          const isPositive = change >= 0;
          const isVesting = market.type === 'vesting';

          return (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => onNavigate(isVesting ? 'vesting' : 'trade', market.id)}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 cursor-pointer transition-all hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    isVesting
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black'
                      : 'bg-gradient-to-br from-emerald-400 to-cyan-400 text-black'
                  }`}>
                    {market.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{market.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{market.symbol}</span>
                      {isVesting && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Vesting
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change).toFixed(2)}%
                </div>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-2xl font-bold">{formatPrice(market.current_price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">24h Volume</p>
                  <p className="text-sm font-medium">{formatVolume(market.volume_24h)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  TGE: {new Date(market.tge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <button className="flex items-center gap-1 text-sm text-emerald-400 group-hover:gap-2 transition-all">
                  Trade <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
