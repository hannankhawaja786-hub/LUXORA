import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const { error: err } = await signIn({ email: email.trim(), password });
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>LUXORA</Text>
          <Text style={styles.tagline}>LUXURY REDEFINED</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>WELCOME BACK</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#3A3A4A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#3A3A4A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.disabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#0A0A0F" size="small" />
              : <Text style={styles.primaryBtnText}>SIGN IN</Text>}
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.divLine} /><Text style={styles.divText}>OR</Text><View style={styles.divLine} />
          </View>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/signup')} disabled={isLoading}>
            <Text style={styles.secondaryBtnText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 38, fontWeight: '200', letterSpacing: 16, color: '#C9A84C', textAlign: 'center' },
  tagline: { fontSize: 10, letterSpacing: 6, color: '#5A5A6A', marginTop: 6 },
  card: { backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#1E1E2A', padding: 28 },
  title: { fontSize: 18, fontWeight: '300', letterSpacing: 6, color: '#F0C040', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 12, color: '#5A5A6A', letterSpacing: 2, textAlign: 'center', marginBottom: 28 },
  errorBox: { backgroundColor: 'rgba(220,38,38,0.1)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)', padding: 12, marginBottom: 20 },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: '#C9A84C', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#13131C', borderWidth: 1, borderColor: '#2A2A3A', paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 14, marginBottom: 16 },
  primaryBtn: { backgroundColor: '#C9A84C', paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  primaryBtnText: { color: '#0A0A0F', fontSize: 12, fontWeight: '700', letterSpacing: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: '#1E1E2A' },
  divText: { color: '#3A3A4A', fontSize: 11, letterSpacing: 3, paddingHorizontal: 12 },
  secondaryBtn: { borderWidth: 1, borderColor: '#C9A84C', paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText: { color: '#C9A84C', fontSize: 12, fontWeight: '500', letterSpacing: 4 },
});
