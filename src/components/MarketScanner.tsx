import React, { useEffect, useState } from 'react';
import { Radar, Sparkles, TrendingUp, TrendingDown, Zap, Shield, Play, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { AISignal, MarketSymbol, RiskSettings, TradeOrder } from '../types/deriv';
import { fetchAiSignalScan } from '../services/aiSignal';

interface MarketScannerProps {
  markets: MarketSymbol[];
  riskSettings: RiskSettings;
  onExecuteTrade: (order: Partial<TradeOrder>) => void;
  soundEnabled: boolean;
  activePositions: TradeOrder[];
  onClosePosition: (id: string, profit: number) => void;
}

export const MarketScanner: React.FC<MarketScannerProps> = ({
  markets,
  riskSettings,
  onExecuteTrade,
  soundEnabled,
  activePositions,
  onClosePosition
}) => {
  const [selectedContractType, setSelectedContractType] = useState<string>('RISE_FALL');
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoTradeOnSignal, setAutoTradeOnSignal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    const data = await fetchAiSignalScan(markets, selectedContractType);
    setSignals(data);
    setLoading(false);

    if (autoTradeOnSignal && data.length > 0) {
      data.forEach(sig => handleExecute(sig, true));
      setSuccessToast(`Auto-traded ${data.length} available signals instantly!`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  useEffect(() => {
    runScan();
    let interval: any;
    if (autoTradeOnSignal) {
      interval = setInterval(runScan, 15000);
    }
    return () => clearInterval(interval);
  }, [selectedContractType, autoTradeOnSignal]);

  const handleExecute = (sig: AISignal, isAuto: boolean = false) => {
    const order: Partial<TradeOrder> = {
      symbol: sig.symbol,
      symbolName: sig.name,
      contractType: (sig.contractType || sig.action) as any,
      barrier: sig.barrier,
      stake: riskSettings.defaultStake || sig.suggestedStake || 15,
      stopLoss: sig.stopLossPercent || riskSettings.stopLossAmount,
      takeProfit: sig.takeProfitPercent || riskSettings.takeProfitAmount,
      duration: 60,
      isAiGenerated: true,
      spotPrice: markets.find(m => m.symbol === sig.symbol)?.price || 1000
    };
    onExecuteTrade(order);

    if (soundEnabled && !isAuto) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {}
    }

    if (!isAuto) {
      setSuccessToast(`Executed ${sig.contractType || sig.action} trade on ${sig.name}`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const openPositions = activePositions.filter(p => p.status === 'OPEN');

  const contractTypesList = [
    { id: 'RISE_FALL', label: 'Rise / Fall' },
    { id: 'EVEN_ODD', label: 'Even / Odd' },
    { id: 'OVER_UNDER', label: 'Over / Under' },
    { id: 'MATCHES', label: 'Matches' }
  ];

  return (
    <div className="flex-1 bg-slate-900/50 p-6 overflow-y-auto space-y-6">
      {successToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header Banner & Contract Type Selector */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Radar className="w-5 h-5 animate-spin" />
              </div>
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Signal AI Volatility Scanner</span>
              {autoTradeOnSignal && (
                <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  Auto-Trade on Signal Active
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Select Trade Type & Scan All Volatilities (Plain & 1s)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Choose your target derivative contract type. Toggle 'Auto-Trade on Signal' to execute trades instantly as soon as signals appear.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto-Trade on Signal Toggle */}
            <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5">
              <span className="text-xs font-bold text-slate-200">Auto-Trade on Signal</span>
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTradeOnSignal}
                  onChange={(e) => setAutoTradeOnSignal(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <button
              onClick={runScan}
              disabled={loading}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-3 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Scan Now</span>
            </button>
            <button
              onClick={() => {
                signals.forEach(sig => handleExecute(sig));
                setSuccessToast(`Scan & Trade executed on all ${signals.length} volatility markets!`);
              }}
              disabled={loading || signals.length === 0}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-600/30"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Scan & Trade All</span>
            </button>
          </div>
        </div>

        {/* Contract Type Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/20">
          {contractTypesList.map(ct => (
            <button
              key={ct.id}
              onClick={() => setSelectedContractType(ct.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedContractType === ct.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {signals.map((sig, idx) => {
          return (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition group hover:shadow-indigo-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">{sig.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{sig.symbol} • {sig.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{sig.contractType || sig.action} {sig.barrier !== undefined ? `(${sig.barrier})` : ''}</span>
                  </div>
                </div>

                {/* Probability & Confidence */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Probability Score</span>
                    <span className="font-black text-indigo-400">{sig.probabilityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sig.probabilityScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 italic pt-1 leading-relaxed">
                    "{sig.reasoning}"
                  </p>
                </div>

                {/* Risk Parameters preview */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-4">
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <span>Stop Loss: </span>
                    <span className="text-rose-400 font-bold">${riskSettings.stopLossAmount || 20}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <span>Take Profit: </span>
                    <span className="text-emerald-400 font-bold">${riskSettings.takeProfitAmount || 45}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleExecute(sig)}
                className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Execute Signal ({riskSettings.defaultStake || sig.suggestedStake || 15} USD)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Trades & Progress Directly Below Scanner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 mt-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Active Scanned Trades & Progress</h3>
          </div>
          <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
            {openPositions.length} Open Positions
          </span>
        </div>

        {openPositions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No active scanned trades yet. Enable 'Auto-Trade on Signal' or click 'Scan & Trade All' above to start automated trading.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Contract ID</th>
                  <th className="py-3 px-4">Market</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Stake</th>
                  <th className="py-3 px-4">Spot Price</th>
                  <th className="py-3 px-4">Live P&L</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {openPositions.map(pos => {
                  const mockPnL = Number((pos.stake * (Math.random() > 0.4 ? 0.45 : -0.20)).toFixed(2));
                  const isProfit = mockPnL >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-4 font-mono text-slate-300">{pos.id}</td>
                      <td className="py-4 px-4 font-bold text-white">{pos.symbolName}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {pos.contractType} {pos.barrier !== undefined ? `(${pos.barrier})` : ''}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">${pos.stake.toFixed(2)}</td>
                      <td className="py-4 px-4 font-mono text-slate-400">${pos.spotPrice.toFixed(2)}</td>
                      <td className={`py-4 px-4 font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? `+$${mockPnL.toFixed(2)}` : `-$${Math.abs(mockPnL).toFixed(2)}`}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id, mockPnL)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          Close Early
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
