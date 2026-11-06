import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  Lock,
  Mail,
  User,
  LogOut,
  RefreshCw,
  Server,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const SupabaseConnectModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    supabaseStatus,
    saveSupabaseConfig,
    resetSupabaseConfig,
    user,
    session,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
  } = useBrain();

  const [activeTab, setActiveTab] = useState<'connect' | 'auth'>('connect');

  // Connection inputs
  const [url, setUrl] = useState(supabaseStatus.url || '');
  const [key, setKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success: boolean; message: string } | null>(null);

  // Auth inputs
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setConnectResult({ success: false, message: 'Both Supabase URL and Anon Key are required.' });
      return;
    }

    setIsSaving(true);
    setConnectResult(null);

    const res = await saveSupabaseConfig(url, key);
    setIsSaving(false);

    if (res.success) {
      setConnectResult({ success: true, message: 'Successfully connected and synced with your Supabase database!' });
    } else {
      setConnectResult({ success: false, message: res.error || 'Failed to connect. Please verify your URL and Key.' });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    if (authMode === 'signin') {
      const res = await signInWithEmail(email, password);
      setIsAuthLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Invalid sign in credentials.');
      } else {
        setIsAuthModalOpen(false);
      }
    } else {
      const res = await signUpWithEmail(email, password);
      setIsAuthLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Sign up failed.');
      } else {
        setAuthError('Sign up successful! Please check your email or proceed to sign in.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-5 sm:p-6">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <Database className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-purple-200">
              SUPABASE INTEGRATION
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black italic tracking-tight font-display">
            CONNECT AI BRAIN BACKEND
          </h2>
          <p className="text-xs text-purple-200/90 mt-0.5">
            Integrates with your existing PostgreSQL database, tables, and authenticated sessions.
          </p>

          {/* Sub Navigation Tabs */}
          <div className="mt-4 flex rounded-xl bg-white/10 p-1 backdrop-blur-xs">
            <button
              onClick={() => setActiveTab('connect')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'connect'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              1. Database Credentials
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'auth'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              2. Supabase Auth
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'connect' && (
            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900 leading-snug">
                  <p className="font-bold">Zero Mock Data Policy</p>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Enter your live Supabase URL and Anon Key. All memories, Claude account slots, projects, and activities will be read and written directly to your PostgreSQL database.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden font-mono-code"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Anon / Publishable Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden font-mono-code"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Find this in your Supabase Dashboard under <b>Project Settings → API → Project API Keys → anon / public</b>.
                </p>
              </div>

              {connectResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    connectResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {connectResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{connectResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Testing Connection...' : 'Connect to Supabase'}
                </button>

                {supabaseStatus.isConfigured && (
                  <button
                    type="button"
                    onClick={resetSupabaseConfig}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-4">
              {user ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Authenticated Session Active
                    </span>
                    <span className="text-[10px] font-mono-code bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                      RLS Authorized
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-900">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">User ID:</span>{' '}
                      <span className="font-mono-code text-[11px]">{user.id}</span>
                    </p>
                  </div>

                  <button
                    onClick={signOutUser}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {!supabaseStatus.isConnected && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      Please enter your Supabase URL & Key in Tab 1 first before signing in.
                    </div>
                  )}

                  <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@mooderia.ai"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthLoading || !supabaseStatus.isConnected}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAuthLoading
                      ? 'Authenticating...'
                      : authMode === 'signin'
                      ? 'Sign In with Supabase'
                      : 'Create Supabase User'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
