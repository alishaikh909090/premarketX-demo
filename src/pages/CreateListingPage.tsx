import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wallet, Calendar, Tag, Coins, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type ListingType = 'pre_tge' | 'vesting';

interface FormState {
  projectName: string;
  listingType: ListingType;
  tokenAmount: string;
  pricePerToken: string;
  discountPercent: string;
  tgeUnlockPercent: string;
  vestingDurationMonths: string;
  cliffMonths: string;
  expectedTgePrice: string;
  settlementDate: string;
  proofUrl: string;
}

export function CreateListingPage() {
  const { wallet } = useAuth();
  const [form, setForm] = useState<FormState>({
    projectName: '',
    listingType: 'pre_tge',
    tokenAmount: '',
    pricePerToken: '',
    discountPercent: '',
    tgeUnlockPercent: '',
    vestingDurationMonths: '',
    cliffMonths: '',
    expectedTgePrice: '',
    settlementDate: '',
    proofUrl: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!wallet.isConnected || !form.projectName) return;
    setSubmitStatus('submitting');

    try {
      const { error } = await supabase.from('listings').insert({
        wallet_address: wallet.address,
        project_name: form.projectName,
        listing_type: form.listingType,
        token_amount: parseFloat(form.tokenAmount) || 0,
        price_per_token: parseFloat(form.pricePerToken) || 0,
        discount_percent: parseFloat(form.discountPercent) || 0,
        tge_unlock_percent: form.listingType === 'vesting' ? (parseFloat(form.tgeUnlockPercent) || 0) : 0,
        vesting_duration_months: form.listingType === 'vesting' ? (parseInt(form.vestingDurationMonths) || 0) : 0,
        cliff_months: form.listingType === 'vesting' ? (parseInt(form.cliffMonths) || 0) : 0,
        expected_tge_price: parseFloat(form.expectedTgePrice) || 0,
        settlement_date: form.settlementDate || null,
        proof_url: form.proofUrl,
        status: 'pending',
      });

      if (error) throw error;
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Listing Submitted</h2>
          <p className="text-gray-400 mb-6">Your listing is pending admin approval. You will be notified once reviewed.</p>
          <button
            onClick={() => { setSubmitStatus('idle'); setForm({ projectName: '', listingType: 'pre_tge', tokenAmount: '', pricePerToken: '', discountPercent: '', tgeUnlockPercent: '', vestingDurationMonths: '', cliffMonths: '', expectedTgePrice: '', settlementDate: '', proofUrl: '' }); }}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
          >
            Create Another Listing
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Listing</h1>
        <p className="text-gray-400">List your pre-TGE tokens or vesting allocations for sale</p>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        {/* Listing Type Toggle */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-2 block">Listing Type</label>
          <div className="flex gap-3">
            {(['pre_tge', 'vesting'] as const).map((type) => (
              <button
                key={type}
                onClick={() => update('listingType', type)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  form.listingType === type
                    ? type === 'pre_tge'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                {type === 'pre_tge' ? 'Pre-TGE Spot' : 'Vesting Allocation'}
              </button>
            ))}
          </div>
        </div>

        {/* Project Name */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block">Project Name</label>
          <input
            type="text"
            value={form.projectName}
            onChange={(e) => update('projectName', e.target.value)}
            placeholder="e.g., zkSync, LayerZero"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Token Amount + Price */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
              <Coins className="w-3 h-3" /> Token Amount
            </label>
            <input
              type="text"
              value={form.tokenAmount}
              onChange={(e) => update('tokenAmount', e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
              <Tag className="w-3 h-3" /> Price per Token (USDC)
            </label>
            <input
              type="text"
              value={form.pricePerToken}
              onChange={(e) => update('pricePerToken', e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Vesting-specific fields */}
        {form.listingType === 'vesting' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 mb-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">TGE Unlock %</label>
                <input
                  type="text"
                  value={form.tgeUnlockPercent}
                  onChange={(e) => update('tgeUnlockPercent', e.target.value)}
                  placeholder="10"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Discount %</label>
                <input
                  type="text"
                  value={form.discountPercent}
                  onChange={(e) => update('discountPercent', e.target.value)}
                  placeholder="25"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Vesting Duration (months)</label>
                <input
                  type="text"
                  value={form.vestingDurationMonths}
                  onChange={(e) => update('vestingDurationMonths', e.target.value)}
                  placeholder="24"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Cliff (months, optional)</label>
                <input
                  type="text"
                  value={form.cliffMonths}
                  onChange={(e) => update('cliffMonths', e.target.value)}
                  placeholder="6"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Expected TGE Price + Settlement Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Expected TGE Price (USDC)</label>
            <input
              type="text"
              value={form.expectedTgePrice}
              onChange={(e) => update('expectedTgePrice', e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Settlement Date
            </label>
            <input
              type="date"
              value={form.settlementDate}
              onChange={(e) => update('settlementDate', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Proof Upload */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
            <Upload className="w-3 h-3" /> Upload Proof (screenshot / wallet proof URL)
          </label>
          <input
            type="text"
            value={form.proofUrl}
            onChange={(e) => update('proofUrl', e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-2 mb-6 py-3 px-4 rounded-lg bg-white/5 border border-white/5">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Wallet:</span>
          <span className="text-sm font-mono">
            {wallet.isConnected ? `${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}` : 'Not connected'}
          </span>
        </div>

        {/* Instant Approval Notice */}
        <div className="mb-6 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-xs text-emerald-400">
            Trusted wallets (high reputation score) may be auto-approved without admin review.
          </p>
        </div>

        {/* Error */}
        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 mb-4 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            Failed to submit. Please try again.
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitStatus === 'submitting' || !wallet.isConnected || !form.projectName}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitStatus === 'submitting' ? (
            <><Clock className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            'Submit Listing for Approval'
          )}
        </button>
      </div>
    </div>
  );
}
