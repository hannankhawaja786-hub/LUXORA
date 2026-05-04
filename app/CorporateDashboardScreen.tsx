import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
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
const BLUE = '#4A90D9';
 
const METRICS = [
  { label: 'TOTAL SPEND', value: '$184,250', delta: '+12.4%', up: true, sub: 'vs last quarter' },
  { label: 'ACTIVE TRIPS', value: '23', delta: '+3', up: true, sub: 'this month' },
  { label: 'TRAVELERS', value: '147', delta: '-4', up: false, sub: 'registered' },
  { label: 'SAVED', value: '$31,400', delta: '+8.2%', up: true, sub: 'vs market rate' },
];
 
const RECENT_TRIPS = [
  { ref: 'LX-8821', traveler: 'Khalid Al-Rashid', route: 'RUH → LHR', class: 'BUSINESS', amount: '$3,240', status: 'ACTIVE', date: '28 Apr' },
  { ref: 'LX-8819', traveler: 'Fatima Zahra', route: 'JED → DXB', class: 'FIRST', amount: '$5,100', status: 'CONFIRMED', date: '26 Apr' },
  { ref: 'LX-8814', traveler: 'Omar Siddiqui', route: 'DMM → IST', class: 'BUSINESS', amount: '$2,870', status: 'COMPLETED', date: '22 Apr' },
  { ref: 'LX-8810', traveler: 'Nora Al-Ghamdi', route: 'RUH → CDG', class: 'FIRST', amount: '$6,450', status: 'COMPLETED', date: '19 Apr' },
  { ref: 'LX-8807', traveler: 'Ahmed Malik', route: 'KHI → RUH', class: 'ECONOMY', amount: '$890', status: 'COMPLETED', date: '15 Apr' },
];
 
const SPEND_BARS = [
  { month: 'NOV', val: 62 },
  { month: 'DEC', val: 78 },
  { month: 'JAN', val: 55 },
  { month: 'FEB', val: 91 },
  { month: 'MAR', val: 74 },
  { month: 'APR', val: 100 },
];
 
const TOP_ROUTES = [
  { route: 'RUH → DXB', count: 34, pct: 92 },
  { route: 'JED → LHR', count: 27, pct: 73 },
  { route: 'DMM → IST', count: 18, pct: 49 },
  { route: 'RUH → CDG', count: 14, pct: 38 },
];
 
const POLICY = [
  { label: 'FLIGHT CLASS LIMIT', val: 'Business · 6h+', ok: true },
  { label: 'HOTEL TIER LIMIT', val: '5-Star Only', ok: true },
  { label: 'ADVANCE BOOKING', val: '14 Days Min', ok: false },
  { label: 'APPROVAL REQUIRED', val: '>$5,000', ok: true },
];
 
function statusColor(s: string) {
  if (s === 'ACTIVE') return GOLD;
  if (s === 'CONFIRMED') return BLUE;
  if (s === 'COMPLETED') return GREEN;
  return GREY;
}
 
export default function CorporateDashboardScreen({ onBack }: { onBack: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const barAnims = useRef(SPEND_BARS.map(() => new Animated.Value(0))).current;
  const routeAnims = useRef(TOP_ROUTES.map(() => new Animated.Value(0))).current;
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'policy'>('overview');
  const tickAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
 
    const barSeq = barAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 700, delay: i * 80, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    );
    const routeSeq = routeAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 700, delay: 300 + i * 100, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    );
    Animated.parallel([...barSeq, ...routeSeq]).start();
 
    Animated.loop(
      Animated.sequence([
        Animated.timing(tickAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(tickAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
 
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
 
      {/* Header */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerEye}>— CORPORATE PORTAL</Text>
          <Text style={s.headerTitle}>TRAVEL DASHBOARD</Text>
        </View>
        <Animated.View style={[s.liveBadge, { opacity: tickAnim }]}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </Animated.View>
      </Animated.View>
      <View style={s.goldLineHard} />
 
      {/* Company badge */}
      <Animated.View style={[s.companyBand, { opacity: fadeAnim }]}>
        <View style={s.companyLogo}>
          <Text style={s.companyLogoText}>ARC</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.companyName}>Al-Rashid Corporation</Text>
          <Text style={s.companyTier}>LUXORA CORPORATE · PLATINUM TIER</Text>
        </View>
        <View style={s.companyStatBox}>
          <Text style={s.companyStatVal}>Q2 2025</Text>
          <Text style={s.companyStatLabel}>PERIOD</Text>
        </View>
      </Animated.View>
 
      {/* Tab Nav */}
      <View style={s.tabRow}>
        {(['overview', 'trips', 'policy'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'overview' ? 'OVERVIEW' : t === 'trips' ? 'TRIPS' : 'POLICY'}
            </Text>
            {activeTab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.tabBorder} />
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
 
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <Animated.View style={{ opacity: fadeAnim }}>
 
            {/* KPI Grid */}
            <View style={s.kpiGrid}>
              {METRICS.map((m, i) => (
                <View key={i} style={s.kpiCard}>
                  <View style={[s.kpiBar, { backgroundColor: m.up ? GREEN : RED }]} />
                  <Text style={s.kpiLabel}>{m.label}</Text>
                  <Text style={s.kpiValue}>{m.value}</Text>
                  <View style={s.kpiDeltaRow}>
                    <Text style={[s.kpiDelta, { color: m.up ? GREEN : RED }]}>{m.delta}</Text>
                    <Text style={s.kpiSub}> {m.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
 
            {/* Spend Chart */}
            <Text style={s.sectionTag}>— MONTHLY SPEND TREND</Text>
            <View style={s.chartCard}>
              <View style={s.chartTopRow}>
                <Text style={s.chartTitle}>Apr 2025 Peak</Text>
                <Text style={s.chartVal}>$184,250</Text>
              </View>
              <View style={s.barChart}>
                {SPEND_BARS.map((b, i) => (
                  <View key={i} style={s.barCol}>
                    <View style={s.barTrack}>
                      <Animated.View style={[
                        s.barFill,
                        {
                          height: barAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', `${b.val}%`] }),
                          backgroundColor: b.val === 100 ? GOLD : CARD_BG,
                          borderTopWidth: 1,
                          borderTopColor: b.val === 100 ? GOLD_LIGHT : GOLD + '44',
                        },
                      ]} />
                    </View>
                    <Text style={[s.barLabel, b.val === 100 && { color: GOLD }]}>{b.month}</Text>
                  </View>
                ))}
              </View>
            </View>
 
            {/* Top Routes */}
            <Text style={s.sectionTag}>— TOP ROUTES</Text>
            <View style={s.routesCard}>
              {TOP_ROUTES.map((r, i) => (
                <View key={i} style={s.routeRow}>
                  <Text style={s.routeIndex}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={s.routeTopRow}>
                      <Text style={s.routeName}>{r.route}</Text>
                      <Text style={s.routeCount}>{r.count} trips</Text>
                    </View>
                    <View style={s.routeTrack}>
                      <Animated.View style={[
                        s.routeFill,
                        { width: routeAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', `${r.pct}%`] }) },
                      ]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
 
            {/* Class Distribution */}
            <Text style={s.sectionTag}>— CLASS DISTRIBUTION</Text>
            <View style={s.classCard}>
              {[
                { label: 'FIRST', pct: 38, color: GOLD },
                { label: 'BUSINESS', pct: 47, color: BLUE },
                { label: 'ECONOMY', pct: 15, color: GREY },
              ].map((c, i) => (
                <View key={i} style={s.classRow}>
                  <View style={[s.classDot, { backgroundColor: c.color }]} />
                  <Text style={s.classLabel}>{c.label}</Text>
                  <View style={s.classTrackWrap}>
                    <View style={[s.classTrackFill, { width: `${c.pct}%`, backgroundColor: c.color + '66' }]} />
                  </View>
                  <Text style={[s.classPct, { color: c.color }]}>{c.pct}%</Text>
                </View>
              ))}
            </View>
 
          </Animated.View>
        )}
 
        {/* ── TRIPS ── */}
        {activeTab === 'trips' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— RECENT BOOKINGS</Text>
            {RECENT_TRIPS.map((t, i) => (
              <View key={i} style={s.tripCard}>
                <View style={[s.tripStatusBar, { backgroundColor: statusColor(t.status) }]} />
                <View style={s.tripTopRow}>
                  <Text style={s.tripRef}>{t.ref}</Text>
                  <View style={[s.tripStatusBadge, { borderColor: statusColor(t.status) + '44' }]}>
                    <Text style={[s.tripStatusText, { color: statusColor(t.status) }]}>{t.status}</Text>
                  </View>
                </View>
                <Text style={s.tripTraveler}>{t.traveler}</Text>
                <View style={s.tripMidRow}>
                  <Text style={s.tripRoute}>{t.route}</Text>
                  <Text style={s.tripDate}>{t.date}</Text>
                </View>
                <View style={s.tripBotRow}>
                  <View style={s.tripClassBadge}>
                    <Text style={s.tripClassText}>{t.class}</Text>
                  </View>
                  <Text style={s.tripAmount}>{t.amount}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
 
        {/* ── POLICY ── */}
        {activeTab === 'policy' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— TRAVEL POLICY</Text>
            <View style={s.policyCard}>
              <View style={s.policyTopBar} />
              <Text style={s.policyEye}>PLATINUM CORPORATE POLICY</Text>
              <Text style={s.policyTitle}>Al-Rashid Corp{'\n'}Travel Standards</Text>
              <View style={s.policyDivider} />
              {POLICY.map((p, i) => (
                <View key={i} style={s.policyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.policyLabel}>{p.label}</Text>
                    <Text style={s.policyVal}>{p.val}</Text>
                  </View>
                  <View style={[s.policyCheck, { borderColor: p.ok ? GREEN + '44' : RED + '44' }]}>
                    <Text style={[s.policyCheckText, { color: p.ok ? GREEN : RED }]}>{p.ok ? '✓' : '!'}</Text>
                  </View>
                </View>
              ))}
            </View>
 
            <Text style={s.sectionTag}>— BUDGET TRACKER</Text>
            <View style={s.budgetCard}>
              <View style={s.budgetTopRow}>
                <Text style={s.budgetLabel}>Q2 BUDGET</Text>
                <Text style={s.budgetUsed}>$184,250 / $220,000</Text>
              </View>
              <View style={s.budgetTrack}>
                <View style={[s.budgetFill, { width: '84%' }]} />
                <View style={s.budgetMarker} />
              </View>
              <View style={s.budgetBottomRow}>
                <Text style={s.budgetPct}>84% UTILIZED</Text>
                <Text style={s.budgetRemain}>$35,750 remaining</Text>
              </View>
              <View style={s.budgetNote}>
                <View style={s.budgetNoteDot} />
                <Text style={s.budgetNoteText}>At current burn rate, budget will be exhausted by May 18.</Text>
              </View>
            </View>
 
            <Text style={s.sectionTag}>— ACCOUNT MANAGER</Text>
            <View style={s.amCard}>
              <View style={s.amAvatar}>
                <Text style={s.amAvatarText}>SR</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.amName}>Sara Rahman</Text>
                <Text style={s.amRole}>LUXORA Corporate Liaison</Text>
              </View>
              <TouchableOpacity style={s.amBtn} activeOpacity={0.8}>
                <Text style={s.amBtnText}>CONTACT</Text>
              </TouchableOpacity>
            </View>
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
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: GREEN + '44', paddingHorizontal: 9, paddingVertical: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  liveText: { color: GREEN, fontSize: 8, fontWeight: '800', letterSpacing: 2 },
 
  companyBand: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginTop: 16, borderWidth: 1, borderColor: GOLD + '22', backgroundColor: CARD_BG, padding: 14, gap: 14 },
  companyLogo: { width: 46, height: 46, backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '44', alignItems: 'center', justifyContent: 'center' },
  companyLogoText: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  companyName: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  companyTier: { color: GOLD, fontSize: 8, letterSpacing: 2, marginTop: 3 },
  companyStatBox: { alignItems: 'flex-end' },
  companyStatVal: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  companyStatLabel: { color: GREY, fontSize: 7, letterSpacing: 2, marginTop: 2 },
 
  tabRow: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 9, letterSpacing: 2.5, color: GREY, fontWeight: '700' },
  tabTextActive: { color: WHITE },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  tabBorder: { height: 1, backgroundColor: GOLD + '14', marginHorizontal: 24, marginBottom: 4 },
 
  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },
 
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24, marginTop: 16 },
  kpiCard: { width: (width - 56) / 2, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 16, overflow: 'hidden' },
  kpiBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  kpiLabel: { fontSize: 8, letterSpacing: 2.5, color: GREY, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  kpiValue: { fontSize: 24, fontWeight: '200', color: WHITE, letterSpacing: -0.5, marginBottom: 6 },
  kpiDeltaRow: { flexDirection: 'row', alignItems: 'center' },
  kpiDelta: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  kpiSub: { fontSize: 9, color: GREY },
 
  chartCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  chartTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 },
  chartTitle: { color: GREY, fontSize: 9, letterSpacing: 2 },
  chartVal: { color: GOLD, fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 72, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  barLabel: { fontSize: 7, letterSpacing: 1, color: GREY, fontWeight: '700' },
 
  routesCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  routeIndex: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1, opacity: 0.6, width: 20 },
  routeTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  routeName: { color: WHITE, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  routeCount: { color: GREY, fontSize: 10, letterSpacing: 0.5 },
  routeTrack: { height: 3, backgroundColor: GOLD + '18', borderRadius: 2 },
  routeFill: { height: 3, backgroundColor: GOLD, borderRadius: 2 },
 
  classCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  classDot: { width: 6, height: 6, borderRadius: 3 },
  classLabel: { color: GREY, fontSize: 9, letterSpacing: 2, fontWeight: '700', width: 64 },
  classTrackWrap: { flex: 1, height: 6, backgroundColor: GOLD + '14', borderRadius: 1, overflow: 'hidden' },
  classTrackFill: { height: '100%', borderRadius: 1 },
  classPct: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, width: 32, textAlign: 'right' },
 
  tripCard: { marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '1A', backgroundColor: CARD_BG, padding: 16, overflow: 'hidden' },
  tripStatusBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5 },
  tripTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 6 },
  tripRef: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  tripStatusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  tripStatusText: { fontSize: 7, fontWeight: '800', letterSpacing: 2 },
  tripTraveler: { color: WHITE, fontSize: 14, fontWeight: '600', letterSpacing: 0.3, marginBottom: 8 },
  tripMidRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tripRoute: { color: GREY, fontSize: 11, letterSpacing: 1 },
  tripDate: { color: GREY, fontSize: 10, letterSpacing: 1 },
  tripBotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripClassBadge: { borderWidth: 1, borderColor: GOLD + '33', backgroundColor: GOLD + '0F', paddingHorizontal: 10, paddingVertical: 4 },
  tripClassText: { color: GOLD, fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  tripAmount: { color: WHITE, fontSize: 16, fontWeight: '200', letterSpacing: 0.5 },
 
  policyCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '22', backgroundColor: CARD_BG, padding: 22 },
  policyTopBar: { width: '100%', height: 2, backgroundColor: GOLD, marginBottom: 18 },
  policyEye: { color: GOLD, fontSize: 8, letterSpacing: 4, marginBottom: 8 },
  policyTitle: { color: WHITE, fontSize: 20, fontWeight: '200', lineHeight: 28, marginBottom: 16 },
  policyDivider: { height: 1, backgroundColor: GOLD + '14', marginBottom: 16 },
  policyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  policyLabel: { color: GREY, fontSize: 8, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  policyVal: { color: WHITE, fontSize: 12, letterSpacing: 0.5 },
  policyCheck: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  policyCheckText: { fontSize: 13, fontWeight: '700' },
 
  budgetCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  budgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  budgetLabel: { color: GREY, fontSize: 8, letterSpacing: 3 },
  budgetUsed: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  budgetTrack: { height: 6, backgroundColor: GOLD + '14', marginBottom: 8, position: 'relative' },
  budgetFill: { height: '100%', backgroundColor: GOLD },
  budgetMarker: { position: 'absolute', right: '16%', top: -4, width: 1, height: 14, backgroundColor: RED },
  budgetBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  budgetPct: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  budgetRemain: { color: GREY, fontSize: 10, letterSpacing: 0.5 },
  budgetNote: { flexDirection: 'row', gap: 10, padding: 12, borderWidth: 1, borderColor: RED + '22', backgroundColor: RED + '08' },
  budgetNoteDot: { width: 4, height: 4, backgroundColor: RED, marginTop: 5 },
  budgetNoteText: { flex: 1, color: RED + 'CC', fontSize: 11, lineHeight: 17 },
 
  amCard: { marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: GOLD + '22', backgroundColor: CARD_BG, padding: 16, gap: 14 },
  amAvatar: { width: 44, height: 44, backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '44', alignItems: 'center', justifyContent: 'center' },
  amAvatarText: { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  amName: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  amRole: { color: GREY, fontSize: 9, letterSpacing: 1, marginTop: 3 },
  amBtn: { backgroundColor: GOLD, paddingHorizontal: 14, paddingVertical: 10 },
  amBtnText: { color: BG, fontSize: 8, fontWeight: '800', letterSpacing: 2 },
});
 