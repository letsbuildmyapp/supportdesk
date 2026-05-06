import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

const Ctx = createContext<{ confirm: (opts: ConfirmOptions) => Promise<boolean> }>({
  confirm: async () => false,
});

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Pending | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setP({ ...opts, resolve }));
  }, []);

  const close = (v: boolean) => {
    if (p) p.resolve(v);
    setP(null);
  };

  return (
    <Ctx.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {p && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] grid place-items-center px-4 bg-black/40 backdrop-blur-[2px]"
            onClick={() => close(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') close(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-2xl bg-bg-panel border border-line shadow-panel overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog" aria-modal="true"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {p.destructive && (
                    <div className="h-10 w-10 rounded-xl bg-danger/10 grid place-items-center shrink-0">
                      <AlertTriangle size={18} className="text-danger" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight">{p.title}</h2>
                    {p.message && <div className="mt-2 text-sm text-fg-muted leading-relaxed">{p.message}</div>}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-line bg-bg-subtle/50">
                <button onClick={() => close(false)} className="btn-ghost">{p.cancelLabel ?? 'Cancel'}</button>
                <button
                  onClick={() => close(true)}
                  className={p.destructive ? 'btn-danger' : 'btn-primary'}
                  autoFocus
                >
                  {p.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx).confirm;
