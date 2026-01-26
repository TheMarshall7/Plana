import { useStore } from '../store/store';

export default function CloudSyncIndicator() {
    const { settings } = useStore();
    const isEnabled = !!(settings.supabaseUrl && settings.supabaseKey);

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`}></div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 leading-none">
                    Cloud Sync
                </span>
                <span className={`text-[11px] font-medium leading-tight ${isEnabled ? 'text-white/90' : 'text-white/40'}`}>
                    {isEnabled ? 'Connected' : 'Local Only'}
                </span>
            </div>
            {isEnabled && (
                <iconify-icon icon="solar:check-circle-bold" className="text-emerald-500 ml-auto" width="14"></iconify-icon>
            )}
        </div>
    );
}
