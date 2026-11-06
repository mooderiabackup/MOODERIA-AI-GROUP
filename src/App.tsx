
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrainProvider, useBrain, NavigationTab } from './context/BrainContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { MemoriesView } from './components/MemoriesView';
import { AIAccountsView } from './components/AIAccountsView';
import { ProjectsView } from './components/ProjectsView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { BrainModal } from './components/BrainModal';
import { CreateMemoryModal } from './components/CreateMemoryModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { McpConfigModal } from './components/McpConfigModal';
import { OAuthConsentPage } from './components/OAuthConsentPage';
import {
  Home,
  Brain,
  Bot,
  FolderKanban,
  Activity,
  Settings,
  Sparkles
} from 'lucide-react';

function MainLayout() {
  const {
    activeTab,
    setActiveTab,
    totalMemoriesCount,
    connectedAccountCount,
    setIsBrainModalOpen
  } = useBrain();

  const desktopNavItems: { id: NavigationTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'memories', label: 'Memories', icon: Brain },
    { id: 'accounts', label: 'AI Accounts', icon: Bot },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'System & DB', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-200 selection:text-purple-900 font-sans">
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-24 md:pb-10">
        <div className="flex gap-8">
          <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase text-purple-700 tracking-wider px-3 py-1">
                Workspace Navigation
              </p>

              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-sm shadow-purple-900/20'
                        : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.id === 'accounts' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {connectedAccountCount}/8
                      </span>
                    )}

                    {item.id === 'memories' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {totalMemoriesCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl p-5 shadow-lg shadow-purple-950/15 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-purple-200">
                  SHARED INTELLIGENCE
                </span>
              </div>

              <p className="text-xs text-purple-100 leading-snug">
                One Brain orchestrating 8 authorized Claude instances via Remote MCP.
              </p>

              <button
                onClick={() => setIsBrainModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white text-purple-900 text-xs font-extrabold shadow-sm hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Inspect AI Brain
              </button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === 'home' && <DashboardView />}
            {activeTab === 'memories' && <MemoriesView />}
            {activeTab === 'accounts' && <AIAccountsView />}
            {activeTab === 'projects' && <ProjectsView />}
            {activeTab === 'activity' && <ActivityView />}
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      <BottomNav />

      <BrainModal />
      <CreateMemoryModal />
      <SupabaseConnectModal />
      <McpConfigModal />
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/oauth/consent') {
    return <OAuthConsentPage />;
  }

  return (
    <BrainProvider>
      <MainLayout />
    </BrainProvider>
  );
}
