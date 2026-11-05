import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, token } from '../lib/api';
import { Spinner } from '../components/Bits';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token.get()) { setReady(true); return; }
    api.me().then(setUser).catch(() => token.clear()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('tp:logout', onLogout);
    return () => window.removeEventListener('tp:logout', onLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    token.set(res.access_token);
    setUser({ name: res.name, email: res.email });
  }, []);
  const logout = useCallback(() => { token.clear(); setUser(null); }, []);

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
  return children;
}
