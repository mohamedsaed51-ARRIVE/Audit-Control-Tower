import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { users } from '../data/mockData';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUserId = sessionStorage.getItem('act-user-id');

    if (!storedUserId) {
      return null;
    }

    return users.find((u) => u.id === storedUserId) || null;
  });

  const login = useCallback(async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 650));

    const normalizedEmail = email.trim().toLowerCase();

    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.password === password &&
        u.status === 'active'
    );

    if (!foundUser) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    sessionStorage.setItem('act-authed', '1');
    sessionStorage.setItem('act-user-id', foundUser.id);

    setUser(foundUser);

    return {
      success: true,
      user: foundUser,
    };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('act-authed');
    sessionStorage.removeItem('act-user-id');

    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}