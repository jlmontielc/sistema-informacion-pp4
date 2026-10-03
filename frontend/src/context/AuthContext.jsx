import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const tokenPayload = (() => {
      try { return JSON.parse(atob(token.split('.')[1])); }
      catch { return {}; }
    })();

    api.get('/auth/me')
      .then((res) => {
        setUser({ ...tokenPayload, ...res.data });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const cargarPerfilCompleto = useCallback(async (usuarioBase) => {
    setUser(usuarioBase);
    try {
      const res = await api.get('/auth/me');
      const perfilCompleto = { ...usuarioBase, ...res.data };
      setUser(perfilCompleto);
      return perfilCompleto;
    } catch {
      return usuarioBase;
    }
  }, []);

  const login = useCallback(async (email, contrasena) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, contrasena });
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return await cargarPerfilCompleto(userData);
    } finally {
      setLoading(false);
    }
  }, [cargarPerfilCompleto]);

  const register = useCallback(async (datos) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/instruido', datos);
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return await cargarPerfilCompleto(userData);
    } finally {
      setLoading(false);
    }
  }, [cargarPerfilCompleto]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silenciar errores - el logout funciona aunque el backend falle
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      // Las respuestas cacheadas por el service worker sobreviven al cierre de
      // sesion: se purgan para que el siguiente usuario del dispositivo no las herede.
      if ('caches' in window) {
        caches.delete('api-responses');
      }
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, isAuthenticated: !!user }),
    [user, setUser, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
