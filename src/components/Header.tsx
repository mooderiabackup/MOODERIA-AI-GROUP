import React, { useState } from 'react';
import { MooderiaLogo } from './MooderiaLogo';
import { useBrain } from '../context/BrainContext';
import { Sparkles, Database, ShieldCheck, ChevronDown, CheckCircle2, User, Key, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isBrainOnline,
    setIsBrainOnline,
    supabaseStatus,
    refreshBrainData,
    connectedAccountCount,
    setActiveTab,
    setIsBrainModalOpen,
    setIsAuthModalOpen,
    user,
    signOutUser,
    isMainOwner,
  } = useBrain();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBrainData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mooderia Logo */}
        <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
          <MooderiaLogo size="md" />
        </div>

        {/* Center: AI Brain Online & Supabase Status Indicator */}
        <div className="flex items-center gap-2">
          {/* Supabase Connection Button / Pill */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border cursor-pointer ${
              supabaseStatus.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                : 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200 animate-pulse'
            }`}
            title="Supabase Connection & Auth Settings"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {supabaseStatus.isConnected ? 'Supabase Connected' : 'Connect Supabase'}
            </span>
            <span className="sm:hidden">
              {supabaseStatus.isConnected ? 'DB Live' : 'Connect'}
            </span>
          </button>

          <button
            onClick={() => setIsBrainOnline(!isBrainOnline)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border cursor-pointer ${
              isBrainOnline
                ? 'bg-slate-50 text-slate-800 border-slate-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title="Toggle AI Brain status"
          >
            <span className="relative flex h-2 w-2">
              {isBrainOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBrainOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="hidden xs:inline uppercase text-[11px] font-bold">
              {isBrainOnline ? 'Brain Online' : 'Brain Paused'}
            </span>
          </button>

          {/* Quick sync button */}
          <button
            onClick={handleManualRefresh}
            className={`p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer ${
              isRefreshing ? 'animate-spin text-purple-600' : ''
            }`}
            title="Refresh AI Brain state from Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Circular User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-purple-100 hover:ring-purple-300 transition-all focus:outline-hidden"
            aria-label="User profile menu"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-xs">
              <span>AD</span>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 px-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                    {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.email || 'Admin Controller'}
                    </p>
                    <p className="text-xs text-purple-600 font-medium">
                      {user ? 'Authenticated Brain Admin' : 'Unauthenticated Session'}
                    </p>
                  </div>
                </div>

                <div className="py-2 text-xs space-y-1">
                  <div className="flex items-center justify-between px-2 py-1.5 text-slate-600 rounded-lg bg-slate-50">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Role
                    </span>
                    <span className="font-semibold text-slate-800">
                      {isMainOwner ? 'Main Owner (Verified)' : user ? 'Brain Member' : 'Guest / Read-only'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2 py-1.5 text-slate-600 rounded-lg bg-slate-50">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-purple-600" />
                      Database
                    </span>
                    <span
                      className={`font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                        supabaseStatus.isConnected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {supabaseStatus.isConnected ? 'Supabase Live' : 'Not Connected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2 py-1.5 text-slate-600 rounded-lg bg-slate-50">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Connected AI Accounts
                    </span>
                    <span className="font-semibold text-purple-700">
                      {connectedAccountCount} / 8
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-purple-700 font-semibold hover:bg-purple-50 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    Supabase Credentials & Auth
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsBrainModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    Open Neural Inspector
                  </button>
                  {user && (
                    <button
                      onClick={() => {
                        signOutUser();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left font-semibold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
