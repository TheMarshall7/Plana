import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import UserSelector from './UserSelector';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-5 lg:px-8 pt-8 pb-4 lg:pb-6 animate-fade-in">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
          <iconify-icon icon="solar:leaf-linear" className="text-emerald-400" width="18"></iconify-icon>
        </div>
        <span className="text-lg lg:text-xl font-medium tracking-tight text-white/90">Plana</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={() => useStore.getState().addToast('No new notifications', 'info')}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors relative"
        >
          <iconify-icon icon="solar:bell-linear" className="text-white/70" width="22"></iconify-icon>
          <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border border-[#0B1E18]"></div>
        </button>
        <div className="">
          <UserSelector />
        </div>
      </div>
    </header>
  );
}
