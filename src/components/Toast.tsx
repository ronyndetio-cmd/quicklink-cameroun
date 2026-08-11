import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  detail?: string;
}

interface ToastValue {
  success: (message: string, detail?: string) => void;
  error: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
  warning: (message: string, detail?: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-forest-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-brand-500" />,
  warning: <AlertTriangle size={18} className="text-gold-500" />,
};

const BORDERS: Record<ToastKind, string> = {
  success: 'border-forest-200',
  error: 'border-red-200',
  info: 'border-brand-200',
  warning: 'border-gold-200',
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind) => (message: string, detail?: string) => {
      const id = nextId++;
      setItems((list) => {
        // Swallow back-to-back duplicates (e.g. React StrictMode's double effect invoke in dev).
        if (list.some((t) => t.kind === kind && t.message === message && t.detail === detail)) return list;
        return [...list, { id, kind, message, detail }];
      });
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo<ToastValue>(
    () => ({
      success: push('success'),
      error: push('error'),
      info: push('info'),
      warning: push('warning'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:top-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`a-rise pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border bg-white dark:bg-surface
              px-3.5 py-3 shadow-lift ${BORDERS[t.kind]}`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug text-ink-900">{t.message}</p>
              {t.detail && <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{t.detail}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-full p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
