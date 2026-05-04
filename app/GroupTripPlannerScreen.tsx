import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
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
const BLUE = '#4A90D9';
const PURPLE = '#9B59B6';
 
const MEMBERS = [
  { initials: 'HK', name: 'Hannan Khawaja', role: 'ORGANIZER', status: 'confirmed', seat: '2A' },
  { initials: 'AR', name: 'Ahmad Raza', role: 'TRAVELER', status: 'confirmed', seat: '2B' },
  { initials: 'SN', name: 'Sana Nawaz', role: 'TRAVELER', status: 'pending', seat: '3A' },
  { initials: 'MK', name: 'Malik Kamran', role: 'TRAVELER', status: 'confirmed', seat: '3B' },
  { initials: 'FI', name: 'Fatima Irfan', role: 'TRAVELER', status: 'pending', seat: '4A' },
];
 
const ITINERARY = [
  {
    day: 'DAY 1', date: '14 May', title: 'Arrival · Riyadh',
    items: ['Fly PIA PK-743 · KHI → RUH', 'Check-in: Ritz-Carlton Riyadh', 'Welcome dinner · Al-Orjowan'],
  },
  {
    day: 'DAY 2', date: '15 May', title: 'Heritage & Business',
    items: ['Kingdom Centre Tower tour', 'National Museum of Saudi Arabia', 'Desert dining experience'],
  },
  {
    day: 'DAY 3', date: '16 May', title: 'AlUla Excursion',
    items: ['Private charter · RUH → ULH', 'Hegra archaeological site', 'Ashar Resort overnight'],
  },
  {
    day: 'DAY 4', date: '17 May', title: 'Return Journey',
    items: ['AlUla → Riyadh transfer', 'Shopping · Kingdom Mall', 'Departure · PK-744 · RUH → KHI'],
  },
];
 
const EXPENSES = [
  { label: 'Flights (5 pax)', amt: '$4,450', split: '$890 / person', color: BLUE },
  { label: 'Hotels (3 nights)', amt: '$3,200', split: '$640 / person', color: GOLD },
  { label: 'Excursions', amt: '$1,500', split: '$300 / person', color: PURPLE },
  { label: 'Meals & Dining', amt: '$850', split: '$170 / person', color: GREEN },
];
 
function statusColor(s: string) {
  return s === 'confirmed' ? GREEN : GOLD;
}
 
export default function GroupTripPlannerScreen({ onBack }: { onBack: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [activeTab, setActiveTab] = useState<'members' | 'itinerary' | 'expenses'>('members');
  const [groupName, setGroupName] = useState('Riyadh Experience 2025');
  const [editingName, setEditingName] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.timing(progressAnim, { toValue: 1, duration: 1000, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);
 
  const confirmed = MEMBERS.filter(m => m.status === 'confirmed').length;
  const total = MEMBERS.length;
 
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
 
      {/* Header */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerEye}>— GROUP TRAVEL</Text>
          <Text style={s.headerTitle}>TRIP PLANNER</Text>
        </View>
        <View style={s.memberCount}>
          <Text style={s.memberCountVal}>{total}</Text>
          <Text style={s.memberCountLabel}>PAX</Text>
        </View>
      </Animated.View>
      <View style={s.goldLineHard} />
 
      {/* Trip Hero Card */}
      <Animated.View style={[s.heroCard, { opacity: fadeAnim }]}>
        <View style={s.heroTopBar} />
        <View style={s.heroTopRow}>
          {editingName ? (
            <TextInput
              style={s.heroTitleInput}
              value={groupName}
              onChangeText={setGroupName}
              onBlur={() => setEditingName(false)}
              autoFocus
              placeholderTextColor={GREY}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.7} style={{ flex: 1 }}>
              <Text style={s.heroTitle}>{groupName}</Text>
            </TouchableOpacity>
          )}
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <View style={s.heroRouteRow}>
          <View style={s.heroOrigin}>
            <Text style={s.heroCode}>KHI</Text>
            <Text style={s.heroCity}>Karachi</Text>
          </View>
          <View style={s.heroArrow}>
            <View style={s.heroLine} />
            <Text style={s.heroArrowText}>→</Text>
          </View>
          <View style={s.heroDest}>
            <Text style={[s.heroCode, { color: GOLD }]}>RUH</Text>
            <Text style={s.heroCity}>Riyadh</Text>
          </View>
        </View>
        <View style={s.heroDatesRow}>
          <View>
            <Text style={s.heroDateLabel}>DEPART</Text>
            <Text style={s.heroDate}>14 May 2025</Text>
          </View>
          <View style={s.heroDivVert} />
          <View>
            <Text style={s.heroDateLabel}>RETURN</Text>
            <Text style={s.heroDate}>17 May 2025</Text>
          </View>
          <View style={s.heroDivVert} />
          <View>
            <Text style={s.heroDateLabel}>DURATION</Text>
            <Text style={s.heroDate}>4 Days</Text>
          </View>
        </View>
        <View style={s.heroProgressRow}>
          <Text style={s.heroProgressLabel}>{confirmed}/{total} CONFIRMED</Text>
          <Text style={s.heroProgressPct}>{Math.round((confirmed / total) * 100)}%</Text>
        </View>
        <View style={s.heroTrack}>
          <Animated.View style={[
            s.heroFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(confirmed / total) * 100}%`] }) },
          ]} />
        </View>
      </Animated.View>
 
      {/* Tab Nav */}
      <View style={s.tabRow}>
        {(['members', 'itinerary', 'expenses'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'members' ? 'MEMBERS' : t === 'itinerary' ? 'ITINERARY' : 'EXPENSES'}
            </Text>
            {activeTab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.tabBorder} />
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
 
        {/* ── MEMBERS ── */}
        {activeTab === 'members' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— GROUP MEMBERS ({total})</Text>
            {MEMBERS.map((m, i) => (
              <View key={i} style={s.memberCard}>
                <View style={[s.memberAvatar, { borderColor: statusColor(m.status) + '44' }]}>
                  <Text style={[s.memberAvatarText, { color: statusColor(m.status) }]}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberRole}>{m.role}</Text>
                </View>
                <View style={s.memberRight}>
                  <View style={s.memberSeatBox}>
                    <Text style={s.memberSeatLabel}>SEAT</Text>
                    <Text style={s.memberSeatVal}>{m.seat}</Text>
                  </View>
                  <View style={[s.memberStatus, { borderColor: statusColor(m.status) + '44' }]}>
                    <Text style={[s.memberStatusText, { color: statusColor(m.status) }]}>
                      {m.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
 
            <TouchableOpacity style={s.addMemberBtn} activeOpacity={0.8}>
              <View style={s.addMemberPlus}>
                <Text style={s.addMemberPlusText}>+</Text>
              </View>
              <Text style={s.addMemberText}>ADD TRAVELER</Text>
            </TouchableOpacity>
 
            {/* Seat Map */}
            <Text style={s.sectionTag}>— SEAT OVERVIEW</Text>
            <View style={s.seatCard}>
              <Text style={s.seatEye}>PIA PK-743 · A320 · 14 MAY</Text>
              <View style={s.seatGrid}>
                {['2A', '2B', '—', '3A', '3B', '—', '4A', '4B'].map((seat, i) => {
                  const taken = MEMBERS.find(m => m.seat === seat);
                  return (
                    <View
                      key={i}
                      style={[
                        s.seatBox,
                        seat === '—' ? s.seatAisle : taken ? s.seatTaken : s.seatEmpty,
                      ]}
                    >
                      {seat !== '—' && (
                        <Text style={[s.seatText, taken ? { color: BG } : { color: GREY }]}>
                          {taken ? taken.initials : seat}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={s.seatLegend}>
                <View style={s.seatLegendItem}><View style={[s.seatLegendDot, { backgroundColor: GOLD }]} /><Text style={s.seatLegendLabel}>TAKEN</Text></View>
                <View style={s.seatLegendItem}><View style={[s.seatLegendDot, { backgroundColor: CARD_BG, borderWidth: 1, borderColor: GREY }]} /><Text style={s.seatLegendLabel}>EMPTY</Text></View>
              </View>
            </View>
          </Animated.View>
        )}
 
        {/* ── ITINERARY ── */}
        {activeTab === 'itinerary' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— DAY-BY-DAY PLAN</Text>
            {ITINERARY.map((day, i) => (
              <View key={i} style={s.dayCard}>
                <View style={s.dayLeft}>
                  <Text style={s.dayTag}>{day.day}</Text>
                  <View style={s.dayLine} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.dayTopRow}>
                    <Text style={s.dayDate}>{day.date}</Text>
                    <Text style={s.dayTitle}>{day.title}</Text>
                  </View>
                  {day.items.map((item, j) => (
                    <View key={j} style={s.dayItem}>
                      <View style={s.dayItemDot} />
                      <Text style={s.dayItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
 
        {/* ── EXPENSES ── */}
        {activeTab === 'expenses' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— COST BREAKDOWN</Text>
            <View style={s.totalCard}>
              <View style={s.totalTopBar} />
              <Text style={s.totalLabel}>TOTAL GROUP COST</Text>
              <Text style={s.totalVal}>$10,000</Text>
              <View style={s.totalDivider} />
              <Text style={s.totalPerLabel}>PER PERSON</Text>
              <Text style={s.totalPerVal}>$2,000</Text>
            </View>
 
            {EXPENSES.map((e, i) => (
              <View key={i} style={s.expCard}>
                <View style={[s.expColorBar, { backgroundColor: e.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.expLabel}>{e.label}</Text>
                  <Text style={s.expSplit}>{e.split}</Text>
                </View>
                <Text style={[s.expAmt, { color: e.color }]}>{e.amt}</Text>
              </View>
            ))}
 
            <Text style={s.sectionTag}>— PAYMENT STATUS</Text>
            <View style={s.payCard}>
              {MEMBERS.map((m, i) => (
                <View key={i} style={s.payRow}>
                  <View style={[s.payAvatar, { borderColor: statusColor(m.status) + '33' }]}>
                    <Text style={[s.payAvatarText, { color: statusColor(m.status) }]}>{m.initials}</Text>
                  </View>
                  <Text style={s.payName}>{m.name}</Text>
                  <View style={s.payRight}>
                    <Text style={s.payAmt}>$2,000</Text>
                    <View style={[s.payStatus, { borderColor: statusColor(m.status) + '33' }]}>
                      <Text style={[s.payStatusText, { color: statusColor(m.status) }]}>
                        {m.status === 'confirmed' ? 'PAID' : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
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
  memberCount: { alignItems: 'center', borderWidth: 1, borderColor: GOLD + '44', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: GOLD + '0F' },
  memberCountVal: { color: GOLD, fontSize: 18, fontWeight: '200', letterSpacing: 1 },
  memberCountLabel: { color: GOLD, fontSize: 7, letterSpacing: 3, fontWeight: '700' },
 
  heroCard: { marginHorizontal: 24, marginTop: 16, borderWidth: 1, borderColor: GOLD + '33', backgroundColor: CARD_BG, padding: 20 },
  heroTopBar: { width: '100%', height: 2, backgroundColor: GOLD, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  heroTitle: { flex: 1, color: WHITE, fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  heroTitleInput: { flex: 1, color: WHITE, fontSize: 16, fontWeight: '600', letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 2 },
  heroBadge: { backgroundColor: GREEN + '18', borderWidth: 1, borderColor: GREEN + '44', paddingHorizontal: 9, paddingVertical: 4 },
  heroBadgeText: { color: GREEN, fontSize: 7, fontWeight: '800', letterSpacing: 2 },
  heroRouteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroOrigin: { alignItems: 'center', width: 60 },
  heroDest: { alignItems: 'center', width: 60 },
  heroCode: { color: WHITE, fontSize: 24, fontWeight: '200', letterSpacing: 2 },
  heroCity: { color: GREY, fontSize: 8, letterSpacing: 2, marginTop: 2 },
  heroArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroLine: { flex: 1, height: 1, backgroundColor: GOLD + '44' },
  heroArrowText: { color: GOLD, fontSize: 16 },
  heroDatesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroDateLabel: { color: GREY, fontSize: 7, letterSpacing: 2.5, marginBottom: 4 },
  heroDate: { color: WHITE, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  heroDivVert: { width: 1, height: 32, backgroundColor: GOLD + '22', marginHorizontal: 16 },
  heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroProgressLabel: { color: GREY, fontSize: 9, letterSpacing: 2 },
  heroProgressPct: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  heroTrack: { height: 3, backgroundColor: GOLD + '18' },
  heroFill: { height: '100%', backgroundColor: GOLD },
 
  tabRow: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 9, letterSpacing: 2.5, color: GREY, fontWeight: '700' },
  tabTextActive: { color: WHITE },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  tabBorder: { height: 1, backgroundColor: GOLD + '14', marginHorizontal: 24, marginBottom: 4 },
 
  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },
 
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '1A', backgroundColor: CARD_BG, padding: 14 },
  memberAvatar: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: GOLD + '0F' },
  memberAvatarText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  memberName: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  memberRole: { color: GREY, fontSize: 8, letterSpacing: 2, marginTop: 3 },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  memberSeatBox: { alignItems: 'center' },
  memberSeatLabel: { color: GREY, fontSize: 7, letterSpacing: 2 },
  memberSeatVal: { color: GOLD, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  memberStatus: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  memberStatusText: { fontSize: 7, fontWeight: '800', letterSpacing: 1.5 },
 
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 24, marginTop: 4, borderWidth: 1, borderColor: GOLD + '33', borderStyle: 'dashed', padding: 16 },
  addMemberPlus: { width: 28, height: 28, borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  addMemberPlusText: { color: GOLD, fontSize: 16, fontWeight: '300' },
  addMemberText: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
 
  seatCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  seatEye: { color: GREY, fontSize: 9, letterSpacing: 2, marginBottom: 16 },
  seatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  seatBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  seatAisle: { width: 20, backgroundColor: 'transparent' },
  seatTaken: { backgroundColor: GOLD, borderWidth: 0 },
  seatEmpty: { borderWidth: 1, borderColor: GREY + '44', backgroundColor: CARD_BG },
  seatText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  seatLegend: { flexDirection: 'row', gap: 20, marginTop: 16, justifyContent: 'center' },
  seatLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatLegendDot: { width: 10, height: 10 },
  seatLegendLabel: { color: GREY, fontSize: 8, letterSpacing: 2 },
 
  dayCard: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '1A', backgroundColor: CARD_BG },
  dayLeft: { width: 52, alignItems: 'center', paddingTop: 16, paddingBottom: 16, borderRightWidth: 1, borderRightColor: GOLD + '14' },
  dayTag: { color: GOLD, fontSize: 7, fontWeight: '800', letterSpacing: 1.5, writingDirection: 'ltr' },
  dayLine: { width: 1, flex: 1, backgroundColor: GOLD + '22', marginTop: 8 },
  dayTopRow: { paddingTop: 14, paddingHorizontal: 16, marginBottom: 10 },
  dayDate: { color: GREY, fontSize: 8, letterSpacing: 3, marginBottom: 4 },
  dayTitle: { color: WHITE, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  dayItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, paddingBottom: 10 },
  dayItemDot: { width: 4, height: 4, backgroundColor: GOLD, marginTop: 6 },
  dayItemText: { flex: 1, color: GREY, fontSize: 11, lineHeight: 18 },
 
  totalCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '33', backgroundColor: CARD_BG, padding: 24, alignItems: 'center' },
  totalTopBar: { width: '100%', height: 2, backgroundColor: GOLD, marginBottom: 20 },
  totalLabel: { color: GREY, fontSize: 8, letterSpacing: 4, marginBottom: 8 },
  totalVal: { color: GOLD, fontSize: 42, fontWeight: '100', letterSpacing: 2, marginBottom: 16 },
  totalDivider: { width: 40, height: 1, backgroundColor: GOLD + '44', marginBottom: 12 },
  totalPerLabel: { color: GREY, fontSize: 8, letterSpacing: 3, marginBottom: 4 },
  totalPerVal: { color: WHITE, fontSize: 22, fontWeight: '200', letterSpacing: 1 },
 
  expCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '14', backgroundColor: CARD_BG, padding: 16, gap: 14, overflow: 'hidden' },
  expColorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  expLabel: { color: WHITE, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  expSplit: { color: GREY, fontSize: 9, letterSpacing: 1 },
  expAmt: { fontSize: 18, fontWeight: '200', letterSpacing: 0.5 },
 
  payCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 16 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  payAvatar: { width: 32, height: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  payAvatarText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  payName: { flex: 1, color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  payRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payAmt: { color: WHITE, fontSize: 12, fontWeight: '600' },
  payStatus: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  payStatusText: { fontSize: 7, fontWeight: '800', letterSpacing: 1.5 },
});
 