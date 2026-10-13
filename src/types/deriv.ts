export interface DerivAccount {
  email: string;
  loginid: string;
  fullname: string;
  currency: string;
  balance: number;
  isVirtual: boolean;
  token: string;
}

export interface MarketSymbol {
  symbol: string;
  name: string;
  market: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  bid?: number;
  ask?: number;
  history: number[];
}

export interface TickData {
  symbol: string;
  quote: number;
  epoch: number;
}

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  epoch: number;
  timeStr: string;
}

export type ContractCategory = 'CALL' | 'PUT' | 'MATCHES' | 'OVER' | 'UNDER' | 'EVEN' | 'ODD';

export interface TradeOrder {
  id: string;
  symbol: string;
  symbolName: string;
  contractType: ContractCategory;
  barrier?: string | number; // e.g. digit prediction for Matches / Over / Under
  stake: number;
  payout: number;
  profit?: number;
  status: 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
  buyPrice: number;
  spotPrice: number;
  exitPrice?: number;
  startTime: number;
  duration: number; // in seconds or ticks
  stopLoss: number; // in currency or %
  takeProfit: number;
  isAiGenerated?: boolean;
}

export interface AISignal {
  symbol: string;
  name: string;
  action: ContractCategory;
  barrier?: string | number;
  confidence: number;
  probabilityScore: number;
  reasoning: string;
  suggestedStake: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  contractType: ContractCategory;
  timeframe: string;
}

export interface RiskSettings {
  defaultStake: number;
  stopLossAmount: number;
  takeProfitAmount: number;
  maxDailyLoss: number;
  autoStopOnLoss: boolean;
  martingaleMultiplier: number;
  useMartingale: boolean;
  minConfidence: number;
  autoExecuteAiSignals: boolean;
}
