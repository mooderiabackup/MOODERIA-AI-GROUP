import React from 'react';
import { useBrain, NavigationTab } from '../context/BrainContext';
import { Home, Brain, Bot, FolderKanban, Activity, Settings } from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, totalMemoriesCount, connectedAccountCount } = useBrain();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'memories',
      label: 'Memories',
      icon: Brain,
      badge: totalMemoriesCount > 0 ? totalMemoriesCount : undefined,
    },
    {
      id: 'accounts',
      label: 'AI Accounts',
      icon: Bot,
      badge: `${connectedAccountCount}/8`,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.08)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 transition-all">
      <div className="max-w-md md:max-w-xl mx-auto px-2">
        <div className="grid grid-cols-6 gap-1 items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-purple-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                {/* Active Indicator Background Pill */}
                {isActive && (
                  <span className="absolute inset-x-2 -top-1 h-0.5 bg-gradient-to-r from-purple-600 to-violet-500 rounded-full"></span>
                )}

                <div
                  className={`relative p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-100/80 text-purple-700 shadow-xs'
                      : 'group-hover:bg-slate-100/70 text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  
                  {/* Subtle Badge */}
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 py-0.2 rounded-full leading-tight border ${
                        isActive
                          ? 'bg-purple-700 text-white border-white'
                          : 'bg-slate-200 text-slate-600 border-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight transition-colors ${
                    isActive ? 'text-purple-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
