import { useState } from 'react';
import { useStore } from '../store/store';
import Modal from '../components/Modal';
import { exportToCSV } from '../utils/export';
import { generatePDFReport } from '../utils/pdfReport';

export default function Settings() {
  const { settings, updateSettings, exportData, importData, resetToSeed, addToast, users, activeUserId, updateUser } = useStore();
  const activeUser = users.find(u => u.id === activeUserId) || users[0];
  const store = useStore;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportDataText, setExportDataText] = useState('');
  const [importDataText, setImportDataText] = useState('');

  const handleExport = () => {
    const data = exportData();
    setExportDataText(data);
    setIsExportModalOpen(true);
    addToast('Data exported to JSON', 'success');
  };

  const handleImport = () => {
    try {
      importData(importDataText);
      addToast('Data imported successfully!', 'success');
      setIsImportModalOpen(false);
      setImportDataText('');
    } catch (error) {
      addToast('Failed to import data. Please check the format.', 'error');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to seed data? This cannot be undone.')) {
      resetToSeed();
      addToast('Data reset to seed data.', 'info');
    }
  };

  const handleExportCSV = () => {
    const state = store.getState();
    exportToCSV({
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      subscriptions: state.subscriptions,
      goals: state.goals,
      debts: state.debts
    });
  };

  const handleExportPDF = () => {
    const state = store.getState();
    generatePDFReport({
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      subscriptions: state.subscriptions,
      goals: state.goals,
      debts: state.debts
    });
  };

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <h1 className="text-2xl font-semibold text-white/90 mb-6">Settings</h1>

      {/* Preferences */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <h2 className="text-sm font-medium text-white/90">Preferences</h2>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Your Name</label>
          <input
            type="text"
            value={activeUser.name}
            onChange={(e) => updateUser(activeUserId, { name: e.target.value })}
            placeholder="e.g., Brian Lewis"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
          <p className="text-xs text-white/40 mt-1">Updating your profile name ({activeUserId})</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/90">Guided Mode</p>
            <p className="text-xs text-white/60">Get step-by-step guidance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.guidedMode}
              onChange={(e) => updateSettings({ guidedMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/90">Beginner Mode</p>
            <p className="text-xs text-white/60">Simplified interface</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.beginnerMode}
              onChange={(e) => updateSettings({ beginnerMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as any })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Pay Schedule</label>
          <input
            type="text"
            value={settings.paySchedule || ''}
            onChange={(e) => updateSettings({ paySchedule: e.target.value })}
            placeholder="e.g., Bi-weekly, Monthly"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Payoff Strategy</label>
          <select
            value={settings.payoffStrategy}
            onChange={(e) => updateSettings({ payoffStrategy: e.target.value as any })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="snowball">Snowball (Smallest balance first)</option>
            <option value="avalanche">Avalanche (Highest interest first)</option>
          </select>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-white/90">Data Management</h2>

        <button
          onClick={handleExport}
          className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <iconify-icon icon="solar:download-linear" width="20"></iconify-icon>
          Export Data (JSON)
        </button>

        <button
          onClick={handleExportCSV}
          className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <iconify-icon icon="solar:file-text-linear" width="20"></iconify-icon>
          Export CSV
        </button>

        <button
          onClick={handleExportPDF}
          className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <iconify-icon icon="solar:file-linear" width="20"></iconify-icon>
          Generate PDF Report
        </button>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <iconify-icon icon="solar:upload-linear" width="20"></iconify-icon>
          Import Data
        </button>

        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <iconify-icon icon="solar:restart-linear" width="20"></iconify-icon>
          Reset to Seed Data
        </button>
      </div>

      {/* About */}
      <div className="glass-card rounded-2xl p-4">
        <h2 className="text-sm font-medium text-white/90 mb-2">About</h2>
        <p className="text-xs text-white/60 mb-1">Plana - Calm Finance</p>
        <p className="text-xs text-white/60">Version 1.0.0</p>
      </div>

      {/* Export Modal */}
      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Data">
        <div className="space-y-4">
          <textarea
            value={exportDataText}
            readOnly
            rows={10}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(exportDataText);
              addToast('Copied to clipboard!', 'success');
            }}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Data">
        <div className="space-y-4">
          <textarea
            value={importDataText}
            onChange={(e) => setImportDataText(e.target.value)}
            placeholder="Paste exported data here..."
            rows={10}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
            >
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
