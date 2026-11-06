import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { MemoryAccessLog } from '../types/database';
import {
  Activity,
  Search,
  Database,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  FileEdit,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activities } = useBrain();
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = activities.filter((act) => {
    if (filterAction === 'all') return true;
    return act.action === filterAction;
  });

  const getActionBadge = (action: MemoryAccessLog['action']) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      write: { label: 'Write', bg: 'bg-emerald-50', text: 'text-emerald-800', icon: ArrowUpRight },
      read: { label: 'Read', bg: 'bg-blue-50', text: 'text-blue-700', icon: Database },
      search: { label: 'Search', bg: 'bg-purple-50', text: 'text-purple-700', icon: Search },
      sync: { label: 'Sync', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: RefreshCw },
      update: { label: 'Update', bg: 'bg-amber-50', text: 'text-amber-800', icon: FileEdit },
      delete: { label: 'Delete', bg: 'bg-rose-50', text: 'text-rose-700', icon: Trash2 },
    };

    const c = config[action] || { label: action, bg: 'bg-slate-100', text: 'text-slate-700', icon: Activity };
    const Icon = c.icon;

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 font-display">
              SYSTEM ACTIVITY & AUDIT LOGS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time memory access and synchronization logs across all AI instances
          </p>
        </div>

        {/* Action Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['all', 'write', 'search', 'sync', 'delete'].map((action) => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                filterAction === action
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 sm:p-5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
            <div className="mt-0.5 p-2 rounded-xl bg-purple-50 text-purple-700 shrink-0">
              <Activity className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {log.account_id ? `Account: ${log.account_id}` : log.owner_id ? `Owner: ${log.owner_id.slice(0, 8)}...` : 'System Client'}
                  </span>
                  {getActionBadge(log.action)}
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {new Date(log.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800">
                  Action: <span className="font-mono-code uppercase text-purple-700">{log.action}</span>
                </p>
                {log.details && (
                  <p className="text-[11px] font-mono-code text-slate-500 mt-0.5">
                    Details: {log.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No access logs recorded in Supabase yet.
          </div>
        )}
      </div>
    </div>
  );
};
