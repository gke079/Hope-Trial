import { AISignal, MarketSymbol } from '../types/deriv';

export async function fetchAiSignalScan(markets: MarketSymbol[], contractType: string = 'RISE_FALL'): Promise<AISignal[]> {
  try {
    const res = await fetch('/api/ai-signal-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markets, contractType })
    });
    const data = await res.json();
    if (data.success && data.analysis) {
      return data.analysis;
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch AI signal scan:', err);
    return [];
  }
}

export async function askAiTradeAdvisor(question: string, accountState: any): Promise<string> {
  try {
    const res = await fetch('/api/ai-trade-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, accountState })
    });
    const data = await res.json();
    if (data.success) {
      return data.answer;
    }
    return 'Unable to reach AI mentor at the moment.';
  } catch (err) {
    console.error('Failed to ask AI advisor:', err);
    return 'Error communicating with AI trade advisor.';
  }
}
