import React from 'react';
import { useBrain } from '../context/BrainContext';
import {
  Sparkles,
  Bot,
  Brain,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Activity,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  FileText,
  AlertCircle,
  Key
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    connectedAccountCount,
    registeredAccountCount,
    totalMemoriesCount,
    accounts,
    memories,
    projects,
    decisions,
    activities,
    setActiveTab,
    setIsBrainModalOpen,
    setIsCreateMemoryOpen,
    setIsAuthModalOpen,
    supabaseStatus,
    isLoadingData,
  } = useBrain();

  const recentMemories = memories.slice(0, 3);
  const activeProjects = projects.slice(0, 3);
  const recentDecisions = decisions.slice(0, 2);
  const recentActivities = activities.slice(0, 4);

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Welcome Section */}
      <section className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-purple-600 uppercase">
            YOUR CENTRALIZED AI INTELLIGENCE WORKSPACE
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              supabaseStatus.isConnected
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supabaseStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            {supabaseStatus.isConnected ? 'Supabase Live' : 'Supabase Disconnected'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-900 font-display">
          WELCOME BACK, ADMIN!
        </h1>
      </section>

      {/* Connection Alert Prompt Banner (if Supabase not connected) */}
      {!supabaseStatus.isConnected && (
        <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-700/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-white/10 text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm font-display tracking-tight">
                Connect Your Live Supabase Backend
              </p>
              <p className="text-xs text-purple-200/90 mt-0.5 leading-snug">
                Link your Supabase URL & Anon Key to load existing memories, active Claude slots, and projects directly from PostgreSQL.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 font-black text-xs shadow-sm hover:bg-purple-50 transition-all cursor-pointer shrink-0"
          >
            <Key className="w-3.5 h-3.5 text-purple-700" />
            <span>Connect Supabase</span>
          </button>
        </section>
      )}

      {/* 2. Two Large Statistic Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: AI Accounts */}
        <div
          onClick={() => setActiveTab('accounts')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-4 sm:p-5 border border-purple-100 shadow-[0_4px_20px_-4px_rgba(107,33,168,0.08)] hover:shadow-lg hover:border-purple-300 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-700 tracking-wide">
              CAPACITY 8
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AI ACCOUNTS
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display italic">
                {registeredAccountCount}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                / 8 In Supabase
              </span>
            </div>
          </div>

          {/* Mini Slot Progress Dots */}
          <div className="mt-3 flex items-center gap-1">
            {accounts.map((acc) => (
              <span
                key={acc.id}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  acc.mcp_connection_state === 'connected'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : acc.is_registered_in_db
                    ? 'bg-purple-600'
                    : 'bg-slate-200'
                }`}
                title={`${acc.account_name}: ${acc.status_message}`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Total Memories */}
        <div
          onClick={() => setActiveTab('memories')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-4 sm:p-5 border border-purple-100 shadow-[0_4px_20px_-4px_rgba(107,33,168,0.08)] hover:shadow-lg hover:border-purple-300 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide flex items-center gap-1 ${
                supabaseStatus.isConnected
                  ? 'bg-emerald-100/70 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus.isConnected ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              ></span>
              {supabaseStatus.isConnected ? 'PostgreSQL' : 'Waiting DB'}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL MEMORIES
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display italic">
                {totalMemoriesCount}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                In Supabase
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-purple-700">
            <span className="truncate">
              {supabaseStatus.isConnected ? 'Live Query' : 'Connect DB'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </section>

      {/* 3. Main Hero Card: Heavily Rounded Purple Gradient Card */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-purple-950/20 border border-purple-700/40">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest text-purple-200 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            MOODERIA AI GROUP
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-tight text-white leading-tight font-display">
              ONE BRAIN. MULTIPLE AI ACCOUNTS. SHARED INTELLIGENCE.
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-xl">
              Manage your AI accounts, centralize memories, organize projects, and share important knowledge through one intelligent memory system.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBrainModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-purple-900 font-extrabold text-xs sm:text-sm shadow-lg shadow-black/10 hover:bg-purple-50 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-700 fill-purple-700" />
              <span>OPEN AI BRAIN</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </button>

            <button
              onClick={() => {
                if (!supabaseStatus.isConnected) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateMemoryOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Memory</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Connected AI Accounts Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Connected AI Accounts
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('accounts')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All (8 Slots)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Claude Accounts Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {accounts.map((account) => {
            const isMcpConnected = account.mcp_connection_state === 'connected';
            const isRegistered = account.is_registered_in_db;
            return (
              <div
                key={account.id}
                onClick={() => setActiveTab('accounts')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isMcpConnected
                    ? 'bg-white border-purple-300 shadow-xs hover:border-purple-500'
                    : isRegistered
                    ? 'bg-purple-50/50 border-purple-200 hover:border-purple-400'
                    : 'bg-slate-50/70 border-slate-200/70 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                    Slot {account.slot_number}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isMcpConnected
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRegistered
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isMcpConnected
                          ? 'bg-emerald-500'
                          : isRegistered
                          ? 'bg-purple-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {isMcpConnected ? 'MCP Live' : isRegistered ? 'In DB' : 'Unregistered'}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-xs truncate">
                  {account.account_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {account.identity_label}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono-code text-[9px] text-purple-700 font-semibold truncate">
                    {account.model_id}
                  </span>
                  <span className={isMcpConnected ? 'text-emerald-700 font-bold' : isRegistered ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                    {isMcpConnected ? 'Active' : isRegistered ? 'DB Ready' : 'Setup'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Recent Memories Section (Real Supabase data or empty state) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Recent Memories
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('memories')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <Brain className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-xs sm:text-sm text-slate-700">
              No memories in Supabase yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Save your first intelligence entry to centralize architecture guidelines, schemas, and shared decisions.
            </p>
            <button
              onClick={() => {
                if (!supabaseStatus.isConnected) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateMemoryOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save First Memory</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentMemories.map((mem) => {
              const importanceColors = {
                critical: 'bg-rose-50 text-rose-700 border-rose-200',
                high: 'bg-amber-50 text-amber-800 border-amber-200',
                medium: 'bg-purple-50 text-purple-700 border-purple-200',
                low: 'bg-slate-100 text-slate-600 border-slate-200',
              };

              return (
                <div
                  key={mem.id}
                  onClick={() => setActiveTab('memories')}
                  className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        importanceColors[mem.importance || 'medium']
                      }`}
                    >
                      {mem.importance || 'medium'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mem.owner_id ? `Owner: ${mem.owner_id.slice(0, 6)}...` : mem.category || 'Shared Brain'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                    {mem.title || 'Memory Node'}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {mem.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {(mem.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Active Projects & Recent Decisions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Projects */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                Active Projects
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              See All
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No projects stored in Supabase yet.
            </div>
          ) : (
            <div className="space-y-2">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setActiveTab('projects')}
                  className="p-3 rounded-xl bg-slate-50/80 hover:bg-purple-50/50 border border-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900">{project.name}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {project.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{project.category}</span>
                    <span className="font-semibold text-purple-700">
                      {project.memory_count} memories
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Decisions */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                Recent Decisions
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Audit
            </span>
          </div>

          {recentDecisions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No decisions recorded in Supabase yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 truncate">{dec.title}</p>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                      {dec.status || 'Adopted'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {dec.decision}
                  </p>
                  {dec.reason && (
                    <p className="text-[10px] text-slate-500 italic">
                      Reason: {dec.reason}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Logged: {new Date(dec.created_at || '').toLocaleDateString()}</span>
                    <span className="text-emerald-700 font-semibold">{dec.owner_id ? `Owner: ${dec.owner_id.slice(0, 6)}...` : 'Brain'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. System Activity & Audit Section */}
      <section className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
              System Activity & Memory Access
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
          >
            Full Log
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No access logs recorded in Supabase yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-start gap-3">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {act.account_id ? `Account: ${act.account_id}` : act.owner_id ? `Owner: ${act.owner_id.slice(0, 8)}...` : 'System Client'}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug font-mono-code">
                    Action: {act.action} {act.details ? `• ${act.details}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
