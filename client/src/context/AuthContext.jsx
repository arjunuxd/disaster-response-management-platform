import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'drmp_token';
const USER_KEY = 'drmp_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const saveSession = useCallback((tokenValue, userData) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: tokenValue } = res.data.data;
    saveSession(tokenValue, userData);
    return userData;
  }, [saveSession]);

  const register = useCallback(async ({ fullName, email, password }) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    const { user: userData, token: tokenValue } = res.data.data;
    saveSession(tokenValue, userData);
    return userData;
  }, [saveSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
      } catch {
        clearSession();
      }
    }
    setLoading(false);
  }, [clearSession]);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
      } catch {
        clearSession();
      }
    };

    verifyToken();
  }, [token, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
