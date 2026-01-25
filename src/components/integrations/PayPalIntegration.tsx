import { useState } from 'react';
import Modal from '../Modal';

interface PayPalIntegrationProps {
  accountId: string;
  integrationId?: string;
  onSave: (apiKey: string) => void;
  onTest: () => void;
}

export default function PayPalIntegration({ accountId, integrationId, onSave, onTest }: PayPalIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(integrationId || '');

  const handleSave = () => {
    onSave(apiKey);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
      >
        {integrationId ? 'Update' : 'Connect'} PayPal
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="PayPal Integration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">PayPal API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your PayPal API key"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
            <p className="text-xs text-white/50 mt-1">
              Get your API key from PayPal Developer Dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onTest}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
