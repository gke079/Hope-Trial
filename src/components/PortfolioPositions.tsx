import React from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, XCircle, CheckCircle } from 'lucide-react';
import { TradeOrder } from '../types/deriv';

interface PortfolioPositionsProps {
  positions: TradeOrder[];
  onClosePosition: (id: string, profit: number) => void;
}

export const PortfolioPositions: React.FC<PortfolioPositionsProps> = ({
  positions,
  onClosePosition
}) => {
  const openPositions = positions.filter(p => p.status === 'OPEN');
  const closedPositions = positions.filter(p => p.status !== 'OPEN');

  return (
    <div className="flex-1 bg-slate-900/50 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Active Portfolio & Positions</h2>
          <p className="text-xs text-slate-400">Monitor and manage open derivative contracts in real time.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-2xl text-xs font-bold">
          {openPositions.length} Active Positions
        </div>
      </div>

      {/* Active Positions Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white mb-2">Open Contracts</h3>

        {openPositions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs italic">
            No open positions currently. Execute a trade from the Pro Terminal or Signal AI Scanner.
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
                  <th className="py-3 px-4">Entry / Spot</th>
                  <th className="py-3 px-4">Est. P&L</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {openPositions.map(pos => {
                  const isCall = pos.contractType === 'CALL';
                  const mockPnL = Number((pos.stake * (Math.random() > 0.4 ? 0.45 : -0.25)).toFixed(2));
                  const isProfit = mockPnL >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-4 font-mono text-slate-300">{pos.id}</td>
                      <td className="py-4 px-4 font-bold text-white">{pos.symbolName}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${isCall ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                          {pos.contractType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">${pos.stake.toFixed(2)}</td>
                      <td className="py-4 px-4 font-mono text-slate-400">${pos.buyPrice.toFixed(2)}</td>
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
