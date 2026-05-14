import { supabase } from '@/lib/supabase';
import type { AuthState, AuthUser, SignInPayload, SignUpPayload } from '@/lib/types/auth.types';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
 
interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<{ error: string | null }>;
  signIn: (payload: SignInPayload) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearError: () => void;
}
 
const sessionToUser = (session: Session | null): AuthUser | null => {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at,
  };
};
 
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,
 
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: sessionToUser(session), isInitialized: true });
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ session: newSession, user: sessionToUser(newSession), isInitialized: true });
      });
    } catch (error) {
      set({ isInitialized: true, error: 'Failed to initialize auth' });
    }
  },
 
  signUp: async ({ email, password, full_name }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });
      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }
      set({ isLoading: false, session: data.session, user: sessionToUser(data.session) });
      return { error: null };
    } catch (err) {
      const message = 'Signup failed. Please try again.';
      set({ isLoading: false, error: message });
      return { error: message };
    }
  },
 
  signIn: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ isLoading: false, error: error.message });
        return { error: error.message };
      }
      set({ isLoading: false, session: data.session, user: sessionToUser(data.session) });
      return { error: null };
    } catch (err) {
      const message = 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      return { error: message };
    }
  },
 
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false, isInitialized: true });
  },
 
  setSession: (session) => {
    set({ session, user: sessionToUser(session) });
  },
 
  clearError: () => set({ error: null }),
}));
 