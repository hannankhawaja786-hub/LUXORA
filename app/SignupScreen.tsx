import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const BG       = '#0A0A0F';
const GOLD     = '#C9A84C';
const GOLD_LT  = '#F0C040';
const CARD_BG  = '#0E0E15';
const WHITE    = '#FFFFFF';
const GREY     = '#55556A';
const GOLD_DIM = '#C9A84C14';
const ERROR    = '#CC4444';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboard?: any;
  error?: string;
  delay?: number;
  hint?: string;
}

const LuxoraInput: React.FC<InputProps> = ({
  label, value, onChangeText, secure = false,
  keyboard = 'default', error, delay = 0, hint,
}) => {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const borderAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? ERROR : '#C9A84C22', error ? ERROR : GOLD],
  });

  return (
    <Animated.View style={[
      styles.inputWrap,
      { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      <Text style={[styles.inputLabel, error ? { color: ERROR } : {}]}>{label}</Text>
      <Animated.View style={[styles.inputBox, { borderColor }]}>
        {focused && <View style={styles.inputTopBar} />}
        <TextInput
          style={styles.inputText}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secure && !showPass}
          keyboardType={keyboard}
          keyboardAppearance="dark"
          placeholderTextColor={GREY}
          placeholder={hint}
          autoCapitalize="none"
          selectionColor={GOLD}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPass ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={styles.errorText}>◆ {error}</Text> : null}
    </Animated.View>
  );
};

export default function SignupScreen({ onDone, onLogin }: {
  onDone: (user: { fullName: string; email: string; phone: string; password: string }) => void;
  onLogin: () => void;
}) {
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [agreed,          setAgreed]          = useState(false);
  const [submitted,       setSubmitted]       = useState(false);

  const logoAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const checkAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim,    { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 0, duration: 900, delay: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim,    { toValue: 1, duration: 900, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim())                             e.fullName = 'Full name is required';
    if (!email.includes('@') || !email.includes('.')) e.email    = 'Enter a valid email address';
    if (phone.length < 7)                             e.phone    = 'Enter a valid phone number';
    if (password.length < 6)                          e.password = 'Min 6 characters required';
    if (password !== confirmPassword)                 e.confirm  = 'Passwords do not match';
    if (!agreed)                                      e.agreed   = 'You must agree to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) return;
    setSubmitted(true);
    // ✅ FIX: delay hataya — seedha call karo
    onDone({ fullName, email, phone, password });
  };

  const pulseCheck = () => {
    Animated.sequence([
      Animated.timing(checkAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.timing(checkAnim, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    setAgreed(p => !p);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
      <View style={styles.vertLineLeft} />
      <View style={styles.vertLineRight} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.logoBlock, { opacity: logoAnim }]}>
            <View style={styles.logoTop}>
              <View style={styles.logoLine} />
              <Text style={styles.logoMark}>HK</Text>
              <View style={styles.logoLine} />
            </View>
            <Text style={styles.brandName}>L U X O R A</Text>
            <Text style={styles.brandSub}>EXCLUSIVE TRAVEL · SAUDI ARABIA</Text>
            <View style={styles.goldHRule} />
          </Animated.View>

          <Animated.View style={[
            styles.headBlock,
            { opacity: fadeAnim, transform: [{ translateY: contentAnim }] },
          ]}>
            <Text style={styles.headTag}>— CREATE YOUR ACCOUNT</Text>
            <Text style={styles.headTitle}>
              Join The{'\n'}
              <Text style={styles.headGold}>Elite Circle.</Text>
            </Text>
            <Text style={styles.headSub}>
              Premium membership · Exclusive perks · Global access
            </Text>
          </Animated.View>

          <View style={styles.form}>
            <LuxoraInput label="FULL NAME"        value={fullName}        onChangeText={setFullName}        error={errors.fullName} hint="e.g. Hannan Khawaja"  delay={100} />
            <LuxoraInput label="EMAIL ADDRESS"    value={email}           onChangeText={setEmail}           error={errors.email}    hint="your@email.com"       delay={200} keyboard="email-address" />
            <LuxoraInput label="PHONE NUMBER"     value={phone}           onChangeText={setPhone}           error={errors.phone}    hint="+92 3xx xxxxxxx"      delay={300} keyboard="phone-pad" />
            <LuxoraInput label="PASSWORD"         value={password}        onChangeText={setPassword}        error={errors.password} hint="Min 6 characters"     delay={400} secure />
            <LuxoraInput label="CONFIRM PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirm}  hint="Re-enter password"    delay={500} secure />

            <Animated.View style={[
              styles.agreeRow,
              { opacity: fadeAnim },
              errors.agreed ? { borderColor: ERROR } : {},
            ]}>
              <TouchableOpacity onPress={pulseCheck}>
                <Animated.View style={[
                  styles.checkbox,
                  agreed ? styles.checkboxActive : {},
                  { transform: [{ scale: checkAnim }] },
                ]}>
                  {agreed && <Text style={styles.checkMark}>✦</Text>}
                </Animated.View>
              </TouchableOpacity>
              <Text style={styles.agreeText}>
                I agree to LUXORA's{' '}
                <Text style={styles.agreeLink}>Terms of Service</Text>
                {' & '}
                <Text style={styles.agreeLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
            {errors.agreed
              ? <Text style={[styles.errorText, { marginTop: -8, marginBottom: 12 }]}>◆ {errors.agreed}</Text>
              : null}

            <TouchableOpacity
              style={[styles.submitBtn, submitted ? styles.submitDone : {}]}
              onPress={handleSignup}
              activeOpacity={0.85}
            >
              <View style={styles.submitInner}>
                <Text style={styles.submitText}>
                  {submitted ? '✦  WELCOME TO LUXORA' : 'CREATE MY ACCOUNT  →'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divDiamond}>◆</Text>
              <View style={styles.divLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialText}>G  GOOGLE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialText}>in  LINKEDIN</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginLink} onPress={onLogin}>
              <Text style={styles.loginLinkText}>
                Already a member?{' '}
                <Text style={styles.loginLinkGold}>SIGN IN →</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.goldHRule} />
            <Text style={styles.footerBrand}>L · U · X · O · R · A</Text>
            <Text style={styles.footerSub}>© 2025 LUXORA · ALL RIGHTS RESERVED</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  corner:   { position: 'absolute', width: 18, height: 18, zIndex: 10 },
  cornerTL: { top: 16, left: 16,    borderTopWidth: 1,    borderLeftWidth: 1,  borderColor: GOLD },
  cornerTR: { top: 16, right: 16,   borderTopWidth: 1,    borderRightWidth: 1, borderColor: GOLD },
  cornerBL: { bottom: 16, left: 16,  borderBottomWidth: 1, borderLeftWidth: 1,  borderColor: GOLD },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 1, borderRightWidth: 1, borderColor: GOLD },
  vertLineLeft:  { position: 'absolute', left: 36,  top: 0, bottom: 0, width: 1, backgroundColor: GOLD, opacity: 0.04 },
  vertLineRight: { position: 'absolute', right: 36, top: 0, bottom: 0, width: 1, backgroundColor: GOLD, opacity: 0.04 },
  scroll: { paddingHorizontal: 28, paddingBottom: 60 },
  logoBlock: { alignItems: 'center', paddingTop: 64, paddingBottom: 24 },
  logoTop:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoLine:  { width: 28, height: 1, backgroundColor: GOLD, opacity: 0.6 },
  logoMark:  { fontSize: 11, letterSpacing: 4, color: GOLD, fontWeight: '700' },
  brandName: { fontSize: 22, letterSpacing: 10, color: WHITE, fontWeight: '200', marginBottom: 5 },
  brandSub:  { fontSize: 8, letterSpacing: 4, color: GREY, marginBottom: 16 },
  goldHRule: { width: 60, height: 1, backgroundColor: GOLD, opacity: 0.35 },
  headBlock: { marginBottom: 28 },
  headTag:   { fontSize: 9, letterSpacing: 5, color: GOLD, marginBottom: 10 },
  headTitle: { fontSize: 32, fontWeight: '200', color: WHITE, lineHeight: 40, marginBottom: 8 },
  headGold:  { color: GOLD },
  headSub:   { fontSize: 10, letterSpacing: 2, color: GREY, lineHeight: 18 },
  form: { gap: 14 },
  inputWrap:     { marginBottom: 4 },
  inputLabel:    { fontSize: 8, letterSpacing: 4, color: GOLD, marginBottom: 7 },
  inputBox:      { borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  inputTopBar:   { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: GOLD },
  inputText:     { flex: 1, color: WHITE, paddingHorizontal: 14, paddingVertical: 14, fontSize: 13, letterSpacing: 1, fontWeight: '300' },
  eyeBtn:        { paddingHorizontal: 12, paddingVertical: 14 },
  eyeText:       { fontSize: 8, letterSpacing: 2, color: GOLD, opacity: 0.8 },
  errorText:     { fontSize: 9, color: ERROR, letterSpacing: 2, marginTop: 5 },
  agreeRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#C9A84C18', backgroundColor: CARD_BG, padding: 14, marginTop: 4 },
  checkbox:       { width: 20, height: 20, borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: GOLD_DIM },
  checkMark:      { fontSize: 10, color: GOLD },
  agreeText:      { flex: 1, fontSize: 10, color: GREY, lineHeight: 18, letterSpacing: 1 },
  agreeLink:      { color: GOLD, textDecorationLine: 'underline' },
  submitBtn:   { borderWidth: 1, borderColor: GOLD, backgroundColor: GOLD_DIM, marginTop: 8 },
  submitDone:  { backgroundColor: '#C9A84C33', borderColor: GOLD_LT },
  submitInner: { paddingVertical: 16, alignItems: 'center' },
  submitText:  { fontSize: 10, letterSpacing: 4, color: GOLD, fontWeight: '600' },
  divRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  divLine:    { flex: 1, height: 1, backgroundColor: '#C9A84C18' },
  divDiamond: { fontSize: 8, color: GOLD, opacity: 0.5 },
  socialRow:  { flexDirection: 'row', gap: 10 },
  socialBtn:  { flex: 1, borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, paddingVertical: 13, alignItems: 'center' },
  socialText: { fontSize: 9, letterSpacing: 3, color: GREY },
  loginLink:     { alignItems: 'center', paddingVertical: 6 },
  loginLinkText: { fontSize: 10, color: GREY, letterSpacing: 1 },
  loginLinkGold: { color: GOLD, letterSpacing: 3 },
  footer:      { alignItems: 'center', gap: 10, paddingTop: 40 },
  footerBrand: { fontSize: 9, letterSpacing: 8, color: GOLD, fontWeight: '200', opacity: 0.6 },
  footerSub:   { fontSize: 7, letterSpacing: 2, color: GREY, opacity: 0.5 },
});