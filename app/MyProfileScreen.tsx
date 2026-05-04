import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const BG = '#0A0A0F';
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F0C040';
const CARD_BG = '#0E0E15';
const WHITE = '#FFFFFF';
const GREY = '#55556A';
const GREEN = '#2ECC71';
const RED = '#D93025';
const PLATINUM = '#E8E8F0';

const STATS = [
  { label: 'TRIPS', value: '23' },
  { label: 'COUNTRIES', value: '9' },
  { label: 'POINTS', value: '2,450' },
  { label: 'TIER', value: 'PLAT' },
];

const TRAVEL_DOC = [
  { label: 'PASSPORT NO.', val: 'AB1234567', verified: true },
  { label: 'NATIONALITY', val: 'Pakistani', verified: true },
  { label: 'EXPIRY DATE', val: '14 Mar 2030', verified: true },
  { label: 'IQAMA / VISA', val: 'Saudi Work Visa', verified: false },
];

const PAYMENT_METHODS = [
  { type: 'VISA', last4: '4821', expiry: '08/27', primary: true },
  { type: 'MSTR', last4: '3349', expiry: '12/26', primary: false },
];

const MEAL_PREF = ['Halal', 'No Pork', 'Vegetarian Option', 'No Seafood'];
const SEAT_PREF = ['Aisle', 'Window', 'Extra Legroom', 'Business Class'];

const PREFERENCES_TOGGLES = [
  { label: 'PUSH NOTIFICATIONS', key: 'push' },
  { label: 'PRICE DROP ALERTS', key: 'price' },
  { label: 'TRAVEL REMINDERS', key: 'travel' },
  { label: 'EXCLUSIVE OFFERS', key: 'offers' },
  { label: 'CONCIERGE UPDATES', key: 'concierge' },
];

export default function MyProfileScreen({
  onBack,
  onLogout,
  user,
}: {
  onBack: () => void;
  onLogout?: () => void;
  user?: { fullName: string; email: string; phone: string } | null;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.fullName ?? 'Hannan Khawaja');
  const [email, setEmail] = useState(user?.email ?? 'hannan@luxora.travel');
  const [phone, setPhone] = useState(user?.phone ?? '+92 300 1234567');
  const [city, setCity] = useState('Sargodha, Pakistan');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true, price: true, travel: true, offers: false, concierge: true,
  });
  const [selectedMeal, setSelectedMeal] = useState('Halal');
  const [selectedSeat, setSelectedSeat] = useState('Window');

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HK';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const avatarBorder = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [GOLD + '44', GOLD + 'CC'] });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerEye}>— ACCOUNT</Text>
          <Text style={s.headerTitle}>MY PROFILE</Text>
        </View>
        <TouchableOpacity
          style={[s.editBtn, editMode && s.editBtnActive]}
          onPress={() => setEditMode(!editMode)}
          activeOpacity={0.8}
        >
          <Text style={[s.editBtnText, editMode && { color: BG }]}>
            {editMode ? 'SAVE' : 'EDIT'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={s.goldLineHard} />

      {/* Profile Hero */}
      <Animated.View style={[s.heroSection, { opacity: fadeAnim }]}>
        <Animated.View style={[s.avatarRing, { borderColor: avatarBorder }]}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.avatarBadge}>
            <Text style={s.avatarBadgeText}>P</Text>
          </View>
        </Animated.View>
        <View style={s.heroInfo}>
          <Text style={s.heroName}>{user?.fullName ?? 'Hannan Khawaja'}</Text>
          <Text style={s.heroTier}>PLATINUM MEMBER</Text>
          <Text style={s.heroJoined}>Member since January 2025</Text>
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[s.statsRow, { opacity: fadeAnim }]}>
        {STATS.map((st, i) => (
          <View key={i} style={[s.statBox, i < STATS.length - 1 && s.statBoxBorder]}>
            <Text style={s.statVal}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Tab Nav */}
      <View style={s.tabRow}>
        {(['profile', 'preferences', 'security'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'profile' ? 'PROFILE' : t === 'preferences' ? 'SETTINGS' : 'SECURITY'}
            </Text>
            {activeTab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.tabBorder} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— PERSONAL INFO</Text>
            <View style={s.formCard}>
              {[
                { label: 'FULL NAME', val: name, setter: setName },
                { label: 'EMAIL ADDRESS', val: email, setter: setEmail },
                { label: 'PHONE NUMBER', val: phone, setter: setPhone },
                { label: 'HOME CITY', val: city, setter: setCity },
              ].map((f, i) => (
                <View key={i} style={s.formField}>
                  <Text style={s.formLabel}>{f.label}</Text>
                  {editMode ? (
                    <TextInput
                      style={s.formInput}
                      value={f.val}
                      onChangeText={f.setter}
                      placeholderTextColor={GREY}
                    />
                  ) : (
                    <Text style={s.formVal}>{f.val}</Text>
                  )}
                  {i < 3 && <View style={s.formDivider} />}
                </View>
              ))}
            </View>

            <Text style={s.sectionTag}>— TRAVEL DOCUMENTS</Text>
            <View style={s.docsCard}>
              {TRAVEL_DOC.map((d, i) => (
                <View key={i} style={s.docRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docLabel}>{d.label}</Text>
                    <Text style={s.docVal}>{d.val}</Text>
                  </View>
                  <View style={[s.docVerified, { borderColor: d.verified ? GREEN + '44' : GOLD + '44' }]}>
                    <Text style={[s.docVerifiedText, { color: d.verified ? GREEN : GOLD }]}>
                      {d.verified ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={s.sectionTag}>— PAYMENT METHODS</Text>
            {PAYMENT_METHODS.map((p, i) => (
              <View key={i} style={[s.payCard, p.primary && s.payCardPrimary]}>
                {p.primary && <View style={s.payPrimaryBar} />}
                <View style={s.payTypeBox}>
                  <Text style={s.payTypeText}>{p.type}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.payCardNum}>•••• •••• •••• {p.last4}</Text>
                  <Text style={s.payExpiry}>EXP {p.expiry}</Text>
                </View>
                {p.primary && (
                  <View style={s.primaryBadge}>
                    <Text style={s.primaryBadgeText}>PRIMARY</Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity style={s.addCardBtn} activeOpacity={0.8}>
              <Text style={s.addCardText}>+ ADD PAYMENT METHOD</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── PREFERENCES ── */}
        {activeTab === 'preferences' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— MEAL PREFERENCE</Text>
            <View style={s.prefChipsRow}>
              {MEAL_PREF.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.prefChip, selectedMeal === m && s.prefChipActive]}
                  onPress={() => setSelectedMeal(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.prefChipText, selectedMeal === m && s.prefChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionTag}>— SEAT PREFERENCE</Text>
            <View style={s.prefChipsRow}>
              {SEAT_PREF.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.prefChip, selectedSeat === p && s.prefChipActive]}
                  onPress={() => setSelectedSeat(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.prefChipText, selectedSeat === p && s.prefChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionTag}>— NOTIFICATIONS</Text>
            <View style={s.togglesCard}>
              {PREFERENCES_TOGGLES.map((t, i) => (
                <View key={i} style={s.toggleRow}>
                  <Text style={s.toggleLabel}>{t.label}</Text>
                  <Switch
                    value={toggles[t.key]}
                    onValueChange={v => setToggles(prev => ({ ...prev, [t.key]: v }))}
                    trackColor={{ false: GREY + '44', true: GOLD + '88' }}
                    thumbColor={toggles[t.key] ? GOLD : GREY}
                    ios_backgroundColor={GREY + '44'}
                  />
                </View>
              ))}
            </View>

            <Text style={s.sectionTag}>— CURRENCY & LANGUAGE</Text>
            <View style={s.currCard}>
              {[
                { label: 'CURRENCY', val: 'USD · US Dollar' },
                { label: 'LANGUAGE', val: 'English' },
                { label: 'TIME ZONE', val: 'PKT · UTC+5' },
              ].map((c, i) => (
                <TouchableOpacity key={i} style={s.currRow} activeOpacity={0.7}>
                  <Text style={s.currLabel}>{c.label}</Text>
                  <View style={s.currRight}>
                    <Text style={s.currVal}>{c.val}</Text>
                    <Text style={s.currArrow}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── SECURITY ── */}
        {activeTab === 'security' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— ACCOUNT SECURITY</Text>
            <View style={s.secCard}>
              {[
                { label: 'CHANGE PASSWORD', sub: 'Last changed 3 months ago', ok: true },
                { label: 'TWO-FACTOR AUTH', sub: 'SMS verification enabled', ok: true },
                { label: 'BIOMETRIC LOGIN', sub: 'Face ID · Fingerprint', ok: true },
                { label: 'LOGIN SESSIONS', sub: '2 active devices', ok: false },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={s.secRow} activeOpacity={0.7}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.secLabel}>{item.label}</Text>
                    <Text style={s.secSub}>{item.sub}</Text>
                  </View>
                  <View style={[s.secStatusDot, { backgroundColor: item.ok ? GREEN : GOLD }]} />
                  <Text style={s.secArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionTag}>— PRIVACY</Text>
            <View style={s.privCard}>
              {[
                { label: 'DATA & Privacy Policy', danger: false },
                { label: 'Download My Data', danger: false },
                { label: 'Delete Account', danger: true },
              ].map((p, i) => (
                <TouchableOpacity key={i} style={s.privRow} activeOpacity={0.7}>
                  <Text style={[s.privLabel, p.danger && { color: RED }]}>{p.label}</Text>
                  <Text style={[s.privArrow, p.danger && { color: RED }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={s.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <View style={s.logoutDot} />
              <Text style={s.logoutText}>SIGN OUT</Text>
            </TouchableOpacity>

            <Text style={s.versionText}>LUXORA v2.5.0 · Build 1042</Text>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderWidth: 1, borderColor: GOLD + '33', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  backArrow: { color: GOLD, fontSize: 16 },
  headerEye: { color: GOLD, fontSize: 8, letterSpacing: 4, marginBottom: 3 },
  headerTitle: { color: WHITE, fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  goldLineHard: { height: 1, backgroundColor: GOLD, marginHorizontal: 24, opacity: 0.4 },
  editBtn: { borderWidth: 1, borderColor: GOLD + '44', paddingHorizontal: 14, paddingVertical: 8 },
  editBtnActive: { backgroundColor: GOLD },
  editBtnText: { color: GOLD, fontSize: 8, fontWeight: '800', letterSpacing: 3 },

  heroSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, gap: 18 },
  avatarRing: { width: 70, height: 70, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', borderRadius: 35, position: 'relative' },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: GOLD + '18', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: GOLD, fontSize: 20, fontWeight: '200', letterSpacing: 3 },
  avatarBadge: { position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, backgroundColor: PLATINUM + 'DD', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BG },
  avatarBadgeText: { color: '#0A0A0F', fontSize: 8, fontWeight: '900' },
  heroInfo: {},
  heroName: { color: WHITE, fontSize: 20, fontWeight: '200', letterSpacing: 1, marginBottom: 4 },
  heroTier: { color: GOLD, fontSize: 8, letterSpacing: 4, marginBottom: 3 },
  heroJoined: { color: GREY, fontSize: 9, letterSpacing: 1 },

  statsRow: { flexDirection: 'row', marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '22', backgroundColor: CARD_BG },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBoxBorder: { borderRightWidth: 1, borderRightColor: GOLD + '14' },
  statVal: { color: GOLD, fontSize: 18, fontWeight: '200', letterSpacing: 1, marginBottom: 3 },
  statLabel: { color: GREY, fontSize: 7, letterSpacing: 2, fontWeight: '700' },

  tabRow: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 9, letterSpacing: 2.5, color: GREY, fontWeight: '700' },
  tabTextActive: { color: WHITE },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  tabBorder: { height: 1, backgroundColor: GOLD + '14', marginHorizontal: 24, marginBottom: 4 },

  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },

  formCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  formField: {},
  formLabel: { color: GREY, fontSize: 7, letterSpacing: 3, fontWeight: '700', marginBottom: 6 },
  formVal: { color: WHITE, fontSize: 13, letterSpacing: 0.3, paddingVertical: 4 },
  formInput: { color: WHITE, fontSize: 13, letterSpacing: 0.3, borderBottomWidth: 1, borderBottomColor: GOLD + '44', paddingVertical: 6 },
  formDivider: { height: 1, backgroundColor: GOLD + '0A', marginVertical: 14 },

  docsCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 18 },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  docLabel: { color: GREY, fontSize: 7, letterSpacing: 2.5, fontWeight: '700', marginBottom: 4 },
  docVal: { color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  docVerified: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  docVerifiedText: { fontSize: 7, fontWeight: '800', letterSpacing: 2 },

  payCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '14', backgroundColor: CARD_BG, padding: 16, gap: 14, overflow: 'hidden' },
  payCardPrimary: { borderColor: GOLD + '44' },
  payPrimaryBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: GOLD },
  payTypeBox: { width: 50, height: 32, borderWidth: 1, borderColor: GOLD + '33', alignItems: 'center', justifyContent: 'center' },
  payTypeText: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  payCardNum: { color: WHITE, fontSize: 12, letterSpacing: 1, marginBottom: 3 },
  payExpiry: { color: GREY, fontSize: 9, letterSpacing: 1 },
  primaryBadge: { backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '44', paddingHorizontal: 8, paddingVertical: 3 },
  primaryBadgeText: { color: GOLD, fontSize: 7, fontWeight: '800', letterSpacing: 2 },
  addCardBtn: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '33', borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center' },
  addCardText: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3 },

  prefChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24 },
  prefChip: { borderWidth: 1, borderColor: GOLD + '33', paddingHorizontal: 14, paddingVertical: 10 },
  prefChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  prefChipText: { color: GREY, fontSize: 10, letterSpacing: 1 },
  prefChipTextActive: { color: BG, fontWeight: '700' },

  togglesCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, paddingHorizontal: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  toggleLabel: { color: WHITE, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },

  currCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG },
  currRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  currLabel: { color: GREY, fontSize: 8, letterSpacing: 3, fontWeight: '700' },
  currRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currVal: { color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  currArrow: { color: GOLD, fontSize: 16 },

  secCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG },
  secRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: GOLD + '0A', gap: 10 },
  secLabel: { color: WHITE, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 3 },
  secSub: { color: GREY, fontSize: 9, letterSpacing: 1 },
  secStatusDot: { width: 7, height: 7, borderRadius: 4 },
  secArrow: { color: GOLD, fontSize: 16 },

  privCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG },
  privRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  privLabel: { color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  privArrow: { color: GOLD, fontSize: 16 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 24, marginTop: 20, borderWidth: 1, borderColor: RED + '33', backgroundColor: RED + '08', paddingVertical: 16 },
  logoutDot: { width: 6, height: 6, backgroundColor: RED, borderRadius: 3 },
  logoutText: { color: RED, fontSize: 9, fontWeight: '800', letterSpacing: 4 },

  versionText: { color: GREY + '66', fontSize: 9, letterSpacing: 2, textAlign: 'center', marginTop: 16, marginBottom: 8 },
});