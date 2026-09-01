import { ReactNode } from 'react';

export function DrawerWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex w-full max-w-full flex-col overflow-hidden bg-white shadow-2xl animate-slide-in sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[50vw] sm:max-w-[calc(100vw-1rem)] sm:min-w-[320px] sm:border-l sm:border-slate-200">
      {children}
    </div>
  );
}
