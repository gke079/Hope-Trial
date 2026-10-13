import React from 'react';
import { Activity, ShieldCheck, Settings, Bot, Volume2, VolumeX, User, Wallet } from 'lucide-react';
import { DerivAccount } from '../types/deriv';

interface NavbarProps {
  account: DerivAccount;
  connectionStatus: { status: string; mode: string };
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenSettings: () => void;
  onOpenAiAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  connectionStatus,
  soundEnabled,
  setSoundEnabled,
  onOpenSettings,
  onOpenAiAdvisor
}) => {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Connection */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              DERIVEDGE <span className="text-indigo-400">PRO AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Synthetic & Derivative Intelligence</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
          <span className={`w-2 h-2 rounded-full ${connectionStatus.status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="text-[11px] font-medium text-slate-300 capitalize">
            Deriv WS ({connectionStatus.mode})
          </span>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-4">
        {/* Account Badge & Balance */}
        <div 
          onClick={onOpenSettings}
          className="flex items-center space-x-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 cursor-pointer transition shadow-inner"
        >
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-200">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                account.isVirtual ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {account.isVirtual ? 'Demo' : 'Real'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{account.email}</p>
          </div>
        </div>

        {/* AI Advisor Trigger */}
        <button
          onClick={onOpenAiAdvisor}
          className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-lg shadow-purple-500/10"
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Signal AI Mentor</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
          title={soundEnabled ? 'Mute Sound Alerts' : 'Enable Sound Alerts'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
          title="Account Settings & API Token"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
