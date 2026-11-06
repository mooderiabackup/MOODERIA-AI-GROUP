import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { AIAccount } from '../types/database';
import {
  Bot,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  Cpu,
  Key,
  ShieldCheck,
  Zap,
  Activity,
  ExternalLink,
  Shield,
  Database
} from 'lucide-react';

export const AIAccountsView: React.FC = () => {
  const {
    accounts,
    connectedAccountCount,
    registeredAccountCount,
    verifyMcpConnection,
    setSelectedMcpSlot,
    supabaseStatus,
    setIsAuthModalOpen,
  } = useBrain();

  const [verifyingSlot, setVerifyingSlot] = useState<number | null>(null);

  const handleVerify = async (slotNumber: number) => {
    setVerifyingSlot(slotNumber);
    await verifyMcpConnection(slotNumber);
    setVerifyingSlot(null);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header & Capacity Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
                <Bot className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 font-display">
                CLAUDE AI ACCOUNTS
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              8 protected Claude account identities sharing one centralized Supabase AI Brain
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-purple-100 shadow-xs text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-purple-700" />
              <span className="text-slate-500">Registered:</span>
              <span className="font-bold text-slate-900">{registeredAccountCount}/8</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-purple-100 shadow-xs text-xs font-semibold">
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500">Live MCP:</span>
              <span className="font-bold text-emerald-700">{connectedAccountCount}/8</span>
            </div>
          </div>
        </div>

        {/* Capacity Visual Progress Bar */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Swarm Synchronization Status</span>
            <span className="text-purple-700 font-bold">
              {registeredAccountCount} Registered • {connectedAccountCount} Live
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  acc.mcp_connection_state === 'connected'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs'
                    : acc.is_registered_in_db
                    ? 'bg-purple-600'
                    : 'bg-slate-200'
                }`}
                title={`Slot ${acc.slot_number}: ${acc.account_name} (${acc.status_message})`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 8 Claude Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {accounts.map((account) => {
          const isMcpLive = account.mcp_connection_state === 'connected';
          const isRegistered = account.is_registered_in_db;
          const isChecking = verifyingSlot === account.slot_number;

          return (
            <div
              key={account.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 ${
                isMcpLive
                  ? 'bg-white border-emerald-300 shadow-sm'
                  : isRegistered
                  ? 'bg-white border-purple-200/90 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-white'
              }`}
            >
              {/* Top Row: Slot & Badges */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 font-display">
                    Slot #{account.slot_number}
                  </span>
                  
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isRegistered
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isRegistered ? 'bg-purple-600' : 'bg-slate-400'}`} />
                    {isRegistered ? 'DB Registered' : 'Not Registered'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isMcpLive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isMcpLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    {isMcpLive ? 'MCP Live' : 'Awaiting MCP'}
                  </span>
                </div>

                <button
                  onClick={() => handleVerify(account.slot_number)}
                  disabled={isChecking}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                  title="Ping Edge Function 'ai-brain-api'"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Pinging...' : 'Ping'}</span>
                </button>
              </div>

              {/* Account Details */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    {account.account_name}
                  </h3>
                  <span className="font-mono-code text-[11px] text-purple-700 font-semibold">
                    {account.model_id}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {account.identity_label}
                </p>
              </div>

              {/* State description */}
              <div className="my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="text-[11px] text-slate-500 leading-tight">
                  {account.status_message}
                </p>
              </div>

              {/* Action: Open Remote MCP Config & Verification Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono-code">
                  <Terminal className="w-3.5 h-3.5 text-purple-600" />
                  Remote MCP Bridge
                </span>

                <button
                  onClick={() => setSelectedMcpSlot(account)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Remote MCP Setup</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
