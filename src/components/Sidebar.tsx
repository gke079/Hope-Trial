import React from 'react';
import { Radar, LineChart, Cpu, ShieldAlert, History, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePositionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activePositionsCount
}) => {
  const menuItems = [
    { id: 'scanner', label: 'AI Volatility Scanner', icon: Radar, badge: 'AI' },
    { id: 'terminal', label: 'Live Pro Terminal', icon: LineChart },
    { id: 'autobot', label: 'Signal AI Auto-Bot', icon: Cpu, badge: 'Auto' },
    { id: 'portfolio', label: 'Portfolio & Risk', icon: ShieldAlert, count: activePositionsCount },
    { id: 'history', label: 'Trade Analytics', icon: History }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Trading Platform
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-indigo-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 m-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Radar className="w-4 h-4 animate-spin" />
          <span className="text-xs font-bold">Signal AI Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Scanning all Deriv Synthetic Volatility & Boom/Crash indices in real time.
        </p>
      </div>
    </aside>
  );
};
