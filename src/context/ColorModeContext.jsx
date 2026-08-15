import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from '../theme';

const ColorModeContext = createContext({ mode: 'light', toggleMode: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('act-color-mode');
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('act-color-mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
