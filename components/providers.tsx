'use client';

import { StoreContext, stores } from '@/stores';
import { ThemeProvider } from '@/contexts/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={stores}>
      <ThemeProvider>{children}</ThemeProvider>
    </StoreContext.Provider>
  );
}
