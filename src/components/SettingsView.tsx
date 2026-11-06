import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import {
  Settings,
  Database,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Key,
  Server,
  Terminal,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    supabaseStatus,
    saveSupabaseConfig,
    resetSupabaseConfig,
    refreshBrainData,
  } = useBrain();

  const [inputUrl, setInputUrl] = useState(supabaseStatus.url || '');
  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const existingTables = [
    { name: 'profiles', desc: 'owner_id, display_name, profile_summary, preferences' },
    { name: 'brain_members', desc: 'owner_id, member_user_id, role, is_active' },
    { name: 'ai_accounts', desc: 'id, owner_id, account_name, provider, is_active, connected_at, auth_user_id' },
    { name: 'projects', desc: 'id, owner_id, name, description, status, summary' },
    { name: 'memories', desc: 'id, owner_id, project_id, source_account_id, category, title, content, tags, importance, status' },
    { name: 'decisions', desc: 'id, owner_id, project_id, title, decision, reason' },
    { name: 'memory_versions', desc: 'id, memory_id, owner_id, previous_content, changed_at, changed_by' },
    { name: 'memory_access_logs', desc: 'id, owner_id, account_id, action, details, created_at' },
  ];

  const existingFunctions = [
    { name: 'save_memory', signature: '(p_content, p_title, p_tags, p_importance, p_project_id, ...)' },
    { name: 'search_memory', signature: '(p_query_text, p_match_count)' },
    { name: 'get_memory', signature: '(p_memory_id)' },
    { name: 'update_memory', signature: '(p_memory_id, p_content, p_title)' },
    { name: 'delete_memory', signature: '(p_memory_id)' },
    { name: 'restore_memory', signature: '(p_memory_id)' },
    { name: 'get_memory_history', signature: '(p_memory_id)' },
    { name: 'current_brain_owner', signature: '()' },
    { name: 'has_brain_access', signature: '(p_user_id / p_auth_user_id)' },
    { name: 'register_brain_account', signature: '(p_auth_user_id, p_account_name, p_provider)' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      setSaveMessage({ text: 'Please provide both URL and Anon Key.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const ok = await saveSupabaseConfig(inputUrl, inputKey);
      if (ok) {
        setSaveMessage({ text: 'Connected successfully to existing Supabase project!', type: 'success' });
      } else {
        setSaveMessage({ text: 'Failed to connect. Please verify URL and public Anon Key.', type: 'error' });
      }
    } catch (err: any) {
      setSaveMessage({ text: err.message || 'Connection error', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 font-display">
            BRAIN SYSTEM & BACKEND
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configured for existing Supabase PostgreSQL, Row Level Security, and Edge Functions
        </p>
      </div>

      {/* Supabase Connection Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border ${
          supabaseStatus.isConnected
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-purple-50/70 border-purple-200 text-purple-900'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {supabaseStatus.isConnected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Database className="w-6 h-6 text-purple-600 shrink-0" />
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base font-display">
                {supabaseStatus.isConnected
                  ? 'Connected to Live Supabase Backend'
                  : 'Operating in AI Brain Preview Mode'}
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                {supabaseStatus.isConnected
                  ? `Active endpoint: ${supabaseStatus.url}`
                  : 'Connect your existing Supabase URL and Anon Key below to query your live tables directly.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshBrainData()}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-xs border border-slate-200 transition-colors shrink-0"
            title="Recheck connection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Supabase Credentials Configuration Form */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-700" />
            <h3 className="font-bold text-slate-900 text-sm font-display">
              Supabase Project Connection
            </h3>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            Client-Safe Anon Key
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden font-mono-code"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Public Anon / Publishable Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden font-mono-code"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Never enter service-role or secret keys. The frontend only uses public anon keys with RLS.
            </p>
          </div>

          {saveMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Connecting...' : 'Connect Supabase'}
            </button>
            {supabaseStatus.isConfigured && (
              <button
                type="button"
                onClick={resetSupabaseConfig}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Reset to Demo
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Backend Verification Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing Tables Checklist */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Existing Tables Verified
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                supabaseStatus.isConnected
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-500 bg-slate-100'
              }`}
            >
              {supabaseStatus.isConnected ? 'Live Verified' : 'Awaiting Connection'}
            </span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {existingTables.map((t) => {
              const isTableOk = supabaseStatus.isConnected && supabaseStatus.tableStatus[t.name] !== false;
              return (
                <div
                  key={t.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono-code font-bold text-purple-900">
                      {t.name}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate">{t.desc}</p>
                  </div>
                  {isTableOk ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing SQL Functions Checklist */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Existing SQL Functions & Edge API
              </h3>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              10 RPCs + Edge
            </span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 border border-purple-200 text-xs font-bold text-purple-900">
              <span>ai-brain-api (Edge Function)</span>
              <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
            </div>

            {existingFunctions.map((fn) => (
              <div
                key={fn.name}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-mono-code font-bold text-slate-800">
                    {fn.name}
                  </span>
                  <p className="text-[9px] text-slate-400 font-mono-code truncate">
                    {fn.signature}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
