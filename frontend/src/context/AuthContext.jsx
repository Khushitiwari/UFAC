import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ufac_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('ufac_token');
    localStorage.removeItem('ufac_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('ufac_token');
    if (!token) {
      setInitializing(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => {
        const userData = data.data;
        localStorage.setItem('ufac_user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      const { token, user: userData } = data.data;
      localStorage.setItem('ufac_token', token);
      localStorage.setItem('ufac_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, initializing, login, logout, isAuthenticated: !!user }),
    [user, loading, initializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
