import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
 
const SUPABASE_URL = 'https://mvpwpvarygaqtkvlgrqm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cHdwdmFyeWdhcXRrdmxncnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NzgxMTksImV4cCI6MjA5NDA1NDExOX0.q_LDlcWO2IGHbtc5JjFcsqhUT4XUOkU6_dBE_0qiPwU';
 
const webStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? (webStorage as any) : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
 