import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import type { Account } from '../store/types';

export default function Onboarding() {
  const navigate = useNavigate();
  const { addAccount, updateSettings } = useStore();
  const [step, setStep] = useState(1);
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  const handleComplete = () => {
    if (accountName && accountBalance) {
      addAccount({
        name: accountName,
        type: 'checking',
        balance: parseFloat(accountBalance) || 0,
        color: '#10b981',
        archived: false,
      });
    }
    updateSettings({ onboardingCompleted: true });
    navigate('/');
  };

  const handleSkip = () => {
    updateSettings({ onboardingCompleted: true });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md w-full space-y-6">
        {step === 1 && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <iconify-icon icon="solar:wallet-money-linear" className="text-emerald-400" width="48"></iconify-icon>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white/90 mb-2">Welcome to Plana</h1>
              <p className="text-white/60">
                Let's get you started with your financial journey. This will only take a minute.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={handleSkip}
              className="w-full px-4 py-2 text-white/60 hover:text-white/80 transition-colors text-sm"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white/90 mb-2">Add Your First Account</h2>
              <p className="text-white/60 text-sm">
                Connect your checking account to get started tracking your finances.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., Chase Checking"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Starting Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
              >
                Complete Setup
              </button>
            </div>
            <button
              onClick={handleSkip}
              className="w-full px-4 py-2 text-white/60 hover:text-white/80 transition-colors text-sm"
            >
              Skip this step
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
