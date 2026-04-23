import { useState, useEffect } from 'react';
import { Award, Zap, Ban, Gift, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockPointRules, mockUserProfiles } from '../data/mockData';
import type { PointRule, UserProfile } from '../types';

export function AdminPointsPage() {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardWallet, setRewardWallet] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleMultiplier, setNewRuleMultiplier] = useState('1');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: rData } = await supabase.from('point_rules').select('*');
        const { data: uData } = await supabase.from('user_profiles').select('*');
        setRules(rData && rData.length > 0 ? rData : mockPointRules);
        setUsers(uData && uData.length > 0 ? uData : mockUserProfiles);
      } catch {
        setRules(mockPointRules);
        setUsers(mockUserProfiles);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleRule = async (rule: PointRule) => {
    const newActive = !rule.is_active;
    try {
      await supabase.from('point_rules').update({ is_active: newActive }).eq('id', rule.id);
    } catch {}
    setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_active: newActive } : r));
  };

  const addRule = async () => {
    if (!newRuleName) return;
    const newRule: PointRule = {
      id: `new-${Date.now()}`,
      rule_name: newRuleName,
      multiplier: parseFloat(newRuleMultiplier) || 1,
      is_active: true,
      created_by: 'admin',
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from('point_rules').insert({
        rule_name: newRuleName,
        multiplier: newRule.multiplier,
        is_active: true,
        created_by: 'admin',
      });
    } catch {}
    setRules((prev) => [...prev, newRule]);
    setNewRuleName('');
    setNewRuleMultiplier('1');
  };

  const removeRule = async (id: string) => {
    try {
      await supabase.from('point_rules').delete().eq('id', id);
    } catch {}
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const rewardUser = async () => {
    if (!rewardWallet || !rewardPoints) return;
    const points = parseInt(rewardPoints);
    try {
      await supabase.from('user_profiles').update({ points: points }).eq('wallet_address', rewardWallet);
      await supabase.from('notifications').insert({
        wallet_address: rewardWallet,
        type: 'points_earned',
        title: 'Points Rewarded',
        message: `Admin awarded you ${points} points`,
      });
    } catch {}
    setUsers((prev) => prev.map((u) =>
      u.wallet_address === rewardWallet ? { ...u, points: u.points + points } : u
    ));
    setRewardWallet('');
    setRewardPoints('');
  };

  const banFarming = async (wallet: string) => {
    try {
      await supabase.from('user_profiles').update({ points: 0 }).eq('wallet_address', wallet);
      await supabase.from('admin_actions').insert({
        admin_wallet: 'admin',
        target_type: 'user',
        target_id: wallet,
        action: 'ban_farming',
        details: { reason: 'Point farming detected' },
      });
    } catch {}
    setUsers((prev) => prev.map((u) =>
      u.wallet_address === wallet ? { ...u, points: 0 } : u
    ));
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Points Control Panel</h1>
        <p className="text-gray-400">Manage point multipliers, rewards, and farming prevention</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Point Rules */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Point Multipliers
          </h3>

          <div className="space-y-2 mb-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleRule(rule)} className="shrink-0">
                    {rule.is_active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${rule.is_active ? '' : 'text-gray-500'}`}>{rule.rule_name}</p>
                    <p className="text-xs text-gray-500">{rule.multiplier}x multiplier</p>
                  </div>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Rule */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              placeholder="Rule name"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="text"
              value={newRuleMultiplier}
              onChange={(e) => setNewRuleMultiplier(e.target.value)}
              placeholder="1x"
              className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-center focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={addRule}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reward Users */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              Reward User
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={rewardWallet}
                onChange={(e) => setRewardWallet(e.target.value)}
                placeholder="Wallet address"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <input
                type="text"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(e.target.value)}
                placeholder="Points to award"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={rewardUser}
                disabled={!rewardWallet || !rewardPoints}
                className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                Award Points
              </button>
            </div>
          </div>

          {/* User Points Table */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              User Points
            </h3>
            <div className="space-y-2">
              {users.sort((a, b) => b.points - a.points).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 flex items-center justify-center text-xs font-bold">
                      {(user.display_name || '?')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.display_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 font-mono">{user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-400">{user.points.toLocaleString()} pts</span>
                    <button
                      onClick={() => banFarming(user.wallet_address)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      title="Ban farming (reset points)"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
