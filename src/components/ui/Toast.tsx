import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-900/90',
    borderColor: 'border-green-500',
    textColor: 'text-green-100',
    iconColor: 'text-green-400'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-900/90',
    borderColor: 'border-red-500',
    textColor: 'text-red-100',
    iconColor: 'text-red-400'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-900/90',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-100',
    iconColor: 'text-yellow-400'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-900/90',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-100',
    iconColor: 'text-blue-400'
  }
};

export function Toast({ toast, onRemove }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bgColor} ${config.borderColor} shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full fade-in duration-300`}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <span className={`text-sm font-medium ${config.textColor} flex-1`}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${config.textColor}`}
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
