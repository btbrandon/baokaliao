'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { StoreContext, stores } from '@/stores';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={stores}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StoreContext.Provider>
  );
}
