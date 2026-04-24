import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Flag, Eye, Ban, Snowflake,
  Search, ExternalLink, MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockListings } from '../data/mockData';
import type { Listing } from '../types';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

export function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data, error } = await supabase.from('listings').select('*');
        if (error) throw error;
        setListings(data && data.length > 0 ? data : mockListings);
      } catch {
        setListings(mockListings);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchQuery && !l.project_name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingCount = listings.filter((l) => l.status === 'pending').length;

  const handleAction = async (listing: Listing, action: string) => {
    const statusMap: Record<string, Listing['status']> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged',
      cancel: 'cancelled',
      freeze: 'frozen',
    };

    const newStatus = statusMap[action];
    if (!newStatus) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus, reviewed_by: 'admin', reviewed_at: new Date().toISOString(), admin_notes: editNotes || listing.admin_notes })
        .eq('id', listing.id);

      if (error) throw error;

      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id
            ? { ...l, status: newStatus, reviewed_by: 'admin', reviewed_at: new Date().toISOString() }
            : l
        )
      );

      await supabase.from('admin_actions').insert({
        admin_wallet: 'admin',
        target_type: 'listing',
        target_id: listing.id,
        action,
        details: { project: listing.project_name, notes: editNotes },
      });

      await supabase.from('notifications').insert({
        wallet_address: listing.wallet_address,
        type: action === 'approve' ? 'listing_approved' : 'listing_rejected',
        title: action === 'approve' ? 'Listing Approved' : 'Listing Rejected',
        message: `Your ${listing.project_name} listing has been ${action}d`,
      });
    } catch {
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, status: newStatus } : l
        )
      );
    }

    setShowEditModal(false);
    setSelectedListing(null);
    setEditNotes('');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400',
      approved: 'bg-emerald-500/10 text-emerald-400',
      rejected: 'bg-red-500/10 text-red-400',
      flagged: 'bg-orange-500/10 text-orange-400',
      cancelled: 'bg-gray-500/10 text-gray-400',
      frozen: 'bg-blue-500/10 text-blue-400',
    };
    return styles[status] || 'bg-white/5 text-gray-400';
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
          <h1 className="text-3xl font-bold mb-2">Listing Approval Panel</h1>
          <p className="text-gray-400">Review and manage user-created listings</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-400">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project or wallet..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected', 'flagged'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Project</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Type</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Wallet</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Amount</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Price</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Discount</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredListings.map((listing, i) => (
                <motion.tr
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {listing.logo_url ? (
                        <img src={listing.logo_url} alt="" className="w-6 h-6 rounded-lg object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 flex items-center justify-center text-[10px] font-bold">
                          {listing.project_name.slice(0, 2)}
                        </div>
                      )}
                      <p className="text-sm font-medium">{listing.project_name}</p>
                    </div>
                    {listing.listing_type === 'vesting' && (
                      <p className="text-[10px] text-gray-500">
                        {listing.vesting_duration_months}mo vesting / {listing.cliff_months}mo cliff
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${
                      listing.listing_type === 'vesting'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {listing.listing_type === 'vesting' ? 'Vesting' : 'Pre-TGE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-400">
                      {listing.wallet_address.slice(0, 6)}...{listing.wallet_address.slice(-4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono">
                    {listing.token_amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono">
                    ${listing.price_per_token.toFixed(listing.price_per_token < 1 ? 4 : 2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {listing.discount_percent > 0 ? (
                      <span className="text-emerald-400">-{listing.discount_percent}%</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded font-medium ${getStatusBadge(listing.status)}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelectedListing(listing); setShowEditModal(true); }}
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(listing, 'reject')}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(listing, 'flag')}
                            className="p-1.5 rounded hover:bg-orange-500/10 text-orange-400 transition-colors"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {listing.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleAction(listing, 'cancel')}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Cancel"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(listing, 'freeze')}
                            className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors"
                            title="Freeze"
                          >
                            <Snowflake className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {listing.proof_url && (
                        <a
                          href={listing.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-white/10 text-gray-400 transition-colors"
                          title="View Proof"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Approve Modal */}
      <AnimatePresence>
        {showEditModal && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[#14161f] border border-white/10"
            >
              <h3 className="text-xl font-bold mb-4">Review Listing</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Project</span>
                  <span className="font-medium">{selectedListing.project_name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Type</span>
                  <span className="font-medium">{selectedListing.listing_type === 'vesting' ? 'Vesting' : 'Pre-TGE'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="font-medium">{selectedListing.token_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="font-medium">${selectedListing.price_per_token.toFixed(4)}</span>
                </div>
                {selectedListing.listing_type === 'vesting' && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">TGE Unlock</span>
                      <span className="font-medium">{selectedListing.tge_unlock_percent}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Vesting</span>
                      <span className="font-medium">{selectedListing.vesting_duration_months}mo / {selectedListing.cliff_months}mo cliff</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Wallet</span>
                  <span className="text-xs font-mono text-gray-400">{selectedListing.wallet_address}</span>
                </div>
                {selectedListing.proof_url && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-400">Proof</span>
                    <a href={selectedListing.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Admin Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowEditModal(false); setSelectedListing(null); setEditNotes(''); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(selectedListing, 'reject')}
                  className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedListing, 'approve')}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
