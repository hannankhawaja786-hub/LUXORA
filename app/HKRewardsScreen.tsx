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
const PLATINUM = '#E8E8F0';
 
const TIER_DATA = {
  name: 'PLATINUM',
  points: 2450,
  nextTier: 'BLACK',
  nextAt: 5000,
  color: PLATINUM,
  perks: ['Complimentary airport lounge', 'Priority check-in', 'Guaranteed upgrades', 'Dedicated concierge'],
};
 
const HISTORY = [
  { ref: 'LX-8821', desc: 'Business Class · RUH → LHR', pts: '+840', date: '28 Apr', positive: true },
  { ref: 'LX-8815', desc: 'Hotel Stay · Ritz Riyadh', pts: '+620', date: '20 Apr', positive: true },
  { ref: 'LX-8801', desc: 'Lounge Access Redemption', pts: '-200', date: '10 Apr', positive: false },
  { ref: 'LX-8795', desc: 'First Class · JED → CDG', pts: '+1,200', date: '02 Apr', positive: true },
  { ref: 'LX-8780', desc: 'Bonus: Referral Reward', pts: '+500', date: '18 Mar', positive: true },
];
 
const REWARDS = [
  { label: 'LOUNGE ACCESS', pts: '200 pts', sub: 'Any airport worldwide', color: GOLD, tag: 'POPULAR' },
  { label: 'SEAT UPGRADE', pts: '500 pts', sub: 'Business → First Class', color: PLATINUM, tag: 'PREMIUM' },
  { label: 'HOTEL NIGHT', pts: '1,000 pts', sub: '1 free night · 5-star', color: GOLD_LIGHT, tag: 'ELITE' },
  { label: 'AIRPORT TRANSFER', pts: '150 pts', sub: 'Private car service', color: GOLD, tag: null },
  { label: 'TRAVEL INSURANCE', pts: '300 pts', sub: 'Comprehensive cover', color: PLATINUM, tag: null },
  { label: 'CONCIERGE SESSION', pts: '100 pts', sub: '60-min dedicated support', color: GOLD, tag: null },
];
 
const TIERS = [
  { name: 'SILVER', range: '0 – 999', color: '#8C8C9E' },
  { name: 'GOLD', range: '1,000 – 2,499', color: GOLD },
  { name: 'PLATINUM', range: '2,500 – 4,999', color: PLATINUM },
  { name: 'BLACK', range: '5,000+', color: '#1A1A1A' },
];
 
export default function HKRewardsScreen({ onBack }: { onBack: () => void }) {
  // useNativeDriver: true wale anims
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
 
  // useNativeDriver: false wale anims (backgroundColor / width interpolate)
  const progressAnim = useRef(new Animated.Value(0)).current;
  const countAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim     = useRef(new Animated.Value(0)).current;
 
  const [displayPts, setDisplayPts] = useState(0);
  const [activeTab, setActiveTab]   = useState<'rewards' | 'history' | 'tiers'>('rewards');
 
  useEffect(() => {
    // ✅ Native driver anims — transform/opacity only
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
 
    // ✅ Non-native driver anims — width/backgroundColor
    Animated.timing(progressAnim, {
      toValue: 1, duration: 1400, delay: 500,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
 
    Animated.timing(countAnim, {
      toValue: 2450, duration: 1600, delay: 400,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
    countAnim.addListener(({ value }) => setDisplayPts(Math.floor(value)));
 
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
 
    return () => countAnim.removeAllListeners();
  }, []);
 
  const pct = TIER_DATA.points / TIER_DATA.nextAt;
  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [GOLD + '22', GOLD + '55'],
  });
 
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
 
      {/* Header — useNativeDriver: true (opacity + translateY only) */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerEye}>— LOYALTY PROGRAM</Text>
          <Text style={s.headerTitle}>HK REWARDS</Text>
        </View>
        <View style={s.tierBadge}>
          <Text style={s.tierBadgeText}>PLATINUM</Text>
        </View>
      </Animated.View>
      <View style={s.goldLineHard} />
 
      {/* ✅ FIX: heroCard ko 2 layers mein split kiya
          Outer = glowAnim (useNativeDriver: false) — backgroundColor
          Inner = fadeAnim (useNativeDriver: true) — opacity
          Dono alag Animated.View mein — koi mix nahi! */}
      <Animated.View style={[s.heroCard, { backgroundColor: glowColor }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={s.heroInner}>
            <View style={s.heroCornerTL} />
            <View style={s.heroCornerTR} />
            <View style={s.heroCornerBL} />
            <View style={s.heroCornerBR} />
 
            <Text style={s.heroEye}>— YOUR BALANCE</Text>
            <Text style={s.heroPoints}>{displayPts.toLocaleString()}</Text>
            <Text style={s.heroPointsLabel}>REWARD POINTS</Text>
 
            <View style={s.heroDivider} />
 
            <View style={s.heroProgressSection}>
              <View style={s.heroProgressTopRow}>
                <Text style={s.heroProgressLabel}>PROGRESS TO BLACK</Text>
                <Text style={s.heroProgressVal}>{TIER_DATA.points.toLocaleString()} / {TIER_DATA.nextAt.toLocaleString()}</Text>
              </View>
              <View style={s.heroTrack}>
                <Animated.View style={[
                  s.heroFill,
                  { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct * 100}%`] }) },
                ]} />
                <View style={[s.heroThumb, { left: `${pct * 100}%` }]} />
              </View>
              <Text style={s.heroRemain}>{(TIER_DATA.nextAt - TIER_DATA.points).toLocaleString()} pts to BLACK tier</Text>
            </View>
 
            <View style={s.heroPerksRow}>
              {TIER_DATA.perks.slice(0, 2).map((p, i) => (
                <View key={i} style={s.heroPerkChip}>
                  <View style={s.heroPerkDot} />
                  <Text style={s.heroPerkText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
 
      {/* Tab Nav */}
      <View style={s.tabRow}>
        {(['rewards', 'history', 'tiers'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'rewards' ? 'REDEEM' : t === 'history' ? 'HISTORY' : 'TIERS'}
            </Text>
            {activeTab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.tabBorder} />
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
 
        {/* REWARDS */}
        {activeTab === 'rewards' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— AVAILABLE REWARDS</Text>
            {REWARDS.map((r, i) => (
              <View key={i} style={s.rewardCard}>
                <View style={[s.rewardLeftBar, { backgroundColor: r.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={s.rewardTopRow}>
                    <Text style={s.rewardLabel}>{r.label}</Text>
                    {r.tag && (
                      <View style={s.rewardTag}>
                        <Text style={s.rewardTagText}>{r.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.rewardSub}>{r.sub}</Text>
                </View>
                <View style={s.rewardRight}>
                  <Text style={[s.rewardPts, { color: r.color === PLATINUM ? WHITE : r.color }]}>{r.pts}</Text>
                  <TouchableOpacity style={[s.redeemBtn, { borderColor: r.color + '66' }]} activeOpacity={0.8}>
                    <Text style={[s.redeemBtnText, { color: r.color === PLATINUM ? WHITE : r.color }]}>REDEEM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
 
        {/* HISTORY */}
        {activeTab === 'history' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— POINTS HISTORY</Text>
            {HISTORY.map((h, i) => (
              <View key={i} style={s.histCard}>
                <View style={s.histLeft}>
                  <View style={[s.histDot, { backgroundColor: h.positive ? GREEN : '#D93025' }]} />
                  <View style={[s.histLine, i < HISTORY.length - 1 ? {} : { opacity: 0 }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.histTopRow}>
                    <Text style={s.histRef}>{h.ref}</Text>
                    <Text style={s.histDate}>{h.date}</Text>
                  </View>
                  <Text style={s.histDesc}>{h.desc}</Text>
                </View>
                <Text style={[s.histPts, { color: h.positive ? GREEN : '#D93025' }]}>{h.pts}</Text>
              </View>
            ))}
            <View style={s.histSummary}>
              <View style={s.histSummaryItem}>
                <Text style={s.histSummaryLabel}>TOTAL EARNED</Text>
                <Text style={[s.histSummaryVal, { color: GREEN }]}>+3,160</Text>
              </View>
              <View style={s.histSummaryDivider} />
              <View style={s.histSummaryItem}>
                <Text style={s.histSummaryLabel}>TOTAL REDEEMED</Text>
                <Text style={[s.histSummaryVal, { color: '#D93025' }]}>-200</Text>
              </View>
              <View style={s.histSummaryDivider} />
              <View style={s.histSummaryItem}>
                <Text style={s.histSummaryLabel}>NET BALANCE</Text>
                <Text style={[s.histSummaryVal, { color: GOLD }]}>2,450</Text>
              </View>
            </View>
          </Animated.View>
        )}
 
        {/* TIERS */}
        {activeTab === 'tiers' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={s.sectionTag}>— TIER STRUCTURE</Text>
            {TIERS.map((t, i) => {
              const isActive = t.name === 'PLATINUM';
              return (
                <View key={i} style={[s.tierCard, isActive && s.tierCardActive]}>
                  {isActive && <View style={s.tierActiveBar} />}
                  <View style={[s.tierColorDot, { backgroundColor: t.color, borderWidth: t.name === 'BLACK' ? 1 : 0, borderColor: GOLD + '44' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.tierName, isActive && { color: WHITE }]}>{t.name}</Text>
                    <Text style={s.tierRange}>{t.range} pts</Text>
                  </View>
                  {isActive && (
                    <View style={s.tierCurrentBadge}>
                      <Text style={s.tierCurrentText}>CURRENT</Text>
                    </View>
                  )}
                </View>
              );
            })}
 
            <Text style={s.sectionTag}>— PLATINUM PERKS</Text>
            <View style={s.perksCard}>
              <View style={s.perksTopBar} />
              {TIER_DATA.perks.map((p, i) => (
                <View key={i} style={s.perkRow}>
                  <View style={s.perkCheck}>
                    <Text style={s.perkCheckText}>✓</Text>
                  </View>
                  <Text style={s.perkText}>{p}</Text>
                </View>
              ))}
            </View>
 
            <View style={s.blackTeaser}>
              <View style={s.blackTeaserBar} />
              <Text style={s.blackTeaserEye}>— UNLOCK BLACK TIER</Text>
              <Text style={s.blackTeaserTitle}>Only 2,550 pts{'\n'}away from Black.</Text>
              <Text style={s.blackTeaserBody}>
                Black tier members receive a dedicated relationship manager, access to ultra-private charter services, and first-look at LUXORA exclusive launches.
              </Text>
              <TouchableOpacity style={s.blackTeaserBtn} activeOpacity={0.8}>
                <Text style={s.blackTeaserBtnText}>HOW TO EARN FASTER →</Text>
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
  tierBadge: { backgroundColor: PLATINUM + '18', borderWidth: 1, borderColor: PLATINUM + '44', paddingHorizontal: 12, paddingVertical: 6 },
  tierBadgeText: { color: PLATINUM, fontSize: 8, fontWeight: '800', letterSpacing: 3 },
  heroCard: { marginHorizontal: 24, marginTop: 16, borderWidth: 1, borderColor: GOLD + '44' },
  heroInner: { padding: 24, position: 'relative' },
  heroCornerTL: { position: 'absolute', top: 8, left: 8, width: 12, height: 12, borderTopWidth: 1, borderLeftWidth: 1, borderColor: GOLD },
  heroCornerTR: { position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderTopWidth: 1, borderRightWidth: 1, borderColor: GOLD },
  heroCornerBL: { position: 'absolute', bottom: 8, left: 8, width: 12, height: 12, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: GOLD },
  heroCornerBR: { position: 'absolute', bottom: 8, right: 8, width: 12, height: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: GOLD },
  heroEye: { color: GOLD, fontSize: 8, letterSpacing: 4, marginBottom: 12, textAlign: 'center' },
  heroPoints: { color: GOLD, fontSize: 64, fontWeight: '100', letterSpacing: 4, textAlign: 'center', marginBottom: 4 },
  heroPointsLabel: { color: GREY, fontSize: 9, letterSpacing: 5, textAlign: 'center', marginBottom: 20 },
  heroDivider: { height: 1, backgroundColor: GOLD + '22', marginBottom: 20 },
  heroProgressSection: {},
  heroProgressTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroProgressLabel: { color: GREY, fontSize: 8, letterSpacing: 2.5 },
  heroProgressVal: { color: WHITE, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  heroTrack: { height: 3, backgroundColor: GOLD + '18', marginBottom: 8, position: 'relative', overflow: 'visible' },
  heroFill: { height: '100%', backgroundColor: GOLD },
  heroThumb: { position: 'absolute', top: -3, width: 9, height: 9, backgroundColor: GOLD, borderRadius: 5, marginLeft: -4 },
  heroRemain: { color: GREY, fontSize: 9, letterSpacing: 1, marginBottom: 16 },
  heroPerksRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  heroPerkChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: GOLD + '33', paddingHorizontal: 10, paddingVertical: 5 },
  heroPerkDot: { width: 4, height: 4, backgroundColor: GOLD },
  heroPerkText: { color: GREY, fontSize: 8, letterSpacing: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 9, letterSpacing: 2.5, color: GREY, fontWeight: '700' },
  tabTextActive: { color: WHITE },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  tabBorder: { height: 1, backgroundColor: GOLD + '14', marginHorizontal: 24, marginBottom: 4 },
  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '1A', backgroundColor: CARD_BG, padding: 16, gap: 14, overflow: 'hidden' },
  rewardLeftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  rewardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rewardLabel: { color: WHITE, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  rewardTag: { backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '44', paddingHorizontal: 7, paddingVertical: 2 },
  rewardTagText: { color: GOLD, fontSize: 6, fontWeight: '800', letterSpacing: 2 },
  rewardSub: { color: GREY, fontSize: 10, letterSpacing: 0.5 },
  rewardRight: { alignItems: 'flex-end', gap: 6 },
  rewardPts: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  redeemBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  redeemBtnText: { fontSize: 7, fontWeight: '800', letterSpacing: 2 },
  histCard: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 0, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  histLeft: { alignItems: 'center', marginRight: 16, paddingTop: 2 },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histLine: { width: 1, flex: 1, backgroundColor: GOLD + '22', marginTop: 4 },
  histTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  histRef: { color: GOLD, fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  histDate: { color: GREY, fontSize: 9, letterSpacing: 1 },
  histDesc: { color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  histPts: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5, marginLeft: 12, marginTop: 2 },
  histSummary: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG },
  histSummaryItem: { flex: 1, padding: 16, alignItems: 'center' },
  histSummaryLabel: { color: GREY, fontSize: 7, letterSpacing: 2, marginBottom: 6 },
  histSummaryVal: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  histSummaryDivider: { width: 1, backgroundColor: GOLD + '18', marginVertical: 12 },
  tierCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderWidth: 1, borderColor: GOLD + '14', backgroundColor: CARD_BG, padding: 16, gap: 14, overflow: 'hidden' },
  tierCardActive: { borderColor: GOLD + '44' },
  tierActiveBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: GOLD },
  tierColorDot: { width: 28, height: 28, borderRadius: 1 },
  tierName: { color: GREY, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  tierRange: { color: GREY, fontSize: 9, letterSpacing: 1 },
  tierCurrentBadge: { backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '66', paddingHorizontal: 10, paddingVertical: 4 },
  tierCurrentText: { color: GOLD, fontSize: 7, fontWeight: '800', letterSpacing: 2 },
  perksCard: { marginHorizontal: 24, borderWidth: 1, borderColor: GOLD + '18', backgroundColor: CARD_BG, padding: 20 },
  perksTopBar: { width: 24, height: 2, backgroundColor: GOLD, marginBottom: 16 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: GOLD + '0A' },
  perkCheck: { width: 22, height: 22, borderWidth: 1, borderColor: GREEN + '44', alignItems: 'center', justifyContent: 'center' },
  perkCheckText: { color: GREEN, fontSize: 10, fontWeight: '700' },
  perkText: { color: WHITE, fontSize: 12, letterSpacing: 0.3 },
  blackTeaser: { marginHorizontal: 24, marginTop: 8, borderWidth: 1, borderColor: '#444455', backgroundColor: '#09090E', padding: 24 },
  blackTeaserBar: { width: '100%', height: 2, backgroundColor: '#444455', marginBottom: 20 },
  blackTeaserEye: { color: GREY, fontSize: 8, letterSpacing: 4, marginBottom: 10 },
  blackTeaserTitle: { color: WHITE, fontSize: 22, fontWeight: '200', lineHeight: 30, marginBottom: 14 },
  blackTeaserBody: { color: GREY, fontSize: 12, lineHeight: 19, letterSpacing: 0.3, marginBottom: 20 },
  blackTeaserBtn: { borderWidth: 1, borderColor: '#444455', paddingVertical: 14, alignItems: 'center' },
  blackTeaserBtnText: { color: WHITE, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
});
 