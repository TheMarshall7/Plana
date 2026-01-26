import { useStore } from '../store/store';
import Toast from './Toast';

export default function ToastContainer() {
    const { toasts, removeToast } = useStore();

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
}
