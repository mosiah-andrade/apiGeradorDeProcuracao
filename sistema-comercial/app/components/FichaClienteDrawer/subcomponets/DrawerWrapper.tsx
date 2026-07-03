import { ReactNode } from 'react';

export function DrawerWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in">
      {children}
    </div>
  );
}