import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Plus, ArrowUpDown,
  Clock, Wallet, ChevronDown, Shield, AlertCircle, CheckCircle, Loader2, ExternalLink
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { supabase } from '../lib/supabase';
import { mockMarkets, mockOrderbook, generateChartData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useEscrow } from '../hooks/useContracts';
import type { Market, OrderbookEntry } from '../types';

interface TradePageProps {
  marketId?: string;
}

export function TradePage({ marketId }: TradePageProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [orderbook, setOrderbook] = useState<OrderbookEntry[]>([]);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { wallet } = useAuth();
  const escrow = useEscrow();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: mData } = await supabase.from('markets').select('*');
        const loadedMarkets = mData && mData.length > 0 ? mData : mockMarkets;
        setMarkets(loadedMarkets);

        const target = marketId
          ? loadedMarkets.find((m: Market) => m.id === marketId)
          : loadedMarkets[0];
        if (target) {
          setSelectedMarket(target);
          setPrice(String(target.current_price));
          setChartData(generateChartData(target.current_price));
        }

        const { data: oData } = await supabase.from('orderbook').select('*');
        setOrderbook(oData && oData.length > 0 ? oData : mockOrderbook);
      } catch {
        setMarkets(mockMarkets);
        setSelectedMarket(mockMarkets[0]);
        setPrice(String(mockMarkets[0].current_price));
        setChartData(generateChartData(mockMarkets[0].current_price));
        setOrderbook(mockOrderbook);
      }
    }
    fetchData();
  }, [marketId]);

  const filteredOrderbook = useMemo(() => {
    if (!selectedMarket) return { bids: [] as OrderbookEntry[], asks: [] as OrderbookEntry[] };
    const entries = orderbook.filter((o) => o.market_id === selectedMarket.id);
    return {
      bids: entries.filter((o) => o.side === 'bid').sort((a, b) => b.price - a.price),
      asks: entries.filter((o) => o.side === 'ask').sort((a, b) => a.price - b.price),
    };
  }, [orderbook, selectedMarket]);

  const total = useMemo(() => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return (p * a).toFixed(2);
  }, [price, amount]);

  const handleConfirmOrder = async () => {
    if (!wallet.isConnected || !selectedMarket) return;

    if (escrow.isDeployed) {
      if (side === 'sell') {
        await escrow.createTrade(wallet.address!, amount, price);
      } else {
        const tradeIdNum = 1;
        await escrow.fundTrade(tradeIdNum);
      }
    } else {
      alert(`${side === 'buy' ? 'Buy' : 'Sell'} order placed: ${amount} ${selectedMarket.symbol} at $${price} (demo mode - contracts not deployed yet)`);
    }
    setShowConfirmModal(false);
  };

  const handleSubmit = () => {
    if (!wallet.isConnected) {
      wallet.connect();
      return;
    }
    setShowConfirmModal(true);
  };

  if (!selectedMarket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const change = ((selectedMarket.current_price - selectedMarket.previous_price) / selectedMarket.previous_price) * 100;
  const isPositive = change >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Market Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setMarketDropdownOpen(!marketDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-black">
                {selectedMarket.symbol.slice(0, 2)}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{selectedMarket.name}</p>
                <p className="text-xs text-gray-500">{selectedMarket.symbol}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {marketDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl z-50 overflow-hidden">
                {markets.filter((m) => m.type === 'spot').map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMarket(m);
                      setPrice(String(m.current_price));
                      setChartData(generateChartData(m.current_price));
                      setMarketDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-black">
                      {m.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.symbol}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold">${selectedMarket.current_price.toFixed(4)}</p>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(change).toFixed(2)}%
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-white/10" />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500">24h Volume</p>
              <p className="text-sm font-medium">
                ${(selectedMarket.volume_24h / 1_000_000).toFixed(2)}M
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500">TGE</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(selectedMarket.tge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
          escrow.isDeployed
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          <Shield className="w-3.5 h-3.5" />
          {escrow.isDeployed ? 'Escrow Active' : 'Demo Mode'}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart + Orderbook */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.2)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14161f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orderbook */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold">Orderbook</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-red-400 mb-2 font-medium">Asks (Sell)</p>
                <div className="space-y-1">
                  {filteredOrderbook.asks.map((ask) => (
                    <div key={ask.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-red-500/5">
                      <span className="text-red-400 font-mono">{ask.price.toFixed(4)}</span>
                      <span className="text-gray-400 font-mono">{(ask.amount / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-emerald-400 mb-2 font-medium">Bids (Buy)</p>
                <div className="space-y-1">
                  {filteredOrderbook.bids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-emerald-500/5">
                      <span className="text-emerald-400 font-mono">{bid.price.toFixed(4)}</span>
                      <span className="text-gray-400 font-mono">{(bid.amount / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 h-fit">
          {/* Side Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                side === 'buy'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                side === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type */}
          <div className="flex gap-2 mb-4">
            {(['limit', 'market'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  orderType === type
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Price Input */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1.5 block">Price (USDC)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrice((p) => String((parseFloat(p) - 0.001).toFixed(4)))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-center focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={() => setPrice((p) => String((parseFloat(p) + 0.001).toFixed(4)))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1.5 block">Amount ({selectedMarket.symbol})</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t border-white/5 mb-4">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-sm font-bold">${total} USDC</span>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <Wallet className="w-3.5 h-3.5" />
            <span>Available: {wallet.isConnected ? wallet.balance : '0.00'} USDC</span>
          </div>

          {/* Escrow Info */}
          {escrow.isDeployed && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">USDC locked in escrow until delivery</span>
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={escrow.status === 'pending' || escrow.status === 'confirming'}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              escrow.status === 'pending' || escrow.status === 'confirming'
                ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                : side === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {(escrow.status === 'pending' || escrow.status === 'confirming') && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {escrow.status === 'pending'
              ? 'Confirming in wallet...'
              : escrow.status === 'confirming'
                ? 'Waiting for confirmation...'
                : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedMarket.symbol}`}
          </motion.button>

          {/* Tx Status */}
          {escrow.hash && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              {escrow.status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              {escrow.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
              {escrow.status === 'success' && (
                <a
                  href={`https://basescan.org/tx/${escrow.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View tx <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {escrow.status === 'error' && (
                <span className="text-red-400">{escrow.error}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Order Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#14161f] border border-white/10"
            >
              <h3 className="text-xl font-bold mb-1">Confirm Order</h3>
              <p className="text-sm text-gray-400 mb-6">
                {escrow.isDeployed
                  ? 'Your USDC will be locked in escrow until the seller confirms delivery.'
                  : 'Demo mode - contracts not deployed yet. Order will be simulated.'}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Side</span>
                  <span className={`font-medium ${side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {side === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Token</span>
                  <span className="font-medium">{selectedMarket.symbol}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="font-medium">{amount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="font-medium">${price}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="font-bold text-lg">${total}</span>
                </div>
              </div>

              {escrow.isDeployed && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-400">
                    Protected by PreMarketEscrow on Base chain. USDC locked until settlement.
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className={`flex-1 py-3 rounded-xl font-semibold hover:opacity-90 transition-all ${
                    side === 'buy'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {escrow.isDeployed ? `Lock ${total} USDC` : `Place Order`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
