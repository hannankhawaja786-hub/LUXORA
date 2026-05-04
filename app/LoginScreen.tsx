import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const ERROR = '#CC4444';

export default function LoginScreen({
  onLogin,
  onSignup,
  onSuccess,
}: {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(crownAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setEmailError('');
    setPassError('');
    setAuthError('');

    let valid = true;
    if (!email.trim()) { setEmailError('Email is required'); valid = false; }
    else if (!email.includes('@') || !email.includes('.')) { setEmailError('Enter a valid email'); valid = false; }
    if (!password.trim()) { setPassError('Password is required'); valid = false; }

    if (!valid) { shakeError(); return; }

    setLoading(true);
    // ✅ FIX: password.trim() — yahi original bug tha
    const success = await onLogin(email.trim(), password.trim());
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      setAuthError('Invalid email or password. Please try again.');
      shakeError();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />
      <View style={styles.bgLineTop} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.topSection, { opacity: crownAnim }]}>
          <Text style={styles.crown}>♛</Text>
          <Text style={styles.brand}>LUXORA</Text>
          <View style={styles.brandDivider}>
            <View style={styles.divLine} />
            <Text style={styles.divDot}>✦</Text>
            <View style={styles.divLine} />
          </View>
          <Text style={styles.brandSub}>EXCLUSIVE TRAVEL · SAUDI ARABIA</Text>
        </Animated.View>

        <Animated.View style={[
          styles.formSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }
        ]}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>Sign in to your luxury account</Text>

          {authError ? (
            <View style={styles.authErrorBox}>
              <Text style={styles.authErrorText}>◆  {authError}</Text>
            </View>
          ) : null}

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'email' && styles.inputFocused,
              emailError ? styles.inputError : {},
            ]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#333"
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(''); setAuthError(''); }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? <Text style={styles.fieldError}>◆  {emailError}</Text> : null}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'password' && styles.inputFocused,
              passError ? styles.inputError : {},
            ]}>
              <Text style={styles.inputIcon}>◈</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#333"
                value={password}
                onChangeText={(t) => { setPassword(t); setPassError(''); setAuthError(''); }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                secureTextEntry
              />
            </View>
            {passError ? <Text style={styles.fieldError}>◆  {passError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginText}>
              {loading ? 'VERIFYING...' : 'ENTER LUXORA'}
            </Text>
            {!loading && <Text style={styles.loginArrow}>→</Text>}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Text style={styles.googleText}>G</Text>
            <Text style={styles.googleLabel}>CONTINUE WITH GOOGLE</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to LUXORA? </Text>
            <TouchableOpacity onPress={onSignup}>
              <Text style={styles.signupLink}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Text style={styles.bottomBrand}>L · U · X · O · R · A</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scrollContent: { alignItems: 'center', paddingBottom: 60 },
  bgCircleLarge: { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, borderWidth: 1, borderColor: 'rgba(201,168,76,0.04)', top: -width * 0.5, right: -width * 0.3 },
  bgCircleSmall: { position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, borderWidth: 1, borderColor: 'rgba(201,168,76,0.03)', bottom: height * 0.1, left: -width * 0.2 },
  bgLineTop: { position: 'absolute', top: height * 0.28, left: 0, right: 0, height: 1, backgroundColor: 'rgba(201,168,76,0.06)' },
  topSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  crown: { fontSize: 36, color: '#C9A84C', marginBottom: 8, textShadowColor: 'rgba(201,168,76,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  brand: { fontSize: 30, color: '#C9A84C', fontWeight: '200', letterSpacing: 16, marginBottom: 10 },
  brandDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  divLine: { width: 30, height: 1, backgroundColor: 'rgba(201,168,76,0.4)' },
  divDot: { color: '#C9A84C', fontSize: 8, marginHorizontal: 8 },
  brandSub: { fontSize: 9, color: '#444', letterSpacing: 4 },
  formSection: { width: width, paddingHorizontal: 28 },
  welcomeText: { fontSize: 26, color: '#FFFFFF', fontWeight: '200', letterSpacing: 1, marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: '#444', letterSpacing: 1, marginBottom: 20 },
  authErrorBox: { borderWidth: 1, borderColor: ERROR + '44', backgroundColor: ERROR + '0F', padding: 12, marginBottom: 16 },
  authErrorText: { color: ERROR, fontSize: 10, letterSpacing: 2, lineHeight: 16 },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, color: '#C9A84C', letterSpacing: 4, marginBottom: 8, opacity: 0.8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E1E1E', backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 16, paddingVertical: 14 },
  inputFocused: { borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.03)' },
  inputError: { borderColor: ERROR },
  inputIcon: { color: '#C9A84C', fontSize: 14, marginRight: 12, opacity: 0.7 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14, letterSpacing: 1 },
  fieldError: { color: ERROR, fontSize: 9, letterSpacing: 2, marginTop: 5 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 4 },
  forgotText: { color: '#444', fontSize: 10, letterSpacing: 3 },
  loginBtn: { borderWidth: 1, borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 18, marginBottom: 20 },
  loginText: { color: '#C9A84C', fontSize: 13, fontWeight: '700', letterSpacing: 5 },
  loginArrow: { color: '#C9A84C', fontSize: 18 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: '#1A1A1A' },
  orText: { color: '#333', fontSize: 11, letterSpacing: 3, marginHorizontal: 16 },
  googleBtn: { borderWidth: 1, borderColor: '#1E1E1E', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginBottom: 24, gap: 12 },
  googleText: { color: '#C9A84C', fontSize: 16, fontWeight: '700' },
  googleLabel: { color: '#444', fontSize: 11, letterSpacing: 3 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { color: '#333', fontSize: 12, letterSpacing: 1 },
  signupLink: { color: '#C9A84C', fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  bottomBrand: { position: 'absolute', bottom: 16, alignSelf: 'center', color: '#1A1A1A', fontSize: 11, letterSpacing: 6 },
});