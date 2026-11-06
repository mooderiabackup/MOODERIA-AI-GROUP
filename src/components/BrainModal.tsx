
import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import {
  X,
  Brain,
  Search,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { rpcSearchMemory } from '../lib/supabase';
import { Memory } from '../types/database';

export const BrainModal: React.FC = () => {
  const {
    isBrainModalOpen,
    setIsBrainModalOpen,
    connectedAccountCount,
    registeredAccountCount,
    totalMemoriesCount,
    accounts,
    setActiveTab,
    setSearchQuery,
    user,
  } = useBrain();

  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<Memory[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isBrainModalOpen) return null;

  const handleTestSearch = async () => {
    if (!testQuery.trim()) {
      setTestResults(null);
      setSearchError(null);
      return;
    }

    if (!user) {
      setSearchError('Please sign in before searching memories.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setTestResults(null);

    try {
      const results = await rpcSearchMemory({
        queryText: testQuery.trim(),
        matchCount: 20,
      });

      setTestResults(
        results.map((item: any) => ({
          id: item.memory_id,
          category: item.category,
          title: item.title,
          content: item.content,
          tags: item.tags || [],
          importance: Number(item.importance ?? 3),
          project_id: item.project_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))
      );
    } catch (error: any) {
      setSearchError(
        error?.message || 'Database memory search failed.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setIsBrainModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Brain Inspector"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/15 text-white">
              <Brain className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-purple-200">
              MOODERIA AI BRAIN CORE
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black italic tracking-tight font-display">
            ONE BRAIN. MULTIPLE AI ACCOUNTS.
          </h2>
          <p className="text-xs text-purple-200/90 mt-1 max-w-lg">
            Shared memory storage and account registration status.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
              <p className="text-[10px] text-purple-200 uppercase font-bold">
                MCP Connected
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {connectedAccountCount} / 8
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
              <p className="text-[10px] text-purple-200 uppercase font-bold">
                Registered
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {registeredAccountCount} / 8
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
              <p className="text-[10px] text-purple-200 uppercase font-bold">
                Memories
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {totalMemoriesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              Claude Account Registration
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {accounts.map((account) => (
                <div
                  key={account.slot_number}
                  className={`p-2.5 rounded-xl border text-xs ${
                    account.mcp_connection_state === 'connected'
                      ? 'bg-purple-50 border-purple-200 text-purple-900'
                      : account.is_registered_in_db
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Slot {account.slot_number}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        account.mcp_connection_state === 'connected'
                          ? 'bg-emerald-500'
                          : account.is_registered_in_db
                          ? 'bg-purple-500'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <p className="font-semibold truncate text-[11px] mt-0.5">
                    {account.account_name}
                  </p>

                  <p className="text-[10px] mt-1 opacity-75">
                    {account.mcp_connection_state === 'connected'
                      ? 'MCP connected'
                      : account.is_registered_in_db
                      ? 'Registered'
                      : 'Not registered'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-600" />
                Database Memory Search
              </span>

              <span className="text-[10px] font-bold text-purple-700">
                PostgreSQL RPC
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleTestSearch();
                  }
                }}
                placeholder="Search shared memories..."
                className="flex-1 min-w-0 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
              />

              <button
                type="button"
                onClick={() => void handleTestSearch()}
                disabled={isSearching || !user}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-rose-600">
                {searchError}
              </p>
            )}

            {testResults !== null && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500">
                  {testResults.length} database result(s):
                </p>

                {testResults.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No matching memories found.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {testResults.map((result) => (
                      <button
                        type="button"
                        key={result.id}
                        onClick={() => {
                          setIsBrainModalOpen(false);
                          setSearchQuery(result.title || '');
                          setActiveTab('memories');
                        }}
                        className="w-full text-left p-2.5 bg-white rounded-xl border border-slate-200 hover:border-purple-300 text-xs cursor-pointer transition-colors"
                      >
                        <p className="font-bold text-slate-900 truncate">
                          {result.title || 'Memory'}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {result.content}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Protected by Row Level Security
          </span>

          <button
            type="button"
            onClick={() => {
              setIsBrainModalOpen(false);
              setActiveTab('memories');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Open Memories View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
