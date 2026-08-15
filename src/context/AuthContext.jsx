import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { currentUser } from '../data/mockData';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    sessionStorage.getItem('act-authed') === '1' ? currentUser : null
  );

  const login = useCallback(async (_email, _password) => {
    // Phase 1 — UI only. Any credentials succeed; backend auth arrives in Phase 2.
    await new Promise((r) => setTimeout(r, 650));
    sessionStorage.setItem('act-authed', '1');
    setUser(currentUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('act-authed');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
