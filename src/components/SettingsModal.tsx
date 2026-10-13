import React, { useState } from 'react';
import { Key, Mail, CheckCircle, Shield, X } from 'lucide-react';
import { DerivAccount } from '../types/deriv';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: DerivAccount;
  onSaveAccount: (acc: DerivAccount) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  account,
  onSaveAccount
}) => {
  const [email, setEmail] = useState(account.email);
  const [token, setToken] = useState(account.token);
  const [isVirtual, setIsVirtual] = useState(account.isVirtual);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAccount({
      ...account,
      email: email || 'hopehab.site@gmail.com',
      token: token || 'demo_token_12345',
      isVirtual,
      loginid: isVirtual ? 'VRTC9823412' : 'CR8849201',
      balance: isVirtual ? 10000.00 : 2450.50
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Deriv Account & API Connection</h2>
            <p className="text-xs text-slate-400">Connect securely via Deriv account email or API token</p>
          </div>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-semibold text-emerald-400">Connection Saved Successfully!</h3>
            <p className="text-xs text-slate-400">Deriv WebSocket authenticated securely.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deriv Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hopehab.site@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deriv API Token (Optional for Simulation)</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste Deriv API Token (Read/Trade)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Generate your API token from Deriv Account Settings &gt; API Token.</p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <span className="text-xs text-slate-300 font-medium">Use Virtual Demo Account ($10,000 USD)</span>
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
              >
                Save & Connect
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
