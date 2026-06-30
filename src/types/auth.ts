export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  isTrial: boolean;
  trialExpiresAt: string | null;
}

export interface PublicUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  isActive: boolean;
  isTrial: boolean;
  trialExpiresAt: string | null;
  createdAt: string;
}

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';
export type AppPage = 'app' | 'admin';
