import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Linking,
    Modal,
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
const CARD_BG = '#0E0E15';
const WHITE = '#FFFFFF';
const GREY = '#55556A';
const RED = '#D93025';
const RED_DIM = '#D9302514';
const GREEN = '#2ECC71';

// ─── Data ──────────────────────────────────────────────────────────────────

const EMERGENCY_SERVICES = [
  { label: 'POLICE', number: '999', country: 'Saudi Arabia', icon: 'P' },
  { label: 'AMBULANCE', number: '997', country: 'Saudi Arabia', icon: 'A' },
  { label: 'FIRE BRIGADE', number: '998', country: 'Saudi Arabia', icon: 'F' },
  { label: 'CIVIL DEFENCE', number: '911', country: 'Saudi Arabia', icon: 'C' },
];

const INTL_EMERGENCY: Record<string, { police: string; ambulance: string; fire: string }> = {
  'Saudi Arabia': { police: '999', ambulance: '997', fire: '998' },
  'UAE': { police: '999', ambulance: '998', fire: '997' },
  'UK': { police: '999', ambulance: '999', fire: '999' },
  'USA': { police: '911', ambulance: '911', fire: '911' },
  'Turkey': { police: '155', ambulance: '112', fire: '110' },
  'France': { police: '17', ambulance: '15', fire: '18' },
  'Thailand': { police: '191', ambulance: '1669', fire: '199' },
  'Malaysia': { police: '999', ambulance: '999', fire: '994' },
  'Singapore': { police: '999', ambulance: '995', fire: '995' },
  'Japan': { police: '110', ambulance: '119', fire: '119' },
  'Egypt': { police: '122', ambulance: '123', fire: '180' },
  'Azerbaijan': { police: '102', ambulance: '103', fire: '101' },
  'Maldives': { police: '119', ambulance: '102', fire: '118' },
  'Italy': { police: '113', ambulance: '118', fire: '115' },
  'Oman': { police: '999', ambulance: '999', fire: '999' },
};

const EMBASSIES = [
  { country: 'Saudi Arabia', city: 'Riyadh', phone: '+966-11-480-2200', flag: 'KSA' },
  { country: 'UAE', city: 'Abu Dhabi', phone: '+971-2-444-7800', flag: 'UAE' },
  { country: 'United Kingdom', city: 'London', phone: '+44-20-7664-9200', flag: 'UK' },
  { country: 'USA', city: 'Washington D.C.', phone: '+1-202-243-6500', flag: 'USA' },
  { country: 'Turkey', city: 'Ankara', phone: '+90-312-441-7550', flag: 'TUR' },
  { country: 'France', city: 'Paris', phone: '+33-1-4531-0020', flag: 'FRA' },
  { country: 'Thailand', city: 'Bangkok', phone: '+66-2-253-0288', flag: 'THA' },
  { country: 'Malaysia', city: 'Kuala Lumpur', phone: '+60-3-2170-2300', flag: 'MYS' },
  { country: 'Singapore', city: 'Singapore', phone: '+65-6737-6988', flag: 'SGP' },
  { country: 'Japan', city: 'Tokyo', phone: '+81-3-5421-7741', flag: 'JPN' },
  { country: 'Egypt', city: 'Cairo', phone: '+20-2-3761-0807', flag: 'EGY' },
  { country: 'Azerbaijan', city: 'Baku', phone: '+994-12-596-8393', flag: 'AZE' },
  { country: 'Italy', city: 'Rome', phone: '+39-06-852-8341', flag: 'ITA' },
  { country: 'Oman', city: 'Muscat', phone: '+968-2469-6301', flag: 'OMN' },
  { country: 'China', city: 'Beijing', phone: '+86-10-6532-2504', flag: 'CHN' },
];

const TIPS = [
  { label: 'STAY CALM', body: 'Take a deep breath. Assess the situation before acting.' },
  { label: 'STAY PUT', body: 'Unless in danger, remain at your location for easier location by emergency services.' },
  { label: 'NOTIFY SOMEONE', body: 'Always inform a trusted contact of your location and situation.' },
  { label: 'CONSERVE BATTERY', body: 'Reduce screen brightness and close apps to prolong phone life.' },
  { label: 'EMBASSY FIRST', body: 'In legal trouble abroad, contact the Pakistani Embassy before signing anything.' },
];

const COUNTRIES = Object.keys(INTL_EMERGENCY);

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionTag({ text }: { text: string }) {
  return <Text style={s.sectionTag}>{text}</Text>;
}

function CallButton({ number, label }: { number: string; label: string }) {
  return (
    <TouchableOpacity
      style={s.callBtn}
      onPress={() => Linking.openURL(`tel:${number}`)}
      activeOpacity={0.75}
    >
      <Text style={s.callBtnLabel}>{label}</Text>
      <Text style={s.callBtnNum}>{number}</Text>
      <View style={s.callBtnIcon}>
        <Text style={s.callBtnIconText}>CALL</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function SOSEmergencyScreen({ onBack }: { onBack: () => void }) {
  const [selectedCountry, setSelectedCountry] = useState('Saudi Arabia');
  const [countryModal, setCountryModal] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [embassyFilter, setEmbassyFilter] = useState('');
  const [activeSection, setActiveSection] = useState<'services' | 'embassy' | 'tips'>('services');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sosScale = useRef(new Animated.Value(1)).current;
  const sosGlow = useRef(new Animated.Value(0)).current;
  const sosRing1 = useRef(new Animated.Value(1)).current;
  const sosRing2 = useRef(new Animated.Value(1)).current;
  const sosRing1Opacity = useRef(new Animated.Value(0.6)).current;
  const sosRing2Opacity = useRef(new Animated.Value(0.3)).current;
  const alertAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    startSOSPulse();
  }, []);

  const startSOSPulse = () => {
    // Ring 1
    Animated.loop(
      Animated.parallel([
        Animated.timing(sosRing1, { toValue: 1.8, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sosRing1Opacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    // Ring 2 — delayed
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(sosRing2, { toValue: 1.8, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(sosRing2Opacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }, 600);
    // Core glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosGlow, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(sosGlow, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  };

  const handleSOSPress = () => {
    // Burst animation
    Animated.sequence([
      Animated.timing(sosScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.spring(sosScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    setAlertSent(true);
    Animated.timing(alertAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(alertAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setAlertSent(false));
    }, 3500);
  };

  const sosGlowColor = sosGlow.interpolate({ inputRange: [0, 1], outputRange: ['#D9302500', '#D9302544'] });
  const emergencyData = INTL_EMERGENCY[selectedCountry];

  const filteredEmbassies = EMBASSIES.filter(e =>
    e.country.toLowerCase().includes(embassyFilter.toLowerCase()) ||
    e.city.toLowerCase().includes(embassyFilter.toLowerCase())
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>SOS EMERGENCY</Text>
          <Text style={s.headerSub}>EMERGENCY ASSISTANCE</Text>
        </View>
        <View style={s.liveIndicator}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </Animated.View>
      <View style={s.redLineHard} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── SOS HERO ── */}
        <Animated.View style={[s.sosHero, { opacity: fadeAnim }]}>

          {/* Alert Toast */}
          {alertSent && (
            <Animated.View style={[s.alertToast, { opacity: alertAnim }]}>
              <View style={s.alertToastDot} />
              <Text style={s.alertToastText}>DISTRESS SIGNAL SENT — STAY CALM</Text>
            </Animated.View>
          )}

          {/* Pulsing rings + SOS button */}
          <View style={s.sosContainer}>
            <Animated.View style={[s.sosRing, { transform: [{ scale: sosRing1 }], opacity: sosRing1Opacity }]} />
            <Animated.View style={[s.sosRing, s.sosRing2Base, { transform: [{ scale: sosRing2 }], opacity: sosRing2Opacity }]} />
            <Animated.View style={[s.sosGlowLayer, { backgroundColor: sosGlowColor }]} />
            <Animated.View style={{ transform: [{ scale: sosScale }] }}>
              <TouchableOpacity style={s.sosBtn} onPress={handleSOSPress} activeOpacity={0.85}>
                <View style={s.sosBtnInner}>
                  <Text style={s.sosBtnText}>SOS</Text>
                  <Text style={s.sosBtnSub}>PRESS TO ALERT</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={s.sosHeroLabel}>EMERGENCY ACTIVATION</Text>
          <Text style={s.sosHeroBody}>
            Press the SOS button to send a distress signal with your current location to your emergency contacts.
          </Text>

          {/* Quick Actions */}
          <View style={s.quickActions}>
            <TouchableOpacity
              style={[s.quickBtn, { borderColor: RED }]}
              onPress={() => Linking.openURL('tel:999')}
              activeOpacity={0.8}
            >
              <View style={[s.quickBtnDot, { backgroundColor: RED }]} />
              <Text style={[s.quickBtnText, { color: RED }]}>CALL 999</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickBtn, { borderColor: GOLD }]}
              onPress={() => Linking.openURL('sms:999')}
              activeOpacity={0.8}
            >
              <View style={[s.quickBtnDot, { backgroundColor: GOLD }]} />
              <Text style={[s.quickBtnText, { color: GOLD }]}>SEND SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickBtn, { borderColor: GREEN }]}
              onPress={() => Linking.openURL('https://wa.me/')}
              activeOpacity={0.8}
            >
              <View style={[s.quickBtnDot, { backgroundColor: GREEN }]} />
              <Text style={[s.quickBtnText, { color: GREEN }]}>WHATSAPP</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SECTION NAV ── */}
        <Animated.View style={[{ opacity: fadeAnim }, s.sectionNav]}>
          {(['services', 'embassy', 'tips'] as const).map(sec => (
            <TouchableOpacity
              key={sec}
              style={[s.sectionNavItem, activeSection === sec && s.sectionNavItemActive]}
              onPress={() => setActiveSection(sec)}
              activeOpacity={0.8}
            >
              <Text style={[s.sectionNavText, activeSection === sec && s.sectionNavTextActive]}>
                {sec === 'services' ? 'EMERGENCY' : sec === 'embassy' ? 'EMBASSIES' : 'SAFETY TIPS'}
              </Text>
              {activeSection === sec && <View style={s.sectionNavUnderline} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
        <View style={s.sectionNavBorder} />

        {/* ── EMERGENCY SERVICES ── */}
        {activeSection === 'services' && (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Country Selector */}
            <View style={s.countrySelector}>
              <Text style={s.countrySelectorLabel}>SELECTED COUNTRY</Text>
              <TouchableOpacity
                style={s.countrySelectorBtn}
                onPress={() => setCountryModal(true)}
                activeOpacity={0.8}
              >
                <Text style={s.countrySelectorValue}>{selectedCountry}</Text>
                <Text style={s.countrySelectorArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Emergency Tiles */}
            <SectionTag text="— EMERGENCY NUMBERS" />
            <View style={s.emergencyGrid}>
              {[
                { type: 'POLICE', num: emergencyData?.police ?? '999', color: '#4A90D9' },
                { type: 'AMBULANCE', num: emergencyData?.ambulance ?? '997', color: RED },
                { type: 'FIRE BRIGADE', num: emergencyData?.fire ?? '998', color: '#FF6B35' },
                { type: 'TOURIST POLICE', num: '920', color: GOLD },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.emergencyTile, { borderColor: item.color + '44' }]}
                  onPress={() => Linking.openURL(`tel:${item.num}`)}
                  activeOpacity={0.8}
                >
                  <View style={[s.emergencyTileBar, { backgroundColor: item.color }]} />
                  <Text style={s.emergencyTileType}>{item.type}</Text>
                  <Text style={[s.emergencyTileNum, { color: item.color }]}>{item.num}</Text>
                  <Text style={s.emergencyTileAction}>TAP TO CALL</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pakistan Emergency */}
            <SectionTag text="— PAKISTAN EMERGENCY (HOME)" />
            <View style={s.pkEmergencyCard}>
              <View style={s.pkEmergencyBadge}>
                <Text style={s.pkBadgeText}>PAK</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.pkEmergencyTitle}>Pakistan Emergency Lines</Text>
                <Text style={s.pkEmergencyBody}>For family contact or Pakistan-based assistance</Text>
              </View>
            </View>
            <View style={s.pkLinesRow}>
              {[
                { label: 'RESCUE', num: '1122' },
                { label: 'EDHI', num: '115' },
                { label: 'POLICE', num: '15' },
                { label: 'FIRE', num: '16' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.pkLineItem}
                  onPress={() => Linking.openURL(`tel:${item.num}`)}
                  activeOpacity={0.8}
                >
                  <Text style={s.pkLineLabel}>{item.label}</Text>
                  <Text style={s.pkLineNum}>{item.num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Medical Info Card */}
            <SectionTag text="— YOUR MEDICAL INFO" />
            <View style={s.medCard}>
              <View style={s.medCardTopBar} />
              <Text style={s.medCardEyebrow}>MEDICAL IDENTIFICATION</Text>
              <Text style={s.medCardTitle}>Show this card to{'\n'}emergency responders</Text>
              <View style={s.medCardDivider} />
              <View style={s.medGrid}>
                {[
                  { label: 'BLOOD TYPE', value: 'O+' },
                  { label: 'NATIONALITY', value: 'Pakistani' },
                  { label: 'LANGUAGE', value: 'Urdu / English' },
                  { label: 'ALLERGIES', value: 'None Known' },
                ].map((item, i) => (
                  <View key={i} style={s.medItem}>
                    <Text style={s.medItemLabel}>{item.label}</Text>
                    <Text style={s.medItemValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <View style={s.medCardDivider} />
              <Text style={s.medCardNote}>
                In case of emergency, contact the nearest Pakistani Embassy. Carry this information at all times.
              </Text>
            </View>

          </Animated.View>
        )}

        {/* ── EMBASSY ── */}
        {activeSection === 'embassy' && (
          <Animated.View style={{ opacity: fadeAnim, paddingTop: 8 }}>
            <View style={s.embassySearchWrap}>
              <View style={s.embassySearchPulse} />
              <TextInput
                style={s.embassySearchInput}
                placeholder="Search country or city..."
                placeholderTextColor={GREY}
                value={embassyFilter}
                onChangeText={setEmbassyFilter}
              />
              {embassyFilter.length > 0 && (
                <TouchableOpacity onPress={() => setEmbassyFilter('')} style={{ padding: 8 }}>
                  <Text style={{ color: GREY, fontSize: 11 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <SectionTag text={`— PAKISTANI EMBASSIES (${filteredEmbassies.length})`} />

            {filteredEmbassies.map((emb, i) => (
              <View key={i} style={s.embassyCard}>
                <View style={s.embassyFlagBadge}>
                  <Text style={s.embassyFlagText}>{emb.flag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.embassyCountry}>{emb.country}</Text>
                  <Text style={s.embassyCity}>{emb.city}</Text>
                </View>
                <TouchableOpacity
                  style={s.embassyCallBtn}
                  onPress={() => Linking.openURL(`tel:${emb.phone}`)}
                  activeOpacity={0.8}
                >
                  <Text style={s.embassyCallBtnText}>CALL</Text>
                </TouchableOpacity>
              </View>
            ))}

            {filteredEmbassies.length === 0 && (
              <View style={s.noResultPanel}>
                <View style={s.noResultAccent} />
                <Text style={s.noResultText}>NO EMBASSY FOUND FOR THIS SEARCH</Text>
                <TouchableOpacity onPress={() => setEmbassyFilter('')}>
                  <Text style={s.noResultClear}>CLEAR SEARCH →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Ministry note */}
            <View style={s.ministryNote}>
              <View style={s.ministryNoteDot} />
              <Text style={s.ministryNoteText}>
                For updated embassy contact details, visit the Ministry of Foreign Affairs Pakistan portal at mofa.gov.pk
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── SAFETY TIPS ── */}
        {activeSection === 'tips' && (
          <Animated.View style={{ opacity: fadeAnim, paddingTop: 8 }}>
            <SectionTag text="— EMERGENCY PROTOCOLS" />

            {TIPS.map((tip, i) => (
              <View key={i} style={s.tipCard}>
                <View style={s.tipCardLeft}>
                  <Text style={s.tipCardIndex}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={s.tipCardLineVert} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.tipCardLabel}>{tip.label}</Text>
                  <Text style={s.tipCardBody}>{tip.body}</Text>
                </View>
              </View>
            ))}

            {/* Distress Kit */}
            <SectionTag text="— EMERGENCY KIT CHECKLIST" />
            <View style={s.kitCard}>
              <View style={s.kitCardTopBar} />
              {[
                'Valid passport + 2 photocopies',
                'Travel insurance policy document',
                'Embassy contact numbers (saved offline)',
                'Hotel address in local language',
                'Emergency cash (USD 200 minimum)',
                'Basic medications + prescription',
                'Blood group card',
                'Local SIM card with data',
              ].map((item, i) => (
                <View key={i} style={s.kitRow}>
                  <View style={s.kitDot} />
                  <Text style={s.kitText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* LUXORA Support */}
            <View style={s.luxoraSupportCard}>
              <View style={s.luxoraSupportBar} />
              <Text style={s.luxoraSupportEyebrow}>— 24/7 CONCIERGE SUPPORT</Text>
              <Text style={s.luxoraSupportTitle}>LUXORA Emergency{'\n'}Concierge Line</Text>
              <Text style={s.luxoraSupportBody}>
                Our dedicated concierge team is available around the clock to assist with rebooking, embassy coordination, and on-ground emergency support.
              </Text>
              <TouchableOpacity
                style={s.luxoraSupportBtn}
                onPress={() => Linking.openURL('tel:+923001234567')}
                activeOpacity={0.8}
              >
                <Text style={s.luxoraSupportBtnText}>CALL LUXORA CONCIERGE</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

      </ScrollView>

      {/* Country Modal */}
      <Modal visible={countryModal} transparent animationType="fade">
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setCountryModal(false)}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>SELECT COUNTRY</Text>
            <View style={s.modalDivider} />
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {COUNTRIES.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.modalOption, selectedCountry === c && s.modalOptionActive]}
                  onPress={() => { setSelectedCountry(c); setCountryModal(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[s.modalOptionText, selectedCountry === c && { color: GOLD }]}>{c}</Text>
                  {selectedCountry === c && <Text style={s.modalCheckmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 24, paddingBottom: 18 },
  backBtn: { width: 38, height: 38, borderWidth: 1, borderColor: '#D9302533', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  backArrow: { color: RED, fontSize: 18 },
  headerTitle: { color: WHITE, fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  headerSub: { color: RED, fontSize: 8, letterSpacing: 4, marginTop: 3 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: RED + '44', paddingHorizontal: 10, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, backgroundColor: RED, borderRadius: 3 },
  liveText: { color: RED, fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  redLineHard: { height: 1, backgroundColor: RED, marginHorizontal: 24, opacity: 0.5 },

  // SOS Hero
  sosHero: { alignItems: 'center', paddingTop: 36, paddingHorizontal: 24, paddingBottom: 28 },
  alertToast: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: RED, paddingVertical: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 10,
  },
  alertToastDot: { width: 8, height: 8, backgroundColor: WHITE, borderRadius: 4 },
  alertToastText: { color: WHITE, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  sosContainer: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  sosRing: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderColor: RED,
  },
  sosRing2Base: { borderColor: RED + '88' },
  sosGlowLayer: { position: 'absolute', width: 160, height: 160, borderRadius: 80 },
  sosBtn: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: RED, borderWidth: 3, borderColor: '#FF2222',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: RED, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 20,
  },
  sosBtnInner: { alignItems: 'center' },
  sosBtnText: { color: WHITE, fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  sosBtnSub: { color: WHITE + 'CC', fontSize: 7, letterSpacing: 2, fontWeight: '700', marginTop: 4 },
  sosHeroLabel: { fontSize: 9, letterSpacing: 4, color: RED, fontWeight: '700', marginBottom: 10 },
  sosHeroBody: { fontSize: 12, color: GREY, lineHeight: 19, textAlign: 'center', letterSpacing: 0.3 },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 22, width: '100%' },
  quickBtn: { flex: 1, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 6 },
  quickBtnDot: { width: 5, height: 5, borderRadius: 3 },
  quickBtnText: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },

  // Section Nav
  sectionNav: { flexDirection: 'row', marginHorizontal: 24, marginTop: 4 },
  sectionNavItem: { flex: 1, paddingVertical: 13, alignItems: 'center', position: 'relative' },
  sectionNavItemActive: {},
  sectionNavText: { fontSize: 9, letterSpacing: 2.5, color: GREY, fontWeight: '700' },
  sectionNavTextActive: { color: WHITE },
  sectionNavUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: RED },
  sectionNavBorder: { height: 1, backgroundColor: '#D9302514', marginHorizontal: 24, marginBottom: 4 },

  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },

  // Country Selector
  countrySelector: { marginHorizontal: 24, marginTop: 16 },
  countrySelectorLabel: { fontSize: 8, letterSpacing: 3, color: GREY, fontWeight: '700', marginBottom: 8 },
  countrySelectorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#C9A84C33', backgroundColor: CARD_BG,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  countrySelectorValue: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  countrySelectorArrow: { color: GOLD, fontSize: 10 },

  // Emergency Grid
  emergencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24, marginBottom: 8 },
  emergencyTile: {
    width: (width - 56) / 2, borderWidth: 1,
    backgroundColor: CARD_BG, padding: 18, position: 'relative', overflow: 'hidden',
  },
  emergencyTileBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  emergencyTileType: { fontSize: 8, letterSpacing: 3, color: GREY, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  emergencyTileNum: { fontSize: 28, fontWeight: '200', letterSpacing: -1, marginBottom: 8 },
  emergencyTileAction: { fontSize: 8, color: GREY, letterSpacing: 2 },

  // Pakistan lines
  pkEmergencyCard: {
    marginHorizontal: 24, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG,
    padding: 16, marginBottom: 8, gap: 14,
  },
  pkEmergencyBadge: { width: 44, height: 44, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#C9A84C33', alignItems: 'center', justifyContent: 'center' },
  pkBadgeText: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  pkEmergencyTitle: { color: WHITE, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  pkEmergencyBody: { color: GREY, fontSize: 10, letterSpacing: 0.5, marginTop: 3 },
  pkLinesRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24 },
  pkLineItem: { flex: 1, borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 14, alignItems: 'center' },
  pkLineLabel: { fontSize: 8, letterSpacing: 2, color: GREY, fontWeight: '700', marginBottom: 8 },
  pkLineNum: { fontSize: 22, color: GOLD, fontWeight: '200', letterSpacing: 1 },

  // Medical Card
  medCard: {
    marginHorizontal: 24, borderWidth: 1, borderColor: '#C9A84C22',
    backgroundColor: CARD_BG, padding: 22,
  },
  medCardTopBar: { width: '100%', height: 2, backgroundColor: RED, marginBottom: 18, opacity: 0.7 },
  medCardEyebrow: { fontSize: 8, letterSpacing: 4, color: RED, fontWeight: '700', marginBottom: 8 },
  medCardTitle: { fontSize: 18, fontWeight: '200', color: WHITE, lineHeight: 26, marginBottom: 18 },
  medCardDivider: { height: 1, backgroundColor: '#C9A84C14', marginVertical: 16 },
  medGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  medItem: { width: '50%', paddingVertical: 10, paddingRight: 12 },
  medItemLabel: { fontSize: 8, letterSpacing: 2.5, color: GREY, fontWeight: '700', marginBottom: 6 },
  medItemValue: { fontSize: 13, color: WHITE, fontWeight: '600', letterSpacing: 0.5 },
  medCardNote: { fontSize: 10, color: GREY, lineHeight: 17, letterSpacing: 0.3 },

  // Embassy
  embassySearchWrap: {
    marginHorizontal: 24, marginTop: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#C9A84C33', backgroundColor: CARD_BG, paddingHorizontal: 14,
  },
  embassySearchPulse: { width: 4, height: 14, backgroundColor: GOLD, marginRight: 12, opacity: 0.6 },
  embassySearchInput: { flex: 1, color: WHITE, fontSize: 13, paddingVertical: 13, letterSpacing: 0.5 },
  embassyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 24, marginBottom: 8,
    borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 16,
  },
  embassyFlagBadge: { width: 44, height: 44, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#C9A84C22', alignItems: 'center', justifyContent: 'center' },
  embassyFlagText: { color: GOLD, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  embassyCountry: { color: WHITE, fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  embassyCity: { color: GREY, fontSize: 9, letterSpacing: 1.5 },
  embassyCallBtn: { backgroundColor: RED, paddingHorizontal: 14, paddingVertical: 10 },
  embassyCallBtnText: { color: WHITE, fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  noResultPanel: { marginHorizontal: 24, borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, padding: 24 },
  noResultAccent: { width: 24, height: 2, backgroundColor: GOLD, marginBottom: 14 },
  noResultText: { color: GREY, fontSize: 11, letterSpacing: 1.5, marginBottom: 14 },
  noResultClear: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  ministryNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 24, marginTop: 16, padding: 16, borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG },
  ministryNoteDot: { width: 4, height: 4, backgroundColor: GOLD, marginTop: 5 },
  ministryNoteText: { flex: 1, color: GREY, fontSize: 11, lineHeight: 18, letterSpacing: 0.3 },

  // Tips
  tipCard: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 8,
    borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 18,
  },
  tipCardLeft: { alignItems: 'center', marginRight: 16, paddingTop: 2 },
  tipCardIndex: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1, opacity: 0.7, marginBottom: 8 },
  tipCardLineVert: { width: 1, flex: 1, backgroundColor: '#C9A84C22' },
  tipCardLabel: { fontSize: 9, letterSpacing: 3, color: RED, fontWeight: '800', marginBottom: 8 },
  tipCardBody: { color: GREY, fontSize: 12, lineHeight: 19, letterSpacing: 0.3 },

  // Kit
  kitCard: { marginHorizontal: 24, borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 20, marginBottom: 8 },
  kitCardTopBar: { width: 24, height: 2, backgroundColor: GOLD, marginBottom: 16 },
  kitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#C9A84C0A' },
  kitDot: { width: 4, height: 4, backgroundColor: GOLD, marginTop: 6 },
  kitText: { flex: 1, color: WHITE, fontSize: 12, lineHeight: 20, letterSpacing: 0.3 },

  // LUXORA Support
  luxoraSupportCard: { marginHorizontal: 24, marginTop: 8, borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, padding: 24 },
  luxoraSupportBar: { width: '100%', height: 2, backgroundColor: GOLD, marginBottom: 20 },
  luxoraSupportEyebrow: { fontSize: 8, letterSpacing: 4, color: GOLD, fontWeight: '700', marginBottom: 10 },
  luxoraSupportTitle: { fontSize: 22, fontWeight: '200', color: WHITE, lineHeight: 30, marginBottom: 14 },
  luxoraSupportBody: { color: GREY, fontSize: 12, lineHeight: 19, letterSpacing: 0.3, marginBottom: 20 },
  luxoraSupportBtn: { backgroundColor: RED, paddingVertical: 15, alignItems: 'center' },
  luxoraSupportBtnText: { color: WHITE, fontSize: 9, fontWeight: '800', letterSpacing: 3 },

  callBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#D9302522', backgroundColor: CARD_BG,
    marginHorizontal: 24, marginBottom: 8, padding: 16,
  },
  callBtnLabel: { flex: 1, fontSize: 8, letterSpacing: 3, color: GREY, fontWeight: '700' },
  callBtnNum: { color: RED, fontSize: 20, fontWeight: '300', marginRight: 16 },
  callBtnIcon: { borderWidth: 1, borderColor: RED, paddingHorizontal: 12, paddingVertical: 7 },
  callBtnIconText: { color: RED, fontSize: 8, fontWeight: '800', letterSpacing: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: CARD_BG, borderTopWidth: 1, borderTopColor: '#C9A84C22', paddingBottom: 32, paddingTop: 16 },
  modalHandle: { width: 40, height: 3, backgroundColor: GREY, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: WHITE, fontSize: 11, fontWeight: '700', letterSpacing: 3, paddingHorizontal: 24, marginBottom: 16 },
  modalDivider: { height: 1, backgroundColor: '#C9A84C14', marginHorizontal: 24, marginBottom: 8 },
  modalOption: { paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#C9A84C08' },
  modalOptionActive: { backgroundColor: '#C9A84C08' },
  modalOptionText: { color: WHITE, fontSize: 13, letterSpacing: 0.5 },
  modalCheckmark: { color: GOLD, fontSize: 14, fontWeight: '700' },
});