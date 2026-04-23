import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tag, Wallet, Shield, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockVestingAllocations, mockMarkets } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useVestingNFT, useEscrow } from '../hooks/useContracts';
import type { VestingAllocation, Market } from '../types';

export function VestingPage() {
  const [allocations, setAllocations] = useState<VestingAllocation[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAllocation, setSelectedAllocation] = useState<VestingAllocation | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'review' | 'confirming' | 'done'>('review');
  const { wallet } = useAuth();
  const vestingNFT = useVestingNFT();
  const escrow = useEscrow();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: aData } = await supabase.from('vesting_allocations').select('*');
        const { data: mData } = await supabase.from('markets').select('*');
        setAllocations(aData && aData.length > 0 ? aData : mockVestingAllocations);
        setMarkets(mData && mData.length > 0 ? mData : mockMarkets);
      } catch {
        setAllocations(mockVestingAllocations);
        setMarkets(mockMarkets);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getMarket = (marketId: string) => markets.find((m) => m.id === marketId);

  const getUnlockProgress = (schedule: { date: string; amount: number }[]) => {
    const total = schedule.reduce((sum, s) => sum + s.amount, 0);
    const now = new Date();
    const unlocked = schedule.filter((s) => new Date(s.date) <= now).reduce((sum, s) => sum + s.amount, 0);
    return { total, unlocked, percent: total > 0 ? (unlocked / total) * 100 : 0 };
  };

  const getTrustBadge = (walletAddr: string) => {
    if (walletAddr.includes('742d')) return { label: 'High Trust', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (walletAddr.includes('8ba1')) return { label: 'High Trust', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (walletAddr.includes('71C7')) return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Low Risk', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const handlePurchase = async () => {
    if (!selectedAllocation || !wallet.isConnected) return;
    setPurchaseStep('confirming');

    if (escrow.isDeployed) {
      await escrow.fundTrade(1);
    }

    setPurchaseStep('done');
    setTimeout(() => {
      setSelectedAllocation(null);
      setPurchaseStep('review');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vesting Market</h1>
          <p className="text-gray-400">Buy and sell locked token allocations at a discount</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
          vestingNFT.isDeployed
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          <Shield className="w-3.5 h-3.5" />
          {vestingNFT.isDeployed ? 'NFT Escrow Active' : 'Demo Mode'}
        </div>
      </div>

      {/* VestingNFT Info Banner */}
      {vestingNFT.isDeployed && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300">Vesting allocations are minted as NFTs</p>
              <p className="text-xs text-gray-400 mt-0.5">Each deal becomes a tradable ERC-721 token on Base. Sell or transfer anytime.</p>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allocations.map((allocation, i) => {
          const market = getMarket(allocation.market_id);
          const progress = getUnlockProgress(allocation.unlock_schedule);
          const badge = getTrustBadge(allocation.seller_wallet);

          return (
            <motion.div
              key={allocation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-black">
                    {market?.symbol?.slice(0, 2) || 'TK'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{market?.name || 'Unknown'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{market?.symbol || '???'}</span>
                      {vestingNFT.isDeployed && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          NFT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${badge.bg} ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <p className="text-lg font-bold">{(allocation.available_amount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Discount</p>
                  <p className="text-lg font-bold text-emerald-400">-{allocation.discount_percent}%</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Unlock Progress</p>
                  <p className="text-xs text-gray-400">{progress.percent.toFixed(1)}%</p>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {allocation.unlock_schedule.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-white/5">
                <Wallet className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 font-mono">{allocation.seller_wallet}</span>
              </div>

              {escrow.isDeployed && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Escrow protected</span>
                </div>
              )}

              <button
                onClick={() => setSelectedAllocation(allocation)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm hover:opacity-90 transition-all"
              >
                <Tag className="w-4 h-4" />
                Buy Allocation
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {selectedAllocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#14161f] border border-white/10"
            >
              {purchaseStep === 'review' && (
                <>
                  <h3 className="text-xl font-bold mb-1">Buy Vesting Allocation</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {escrow.isDeployed
                      ? 'USDC will be locked in escrow. You will receive a VestingNFT representing this allocation.'
                      : 'Demo mode - contracts not deployed yet. Purchase will be simulated.'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Token</span>
                      <span className="font-medium">{getMarket(selectedAllocation.market_id)?.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Amount</span>
                      <span className="font-medium">{(selectedAllocation.available_amount / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Discount</span>
                      <span className="font-medium text-emerald-400">-{selectedAllocation.discount_percent}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Seller</span>
                      <span className="text-xs font-mono text-gray-400">{selectedAllocation.seller_wallet}</span>
                    </div>

                    {vestingNFT.isDeployed && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-300">You will receive a VestingNFT (ERC-721) representing this allocation</span>
                      </div>
                    )}

                    {escrow.isDeployed && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-emerald-400">USDC locked in PreMarketEscrow until seller confirms delivery</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAllocation(null)}
                      className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePurchase}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:opacity-90 transition-all"
                    >
                      {escrow.isDeployed ? 'Lock USDC & Buy' : 'Confirm Purchase'}
                    </button>
                  </div>
                </>
              )}

              {purchaseStep === 'confirming' && (
                <div className="text-center py-8">
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Processing Purchase</h3>
                  <p className="text-sm text-gray-400">
                    {escrow.isDeployed
                      ? 'Locking USDC in escrow and minting VestingNFT...'
                      : 'Simulating allocation purchase...'}
                  </p>
                  {escrow.hash && (
                    <a
                      href={`https://basescan.org/tx/${escrow.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-emerald-400 hover:underline"
                    >
                      View transaction <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {purchaseStep === 'done' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Purchase Complete</h3>
                  <p className="text-sm text-gray-400">
                    {vestingNFT.isDeployed
                      ? 'VestingNFT has been minted to your wallet. Check your dashboard.'
                      : 'Allocation purchased successfully (demo).'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
