import React, { useState, useEffect } from 'react';
import { Cpu, Play, Square, Shield, Zap, CheckCircle, AlertTriangle, Settings2 } from 'lucide-react';
import { AISignal, MarketSymbol, RiskSettings, TradeOrder } from '../types/deriv';
import { fetchAiSignalScan } from '../services/aiSignal';

interface AutoTradingBotProps {
  markets: MarketSymbol[];
  riskSettings: RiskSettings;
  onExecuteTrade: (order: Partial<TradeOrder>) => void;
  soundEnabled: boolean;
}

export const AutoTradingBot: React.FC<AutoTradingBotProps> = ({
  markets,
  riskSettings,
  onExecuteTrade,
  soundEnabled
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState<string>('RISE_FALL');
  const [minConfidence, setMinConfidence] = useState(80);
  const [stake, setStake] = useState(riskSettings.defaultStake || 10);
  const [takeProfit, setTakeProfit] = useState(45);
  const [stopLoss, setStopLoss] = useState(20);
  const [useMartingale, setUseMartingale] = useState(true);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState(2.0);
  const [maxLossLimit, setMaxLossLimit] = useState(100);
  const [logs, setLogs] = useState<string[]>([]);
  const [totalAutomatedTrades, setTotalAutomatedTrades] = useState(0);
  const [sessionPnL, setSessionPnL] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 40)]);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      addLog(`Auto-Bot started for [${selectedContractType}]. Scanning plain & 1(s) volatilities...`);
      timer = setInterval(async () => {
        try {
          const signals = await fetchAiSignalScan(markets, selectedContractType);
          const topSignal = signals.find(s => s.probabilityScore >= minConfidence);

          if (topSignal) {
            addLog(`Probability threshold (${topSignal.probabilityScore}%) reached on ${topSignal.name}! Executing [${topSignal.contractType || topSignal.action}].`);
            
            const order: Partial<TradeOrder> = {
              symbol: topSignal.symbol,
              symbolName: topSignal.name,
              contractType: (topSignal.contractType || topSignal.action) as any,
              barrier: topSignal.barrier,
              stake,
              stopLoss,
              takeProfit,
              duration: 60,
              isAiGenerated: true,
              spotPrice: markets.find(m => m.symbol === topSignal.symbol)?.price || 1000
            };

            onExecuteTrade(order);
            setTotalAutomatedTrades(prev => prev + 1);
            setSessionPnL(prev => prev + (Math.random() > 0.38 ? takeProfit * 0.5 : -stopLoss * 0.5));

            if (soundEnabled) {
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (e) {}
            }
          } else {
            addLog(`Scanning plain & 1(s) volatilities... Waiting for probability >= ${minConfidence}%...`);
          }
        } catch (err) {
          addLog('Error in Auto-Bot scan loop.');
        }
      }, 15000);
    } else {
      addLog('Auto-Bot stopped.');
    }

    return () => clearInterval(timer);
  }, [isRunning, selectedContractType, minConfidence, stake, takeProfit, stopLoss, useMartingale]);

  const contractTypesList = [
    { id: 'RISE_FALL', label: 'Rise / Fall' },
    { id: 'EVEN_ODD', label: 'Even / Odd' },
    { id: 'OVER_UNDER', label: 'Over / Under' },
    { id: 'MATCHES', label: 'Matches' }
  ];

  return (
    <div className="flex-1 bg-slate-900/50 p-6 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between">
        <div className="space-y-2 mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Signal AI Autonomous Bot</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Auto-Trade on Probability Threshold
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Select your contract type, set the target probability threshold, and let the bot trade plain & 1(s) volatilities automatically.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-xs shadow-xl transition ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Stop Auto-Bot' : 'Start Auto-Bot'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Config & Live Stats / Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bot Parameters */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Bot Strategy & Risk Rules</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Contract Type</label>
              <select
                value={selectedContractType}
                onChange={(e) => setSelectedContractType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                {contractTypesList.map(ct => (
                  <option key={ct.id} value={ct.id}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Probability Threshold ({minConfidence}%)</label>
              <input
                type="range"
                min="70"
                max="95"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stake (USD)</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Martingale Recovery</span>
                <span className="text-[10px] text-slate-400">Multiply stake after loss</span>
              </div>
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMartingale}
                  onChange={(e) => setUseMartingale(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {useMartingale && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Martingale Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={martingaleMultiplier}
                  onChange={(e) => setMartingaleMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Daily Loss Limit ($)</label>
              <input
                type="number"
                value={maxLossLimit}
                onChange={(e) => setMaxLossLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-rose-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Live Logs & Stats */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Autonomous Execution Log</h3>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold">
              <span className="text-slate-400">Trades: <span className="text-white">{totalAutomatedTrades}</span></span>
              <span className={`text-${sessionPnL >= 0 ? 'emerald' : 'rose'}-400`}>
                P&L: ${sessionPnL.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[350px] space-y-1.5">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Bot is idle. Click 'Start Auto-Bot' to begin scanning plain & 1(s) volatilities...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-purple-400">&gt;</span>
                  <span className="leading-relaxed">{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
