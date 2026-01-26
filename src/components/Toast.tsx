import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-500/20 border-red-500/50 text-red-200',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  };

  return (
    <div
      className={`glass-card rounded-xl px-4 py-3 border ${typeStyles[type]} animate-fade-in shadow-lg min-w-[200px] pointer-events-auto`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center"
        >
          <iconify-icon icon="solar:close-linear" width="14"></iconify-icon>
        </button>
      </div>
    </div>
  );
}
