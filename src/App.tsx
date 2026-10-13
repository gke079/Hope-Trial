import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarketScanner } from './components/MarketScanner';
import { LiveChart } from './components/LiveChart';
import { AutoTradingBot } from './components/AutoTradingBot';
import { PortfolioPositions } from './components/PortfolioPositions';
import { TradeHistory } from './components/TradeHistory';
import { SettingsModal } from './components/SettingsModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { DerivAccount, MarketSymbol, RiskSettings, TradeOrder } from './types/deriv';
import { derivManager } from './services/derivWs';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [account, setAccount] = useState<DerivAccount>({
    email: 'hopehab.site@gmail.com',
    loginid: 'VRTC9823412',
    fullname: 'Hope Hab Trader',
    currency: 'USD',
    balance: 10000.00,
    isVirtual: true,
    token: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<{ status: string; mode: string }>({
    status: 'connected',
    mode: 'simulation'
  });

  const [markets, setMarkets] = useState<MarketSymbol[]>(derivManager.getSymbols());
  const [positions, setPositions] = useState<TradeOrder[]>([
    {
      id: 'ORD-549210',
      symbol: 'R_75',
      symbolName: 'Volatility 75 Index',
      contractType: 'CALL',
      stake: 20,
      payout: 39.00,
      status: 'OPEN',
      buyPrice: 12450.20,
      spotPrice: 12450.20,
      startTime: Date.now() - 30000,
      duration: 60,
      stopLoss: 10,
      takeProfit: 25,
      isAiGenerated: true
    }
  ]);

  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    defaultStake: 10,
    stopLossAmount: 20,
    takeProfitAmount: 45,
    maxDailyLoss: 150,
    autoStopOnLoss: true,
    martingaleMultiplier: 2.0,
    useMartingale: true,
    minConfidence: 80,
    autoExecuteAiSignals: false
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState<boolean>(false);

  useEffect(() => {
    derivManager.connect(account.token).then(() => {
      setMarkets(derivManager.getSymbols());
    });

    derivManager.on('connection', (status: any) => {
      setConnectionStatus(status);
    });

    derivManager.on('ticks_update', (updatedMarkets: MarketSymbol[]) => {
      setMarkets([...updatedMarkets]);
    });
  }, []);

  const handleExecuteTrade = (order: Partial<TradeOrder>) => {
    derivManager.buyContract(order).then((executedOrder) => {
      setPositions(prev => [executedOrder, ...prev]);
      setAccount(prev => ({
        ...prev,
        balance: prev.balance - executedOrder.stake
      }));
    });
  };

  const handleClosePosition = (id: string, profit: number) => {
    setPositions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: profit >= 0 ? 'WON' : 'LOST', profit };
      }
      return p;
    }));

    setAccount(prev => ({
      ...prev,
      balance: prev.balance + (positions.find(p => p.id === id)?.stake || 10) + profit
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Navbar
        account={account}
        connectionStatus={connectionStatus}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activePositionsCount={positions.filter(p => p.status === 'OPEN').length}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'scanner' && (
            <MarketScanner
              markets={markets}
              riskSettings={riskSettings}
              onExecuteTrade={handleExecuteTrade}
              soundEnabled={soundEnabled}
              activePositions={positions}
              onClosePosition={handleClosePosition}
            />
          )}

          {activeTab === 'terminal' && (
            <LiveChart
              markets={markets}
              riskSettings={riskSettings}
              onExecuteTrade={handleExecuteTrade}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'autobot' && (
            <AutoTradingBot
              markets={markets}
              riskSettings={riskSettings}
              onExecuteTrade={handleExecuteTrade}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioPositions
              positions={positions}
              onClosePosition={handleClosePosition}
            />
          )}

          {activeTab === 'history' && (
            <TradeHistory
              positions={positions}
            />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        account={account}
        onSaveAccount={(acc) => setAccount(acc)}
      />

      <AIAdvisorModal
        isOpen={aiAdvisorOpen}
        onClose={() => setAiAdvisorOpen(false)}
        accountState={{ account, positions, riskSettings }}
      />
    </div>
  );
}
