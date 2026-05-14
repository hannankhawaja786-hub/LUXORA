import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | undefined;
  full_name: string | undefined;
  avatar_url: string | undefined;
  created_at: string | undefined;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}