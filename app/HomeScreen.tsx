import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
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
const CARD_BG = '#0E0E15';
const WHITE = '#FFFFFF';
const GREY = '#55556A';
const GOLD_DIM = '#C9A84C18';
 
const DESTINATIONS = [
  { id: '1', tag: 'TRENDING', city: 'Riyadh', sub: 'Kingdom of Saudi Arabia', price: 'From $299' },
  { id: '2', tag: 'EXCLUSIVE', city: 'Dubai', sub: 'United Arab Emirates', price: 'From $499' },
  { id: '3', tag: 'LUXURY', city: 'Maldives', sub: 'Indian Ocean', price: 'From $899' },
  { id: '4', tag: 'ELITE', city: 'Paris', sub: 'France', price: 'From $699' },
];
 
const SERVICES = [
  { id: '1',  label: 'FLIGHTS',       sub: 'Global Destinations',  dest: 'flights' },
  { id: '2',  label: 'HOTELS',        sub: 'Luxury Stays',         dest: 'hotels' },
  { id: '3',  label: 'DINING',        sub: 'Fine Restaurants',     dest: 'dining' },
  { id: '4',  label: 'TRANSPORT',     sub: 'Private Transfers',    dest: 'transport' },
  { id: '5',  label: 'TOURS',         sub: 'Experiences',          dest: 'tours' },
  { id: '6',  label: 'AI PLANNER',    sub: 'Smart Itinerary',      dest: 'aiPlanner' },
  { id: '7',  label: 'WEATHER & VISA',sub: 'Travel Intelligence',  dest: 'weatherVisa' },
  { id: '8',  label: 'SHOP',          sub: 'Luxury Collection',    dest: 'products' },
  { id: '9',  label: 'CORPORATE',     sub: 'Business Travel',      dest: 'corporate' },
  { id: '10', label: 'GROUP TRIPS',   sub: 'Plan Together',        dest: 'groupPlanner' },
];
 
type NavDest =
  | 'flights' | 'hotels' | 'dining' | 'transport' | 'tours'
  | 'aiPlanner' | 'weatherVisa' | 'sos' | 'corporate'
  | 'groupPlanner' | 'rewards' | 'profile' | 'products';
 
interface Props {
  onNavigate?: (dest: NavDest) => void;
  userName?: string;
}
 
export default function HomeScreen({ onNavigate }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]).start();
  }, []);
 
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
 
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.headerTag}>— WELCOME BACK</Text>
            <Text style={styles.headerName}>Hannan Khawaja</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => onNavigate?.('profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>HK</Text>
          </TouchableOpacity>
        </Animated.View>
 
        <View style={styles.goldLine} />
 
        {/* HERO */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.heroTag}>— LUXORA</Text>
          <Text style={styles.heroTitle}>
            You Deserve{'\n'}
            <Text style={styles.heroGold}>Only The Best.</Text>
          </Text>
          <Text style={styles.heroSub}>Curated travel for the elite · Saudi Arabia & Beyond</Text>
 
          <TouchableOpacity
            style={styles.searchBox}
            onPress={() => onNavigate?.('flights')}
          >
            <View style={styles.searchLeft}>
              <Text style={styles.searchLabel}>DESTINATION</Text>
              <Text style={styles.searchVal}>Where do you wish to go?</Text>
            </View>
            <View style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>SEARCH →</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
 
        <View style={styles.goldLineDim} />
 
        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.secTag}>— SERVICES</Text>
          <Text style={styles.secTitle}>What Can We{'\n'}Arrange For You?</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.srvCard,
                  (
                    item.dest === 'weatherVisa' ||
                    item.dest === 'products'     ||
                    item.dest === 'corporate'    ||
                    item.dest === 'groupPlanner'
                  ) && styles.srvCardWide,
                ]}
                onPress={() => onNavigate?.(item.dest as NavDest)}
                activeOpacity={0.8}
              >
                <View style={styles.srvLine} />
                <Text style={styles.srvName}>{item.label}</Text>
                <Text style={styles.srvSub}>{item.sub}</Text>
                <Text style={styles.srvArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
 
        <View style={[styles.goldLineDim, { marginTop: 28 }]} />
 
        {/* DESTINATIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.secTag}>— DESTINATIONS</Text>
              <Text style={styles.secTitle}>Handpicked For{'\n'}Elite Travelers</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>VIEW ALL{'\n'}→</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destRow}>
            {DESTINATIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.destCard}
                onPress={() => onNavigate?.('hotels')}
                activeOpacity={0.8}
              >
                <View style={styles.destTopBar} />
                <View style={styles.destTagRow}>
                  <Text style={styles.destTag}>{item.tag}</Text>
                </View>
                <View style={styles.destBody}>
                  <Text style={styles.destCity}>{item.city}</Text>
                  <Text style={styles.destCountry}>{item.sub}</Text>
                  <View style={styles.destDivider} />
                  <Text style={styles.destPrice}>{item.price}</Text>
                  <TouchableOpacity
                    style={styles.destBtn}
                    onPress={() => onNavigate?.('hotels')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.destBtnText}>EXPLORE →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
 
        {/* REWARDS */}
        <TouchableOpacity
          style={styles.rewards}
          onPress={() => onNavigate?.('rewards')}
          activeOpacity={0.8}
        >
          <View style={styles.rewLine} />
          <Text style={styles.rewTag}>— HK REWARDS</Text>
          <Text style={styles.rewTitle}>Your Loyalty Points</Text>
          <Text style={styles.rewPoints}>2,450</Text>
          <Text style={styles.rewSub}>Valid across Saudi Arabia · Pakistan · International</Text>
          <View style={styles.rewBtn}>
            <Text style={styles.rewBtnText}>REDEEM NOW →</Text>
          </View>
        </TouchableOpacity>
 
        {/* SOS */}
        <TouchableOpacity
          style={styles.sos}
          onPress={() => onNavigate?.('sos')}
          activeOpacity={0.8}
        >
          <View style={styles.sosDot} />
          <View style={styles.sosInfo}>
            <Text style={styles.sosTitle}>SOS EMERGENCY</Text>
            <Text style={styles.sosSub}>24/7 Assistance · Tap to activate</Text>
          </View>
          <Text style={styles.sosArrow}>→</Text>
        </TouchableOpacity>
 
        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.goldLineDim} />
          <Text style={styles.footBrand}>L · U · X · O · R · A</Text>
          <Text style={styles.footSub}>EXCLUSIVE TRAVEL · SAUDI ARABIA</Text>
        </View>
 
      </ScrollView>
 
      {/* BOTTOM NAV — AI barkarar, SHOP add kiya */}
      <View style={styles.bottomNav}>
        {[
          { label: 'HOME',    active: true,  dest: null },
          { label: 'FLIGHTS', active: false, dest: 'flights' },
          { label: 'HOTELS',  active: false, dest: 'hotels' },
          { label: 'AI',      active: false, dest: 'aiPlanner' },
          { label: 'SHOP',    active: false, dest: 'products' },
          { label: 'PROFILE', active: false, dest: 'profile' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navTab}
            onPress={() => tab.dest && onNavigate?.(tab.dest as NavDest)}
            activeOpacity={0.7}
          >
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>
              {tab.label}
            </Text>
            {tab.active && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 100 },
 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTag: { fontSize: 9, letterSpacing: 5, color: GOLD, marginBottom: 5 },
  headerName: { fontSize: 24, fontWeight: '200', color: WHITE, letterSpacing: 2 },
  avatar: { width: 42, height: 42, borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', backgroundColor: GOLD_DIM },
  avatarText: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: GOLD },
 
  goldLine: { height: 1, backgroundColor: GOLD, marginHorizontal: 24, opacity: 0.45 },
  goldLineDim: { height: 1, backgroundColor: GOLD, marginHorizontal: 24, opacity: 0.1 },
 
  hero: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 28 },
  heroTag: { fontSize: 9, letterSpacing: 5, color: GOLD, marginBottom: 10 },
  heroTitle: { fontSize: 34, fontWeight: '200', color: WHITE, lineHeight: 42, marginBottom: 10 },
  heroGold: { color: GOLD },
  heroSub: { fontSize: 10, letterSpacing: 2, color: GREY, lineHeight: 18, marginBottom: 22 },
  searchBox: { borderWidth: 1, borderColor: '#C9A84C33', backgroundColor: CARD_BG, flexDirection: 'row', alignItems: 'stretch' },
  searchLeft: { flex: 1, padding: 14 },
  searchLabel: { fontSize: 8, letterSpacing: 4, color: GOLD, marginBottom: 4 },
  searchVal: { fontSize: 11, color: GREY, letterSpacing: 1 },
  searchBtn: { backgroundColor: GOLD, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { fontSize: 8, fontWeight: '700', letterSpacing: 2, color: BG },
 
  section: { paddingHorizontal: 24, paddingTop: 28 },
  secTag: { fontSize: 9, letterSpacing: 5, color: GOLD, marginBottom: 8 },
  secTitle: { fontSize: 24, fontWeight: '200', color: WHITE, lineHeight: 32, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  seeAll: { fontSize: 9, letterSpacing: 3, color: GOLD, textAlign: 'right', lineHeight: 18 },
 
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  srvCard: { width: (width - 56) / 2, borderWidth: 1, borderColor: '#C9A84C18', backgroundColor: CARD_BG, padding: 16 },
  srvCardWide: { width: width - 48 },
  srvLine: { width: 18, height: 1, backgroundColor: GOLD, marginBottom: 12 },
  srvName: { fontSize: 11, letterSpacing: 3, color: WHITE, marginBottom: 3 },
  srvSub: { fontSize: 9, letterSpacing: 1, color: GREY },
  srvArrow: { fontSize: 12, color: GOLD, marginTop: 12 },
 
  destRow: { gap: 12, paddingBottom: 4 },
  destCard: { width: 170, borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG },
  destTopBar: { height: 2, backgroundColor: GOLD },
  destTagRow: { padding: 12, paddingBottom: 0 },
  destTag: { fontSize: 8, letterSpacing: 3, color: GOLD },
  destBody: { padding: 12 },
  destCity: { fontSize: 22, fontWeight: '200', color: WHITE, letterSpacing: 1 },
  destCountry: { fontSize: 9, letterSpacing: 2, color: GREY, marginTop: 2 },
  destDivider: { height: 1, backgroundColor: '#C9A84C18', marginVertical: 10 },
  destPrice: { fontSize: 10, letterSpacing: 2, color: GOLD, fontWeight: '600' },
  destBtn: { borderWidth: 1, borderColor: '#C9A84C33', padding: 8, alignItems: 'center', marginTop: 10 },
  destBtnText: { fontSize: 8, letterSpacing: 3, color: GOLD },
 
  rewards: { marginHorizontal: 24, marginTop: 28, borderWidth: 1, borderColor: GOLD, backgroundColor: '#0C0B06', padding: 22 },
  rewLine: { width: 24, height: 1, backgroundColor: GOLD, marginBottom: 14 },
  rewTag: { fontSize: 9, letterSpacing: 4, color: GOLD, marginBottom: 6 },
  rewTitle: { fontSize: 20, fontWeight: '200', color: WHITE, letterSpacing: 1 },
  rewPoints: { fontSize: 52, fontWeight: '100', color: GOLD, letterSpacing: 4, marginTop: 6, marginBottom: 6 },
  rewSub: { fontSize: 9, letterSpacing: 1, color: GREY, lineHeight: 16 },
  rewBtn: { borderWidth: 1, borderColor: GOLD, padding: 12, alignItems: 'center', marginTop: 16 },
  rewBtnText: { fontSize: 9, letterSpacing: 4, color: GOLD },
 
  sos: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginTop: 12, borderWidth: 1, borderColor: '#AA222233', backgroundColor: '#0F0808', padding: 16, gap: 12 },
  sosDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CC3333' },
  sosInfo: { flex: 1 },
  sosTitle: { fontSize: 10, letterSpacing: 3, color: '#CC4444' },
  sosSub: { fontSize: 9, letterSpacing: 1, color: GREY, marginTop: 2 },
  sosArrow: { fontSize: 14, color: '#CC4444' },
 
  footer: { alignItems: 'center', paddingTop: 36, paddingBottom: 20, gap: 10 },
  footBrand: { fontSize: 10, letterSpacing: 8, color: GOLD, fontWeight: '200' },
  footSub: { fontSize: 8, letterSpacing: 3, color: GREY },
 
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: '#08080F', borderTopWidth: 1, borderTopColor: '#C9A84C18', flexDirection: 'row', alignItems: 'center' },
  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navLabel: { fontSize: 7, letterSpacing: 1.5, color: GREY },
  navLabelActive: { color: GOLD },
  navDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: GOLD },
});
 