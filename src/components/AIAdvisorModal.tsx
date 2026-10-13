import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User } from 'lucide-react';
import { askAiTradeAdvisor } from '../services/aiSignal';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountState: any;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  accountState
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your DerivEdge AI Trading Strategist. Ask me anything about volatility indices, risk management, martingale strategies, or market conditions.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    const answer = await askAiTradeAdvisor(userMsg, accountState);
    setMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center space-x-1.5">
                <span>Signal AI Trade Mentor</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h2>
              <p className="text-[10px] text-slate-400">Powered by Gemini AI Multi-Model Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Volatility 75 strategy, martingale limits..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-lg shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
