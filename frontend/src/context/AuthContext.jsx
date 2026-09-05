import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const stored = localStorage.getItem('ufac_user');
  return stored ? JSON.parse(stored) : null;
};

/** Dedupe concurrent /me calls (React Strict Mode runs effects twice in dev). */
let sessionValidationPromise = null;

const validateSession = () => {
  if (!sessionValidationPromise) {
    sessionValidationPromise = authApi.me().finally(() => {
      sessionValidationPromise = null;
    });
  }
  return sessionValidationPromise;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() => {
    const token = localStorage.getItem('ufac_token');
    const storedUser = localStorage.getItem('ufac_user');
    return Boolean(token && !storedUser);
  });

  const clearSession = useCallback(() => {
    localStorage.removeItem('ufac_token');
    localStorage.removeItem('ufac_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('ufac_token');
    if (!token) {
      setInitializing(false);
      return undefined;
    }

    let active = true;

    validateSession()
      .then(({ data }) => {
        if (!active) return;
        const userData = data.data;
        localStorage.setItem('ufac_user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
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

  const signup = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { name, email, password, role } = payload;
      await authApi.register({ name, email, password, role });
      return login({ email, password });
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, initializing, login, signup, logout, isAuthenticated: !!user }),
    [user, loading, initializing, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
