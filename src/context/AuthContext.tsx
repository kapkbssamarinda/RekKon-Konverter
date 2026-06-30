import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthStatus, AppPage } from '../types/auth';

const TOKEN_KEY = 'rk_auth_token';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  page: AppPage;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setPage: (page: AppPage) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<AppPage>('app');

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(r => r.json())
      .then((body: { ok: boolean; data?: AuthUser }) => {
        if (body.ok && body.data) {
          setToken(stored);
          setUser(body.data);
          setStatus('authenticated');
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const body = (await res.json()) as { ok: boolean; data?: { token: string; user: AuthUser }; error?: string };
    if (!body.ok) throw new Error(body.error ?? 'Login gagal');
    localStorage.setItem(TOKEN_KEY, body.data!.token);
    setToken(body.data!.token);
    setUser(body.data!.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setPage('app');
  }, [token]);

  return (
    <AuthContext.Provider value={{ status, user, token, page, login, logout, setPage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
