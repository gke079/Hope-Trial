import React, { useState, useEffect } from 'react';
import { LineChart as ChartIcon, TrendingUp, TrendingDown, Sliders, Shield, Zap, Play } from 'lucide-react';
import { MarketSymbol, RiskSettings, TradeOrder } from '../types/deriv';
import { derivManager } from '../services/derivWs';

interface LiveChartProps {
  markets: MarketSymbol[];
  riskSettings: RiskSettings;
  onExecuteTrade: (order: Partial<TradeOrder>) => void;
  soundEnabled: boolean;
}

export const LiveChart: React.FC<LiveChartProps> = ({
  markets,
  riskSettings,
  onExecuteTrade,
  soundEnabled
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(markets[0]?.symbol || 'R_75');
  const [stake, setStake] = useState<number>(riskSettings.defaultStake || 10);
  const [stopLoss, setStopLoss] = useState<number>(riskSettings.stopLossAmount || 20);
  const [takeProfit, setTakeProfit] = useState<number>(riskSettings.takeProfitAmount || 45);
  const [duration, setDuration] = useState<number>(60);
  const [currentPrice, setCurrentPrice] = useState<number>(12450.20);
  const [history, setHistory] = useState<number[]>([12400, 12410, 12430, 12420, 12450]);

  const marketObj = markets.find(m => m.symbol === selectedSymbol) || markets[0];

  useEffect(() => {
    if (marketObj) {
      setCurrentPrice(marketObj.price);
      setHistory(marketObj.history || [100, 102, 101, 105, 104]);
    }

    const handleTick = (tick: any) => {
      if (tick.symbol === selectedSymbol) {
        setCurrentPrice(tick.quote);
        setHistory(prev => [...prev.slice(-25), tick.quote]);
      }
    };

    derivManager.subscribeTicks(selectedSymbol, handleTick);

    return () => {
      derivManager.unsubscribeTicks(selectedSymbol);
    };
  }, [selectedSymbol]);

  const handleBuy = (action: 'CALL' | 'PUT') => {
    const order: Partial<TradeOrder> = {
      symbol: selectedSymbol,
      symbolName: marketObj?.name || selectedSymbol,
      contractType: action,
      stake,
      stopLoss,
      takeProfit,
      duration,
      spotPrice: currentPrice,
      isAiGenerated: false
    };

    onExecuteTrade(order);

    if (soundEnabled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  return (
    <div className="flex-1 bg-slate-900/50 p-6 overflow-y-auto flex flex-col space-y-6">
      {/* Top Selector & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
          >
            {markets.map((m) => (
              <option key={m.symbol} value={m.symbol}>
                {m.name} ({m.symbol})
              </option>
            ))}
          </select>
          <div>
            <div className="text-xl font-black font-mono text-emerald-400">
              ${currentPrice.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400">Real-time Deriv WebSocket Feed</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 block">24h High / Low</span>
            <span className="text-xs font-bold text-slate-200">
              ${marketObj?.high || currentPrice} / ${marketObj?.low || currentPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart & Trading Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Interactive Chart Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ChartIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">{marketObj?.name} Tick Chart</h3>
            </div>
            <div className="flex space-x-1.5 text-xs">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold">1m</span>
              <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-lg">5m</span>
              <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-lg">15m</span>
            </div>
          </div>

          {/* Canvas representation */}
          <div className="flex-1 min-h-[320px] relative flex items-end justify-between space-x-1.5 pt-10 pb-4 px-2 bg-gradient-to-b from-slate-900/40 to-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-black tracking-widest text-white">{selectedSymbol}</span>
            </div>
            {history.map((val, i) => {
              const min = Math.min(...history);
              const max = Math.max(...history);
              const range = max - min || 1;
              const heightPct = Math.max(15, Math.min(90, ((val - min) / range) * 80 + 15));
              const isUp = i === 0 || val >= history[i - 1];
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-8 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                    ${val.toFixed(2)}
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${isUp ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-rose-500 shadow-lg shadow-rose-500/30'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4">
            <span>RSI: 64.2 (Neutral-Bullish)</span>
            <span>MACD: Bullish Crossover</span>
            <span>Bollinger Bands: Normal</span>
          </div>
        </div>

        {/* Trade Execution & Risk Management Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Order & Risk Parameters</h3>
          </div>

          <div className="space-y-4 flex-1">
            {/* Stake */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Stake Amount (USD)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex space-x-1">
                  {[10, 25, 50].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStake(amt)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold transition ${stake === amt ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration (Seconds)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 Ticks / Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>1 Minute</option>
                <option value={300}>5 Minutes</option>
              </select>
            </div>
          </div>

          {/* Buy Call / Put Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleBuy('CALL')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex flex-col items-center justify-center space-y-1"
            >
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>BUY CALL</span>
              </div>
              <span className="text-[10px] font-normal text-emerald-200">Higher (Payout ~1.95x)</span>
            </button>

            <button
              onClick={() => handleBuy('PUT')}
              className="bg-rose-600 hover:bg-rose-500 text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-rose-600/25 transition flex flex-col items-center justify-center space-y-1"
            >
              <div className="flex items-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>BUY PUT</span>
              </div>
              <span className="text-[10px] font-normal text-rose-200">Lower (Payout ~1.95x)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
