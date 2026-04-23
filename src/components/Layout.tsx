import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, LayoutDashboard, Trophy, Menu, X, ChevronDown, LogOut,
  FileCode, Shield, Plus, BarChart3, Zap, Radio, Bell, BellRing
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Page, Notification } from '../types';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAdmin, toggleRole, wallet } = useAuth();

  const userNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'markets', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
    { page: 'trade', label: 'Trade', icon: <TrendingUp className="w-4 h-4" /> },
    { page: 'vesting', label: 'Vesting', icon: <TrendingUp className="w-4 h-4" /> },
    { page: 'create-listing', label: 'Create Listing', icon: <Plus className="w-4 h-4" /> },
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { page: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { page: 'live-feed', label: 'Live Feed', icon: <Radio className="w-4 h-4" /> },
    { page: 'deploy', label: 'Contracts', icon: <FileCode className="w-4 h-4" /> },
  ];

  const adminNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'admin-listings', label: 'Approve Listings', icon: <Shield className="w-4 h-4" /> },
    { page: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { page: 'admin-points', label: 'Points Control', icon: <Zap className="w-4 h-4" /> },
    { page: 'live-feed', label: 'Live Feed', icon: <Radio className="w-4 h-4" /> },
    { page: 'markets', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
    { page: 'trade', label: 'Trade', icon: <TrendingUp className="w-4 h-4" /> },
    { page: 'deploy', label: 'Contracts', icon: <FileCode className="w-4 h-4" /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const isLanding = currentPage === 'landing';

  // Fetch notifications
  useEffect(() => {
    if (!wallet.address) return;
    async function fetchNotifs() {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('wallet_address', wallet.address)
          .order('created_at', { ascending: false })
          .limit(10);
        setNotifications(data || []);
      } catch {
        setNotifications([]);
      }
    }
    fetchNotifs();
  }, [wallet.address]);

  // Realtime notifications
  useEffect(() => {
    if (!wallet.address) return;
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `wallet_address=eq.${wallet.address}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [wallet.address]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('wallet_address', wallet.address).eq('read', false);
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding ? 'bg-transparent' : 'bg-[#0a0b0f]/90 backdrop-blur-xl border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                PreMarketX
              </span>
            </button>

            {/* Desktop Nav */}
            {!isLanding && (
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      currentPage === item.page
                        ? 'bg-white/10 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right side: Role toggle + Notifications + Wallet */}
            <div className="hidden md:flex items-center gap-2">
              {/* Role Toggle */}
              {!isLanding && (
                <button
                  onClick={toggleRole}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isAdmin
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {isAdmin ? 'Admin' : 'User'}
                </button>
              )}

              {/* Notifications */}
              {wallet.isConnected && !isLanding && (
                <div className="relative">
                  <button
                    onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); if (!notifDropdownOpen) markAllRead(); }}
                    className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {unreadCount > 0 ? (
                      <BellRing className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Bell className="w-5 h-5 text-gray-400" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-sm font-semibold">Notifications</span>
                        <button onClick={markAllRead} className="text-xs text-emerald-400 hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
                        )}
                        {notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-white/5 ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet */}
              {wallet.isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-mono">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {walletDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-lg font-bold">{wallet.balance} USDC</p>
                      </div>
                      <button
                        onClick={() => { wallet.disconnect(); setWalletDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={wallet.connect}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0b0f]/95 backdrop-blur-xl border-b border-white/5">
            <div className="px-4 py-4 space-y-2">
              {!isLanding && (
                <button
                  onClick={() => { toggleRole(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                    isAdmin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {isAdmin ? 'Admin Mode' : 'User Mode'} - Tap to switch
                </button>
              )}
              {!isLanding && navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    currentPage === item.page ? 'bg-white/10 text-emerald-400' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              {!wallet.isConnected && (
                <button
                  onClick={() => { wallet.connect(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-sm"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className={isLanding ? '' : 'pt-16'}>
        {children}
      </main>
    </div>
  );
}
