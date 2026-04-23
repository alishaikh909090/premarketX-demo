import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp, Clock, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockListings, mockTrades } from '../data/mockData';
import type { Listing, Trade } from '../types';

interface FeedItem {
  id: string;
  type: 'listing' | 'trade' | 'approval';
  message: string;
  time: string;
  wallet: string;
  value?: string;
}

export function LiveFeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [approvedListings, setApprovedListings] = useState<Listing[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: lData } = await supabase.from('listings').select('*').eq('status', 'approved').order('created_at', { ascending: false });
        const { data: tData } = await supabase.from('trades').select('*').order('created_at', { ascending: false });
        setApprovedListings(lData && lData.length > 0 ? lData : mockListings.filter((l) => l.status === 'approved'));
        setRecentTrades(tData && tData.length > 0 ? tData : mockTrades);
      } catch {
        setApprovedListings(mockListings.filter((l) => l.status === 'approved'));
        setRecentTrades(mockTrades);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const items: FeedItem[] = [
      ...approvedListings.map((l) => ({
        id: `l-${l.id}`,
        type: 'listing' as const,
        message: `${l.project_name} ${l.listing_type === 'vesting' ? 'vesting' : 'pre-TGE'} listed @ $${l.price_per_token}`,
        time: l.created_at,
        wallet: l.wallet_address,
        value: `${l.token_amount.toLocaleString()} tokens`,
      })),
      ...recentTrades.map((t) => ({
        id: `t-${t.id}`,
        type: 'trade' as const,
        message: `Trade: ${t.amount.toLocaleString()} @ $${t.price.toFixed(4)}`,
        time: t.created_at,
        wallet: t.buyer_wallet,
        value: `$${(t.price * t.amount).toFixed(2)}`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setFeedItems(items);
  }, [approvedListings, recentTrades]);

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('live-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, (payload) => {
        const listing = payload.new as Listing;
        if (listing.status === 'approved') {
          const newItem: FeedItem = {
            id: `live-${Date.now()}`,
            type: 'listing',
            message: `${listing.project_name} listed @ $${listing.price_per_token}`,
            time: new Date().toISOString(),
            wallet: listing.wallet_address,
            value: `${listing.token_amount.toLocaleString()} tokens`,
          };
          setFeedItems((prev) => [newItem, ...prev].slice(0, 50));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades' }, (payload) => {
        const trade = payload.new as Trade;
        const newItem: FeedItem = {
          id: `live-${Date.now()}`,
          type: 'trade',
          message: `Trade: ${trade.amount.toLocaleString()} @ $${trade.price.toFixed(4)}`,
          time: new Date().toISOString(),
          wallet: trade.buyer_wallet,
          value: `$${(trade.price * trade.amount).toFixed(2)}`,
        };
        setFeedItems((prev) => [newItem, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Market Feed</h1>
          <p className="text-gray-400">Real-time listings and trades</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Activity Feed
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {feedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      item.type === 'trade' ? 'bg-emerald-400' :
                      item.type === 'listing' ? 'bg-amber-400' :
                      'bg-cyan-400'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-300">{item.message}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.wallet.slice(0, 6)}...{item.wallet.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.value && <p className="text-sm font-medium">{item.value}</p>}
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticker */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Ticker
            </h3>
            <div className="space-y-2">
              {[
                { symbol: 'ZK', price: '$0.28', change: '+12.0%' },
                { symbol: 'ZRO', price: '$1.85', change: '+7.6%' },
                { symbol: 'STRK', price: '$0.92', change: '+4.5%' },
                { symbol: 'ZK-V', price: '$0.22', change: '+10.0%' },
                { symbol: 'ZRO-V', price: '$1.45', change: '+5.1%' },
              ].map((ticker) => (
                <div key={ticker.symbol} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                  <span className="text-sm font-medium">{ticker.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{ticker.price}</span>
                    <span className="text-xs text-emerald-400">{ticker.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Approved */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Recently Approved
            </h3>
            <div className="space-y-2">
              {approvedListings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{listing.project_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      listing.listing_type === 'vesting' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {listing.listing_type === 'vesting' ? 'Vesting' : 'Spot'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{listing.token_amount.toLocaleString()} tokens</span>
                    <span className="text-xs font-mono">${listing.price_per_token.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Session Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-bold text-emerald-400">{feedItems.filter((f) => f.type === 'trade').length}</p>
                <p className="text-[10px] text-gray-500">Trades</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-bold text-amber-400">{feedItems.filter((f) => f.type === 'listing').length}</p>
                <p className="text-[10px] text-gray-500">Listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
