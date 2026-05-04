import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

export interface FlightSearchParams {
  tripType: 'oneWay' | 'roundTrip';
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: string;
  cabin: string;
}

interface Props {
  onBack: () => void;
  onSearch: (params: FlightSearchParams) => void;
}

const AIRPORTS = [
  { city: 'Riyadh', code: 'RUH', country: 'Saudi Arabia' },
  { city: 'Jeddah', code: 'JED', country: 'Saudi Arabia' },
  { city: 'Medina', code: 'MED', country: 'Saudi Arabia' },
  { city: 'Dammam', code: 'DMM', country: 'Saudi Arabia' },
  { city: 'Dubai', code: 'DXB', country: 'UAE' },
  { city: 'Abu Dhabi', code: 'AUH', country: 'UAE' },
  { city: 'Doha', code: 'DOH', country: 'Qatar' },
  { city: 'Istanbul', code: 'IST', country: 'Turkey' },
  { city: 'London', code: 'LHR', country: 'United Kingdom' },
  { city: 'Paris', code: 'CDG', country: 'France' },
  { city: 'New York', code: 'JFK', country: 'USA' },
  { city: 'Frankfurt', code: 'FRA', country: 'Germany' },
  { city: 'Singapore', code: 'SIN', country: 'Singapore' },
  { city: 'Bangkok', code: 'BKK', country: 'Thailand' },
  { city: 'Cairo', code: 'CAI', country: 'Egypt' },
  { city: 'Karachi', code: 'KHI', country: 'Pakistan' },
  { city: 'Lahore', code: 'LHE', country: 'Pakistan' },
  { city: 'Islamabad', code: 'ISB', country: 'Pakistan' },
];

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First Class'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F0C040';
const BG = '#0A0A0F';
const CARD = '#0E0E15';
const GREY = '#55556A';
const GOLD_DIM = '#C9A84C14';
const WHITE = '#FFFFFF';

export default function FlightSearchScreen({ onBack, onSearch }: Props) {
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('roundTrip');
  const [from, setFrom] = useState('');
  const [fromCode, setFromCode] = useState('');
  const [to, setTo] = useState('');
  const [toCode, setToCode] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Business');
  const [airportModal, setAirportModal] = useState<'from' | 'to' | null>(null);
  const [airportQuery, setAirportQuery] = useState('');
  const [dateModal, setDateModal] = useState<'depart' | 'return' | null>(null);
  const [cabinModal, setCabinModal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const swapRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSwap = () => {
    Animated.sequence([
      Animated.timing(swapRotate, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(swapRotate, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    const tmpCity = from;
    const tmpCode = fromCode;
    setFrom(to);
    setFromCode(toCode);
    setTo(tmpCity);
    setToCode(tmpCode);
  };

  const spinInterpolate = swapRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const filteredAirports = AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(airportQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(airportQuery.toLowerCase()) ||
      a.country.toLowerCase().includes(airportQuery.toLowerCase())
  );

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const handleDayPress = (day: number) => {
    const str = `${day} ${MONTHS_SHORT[calMonth]} ${calYear}`;
    if (dateModal === 'depart') setDepartDate(str);
    else setReturnDate(str);
    setTimeout(() => setDateModal(null), 200);
  };

  const canSearch = from && to && departDate && (tripType === 'oneWay' || returnDate);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* HEADER */}
        <Animated.View style={[s.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerLabel}>— LUXORA</Text>
            <Text style={s.headerTitle}>Flight Search</Text>
          </View>
          <View style={s.headerIcon}>
            <Text style={s.planeIcon}>✈</Text>
          </View>
        </Animated.View>

        <View style={s.goldLine} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* TRIP TYPE TOGGLE */}
          <View style={s.tripTypeRow}>
            {(['roundTrip', 'oneWay'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[s.tripTypeBtn, tripType === type && s.tripTypeBtnActive]}
                onPress={() => setTripType(type)}
              >
                <Text style={[s.tripTypeTxt, tripType === type && s.tripTypeTxtActive]}>
                  {type === 'roundTrip' ? 'ROUND TRIP' : 'ONE WAY'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ROUTE CARD */}
          <View style={s.routeCard}>
            <Text style={s.routeCardLabel}>— ROUTE</Text>

            {/* FROM */}
            <TouchableOpacity style={s.cityField} onPress={() => setAirportModal('from')}>
              <Text style={s.cityFieldLabel}>FROM</Text>
              {fromCode ? (
                <View style={s.citySelected}>
                  <Text style={s.cityCode}>{fromCode}</Text>
                  <Text style={s.cityName}>{from}</Text>
                </View>
              ) : (
                <Text style={s.cityPlaceholder}>Select departure city</Text>
              )}
            </TouchableOpacity>

            {/* SWAP */}
            <View style={s.swapRow}>
              <View style={s.swapLine} />
              <TouchableOpacity onPress={handleSwap} style={s.swapBtn}>
                <Animated.Text style={[s.swapIcon, { transform: [{ rotate: spinInterpolate }] }]}>
                  ⇅
                </Animated.Text>
              </TouchableOpacity>
              <View style={s.swapLine} />
            </View>

            {/* TO */}
            <TouchableOpacity style={s.cityField} onPress={() => setAirportModal('to')}>
              <Text style={s.cityFieldLabel}>TO</Text>
              {toCode ? (
                <View style={s.citySelected}>
                  <Text style={s.cityCode}>{toCode}</Text>
                  <Text style={s.cityName}>{to}</Text>
                </View>
              ) : (
                <Text style={s.cityPlaceholder}>Select arrival city</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* DATES */}
          <View style={s.twoCol}>
            <TouchableOpacity
              style={[s.dateCard, { marginRight: 8 }]}
              onPress={() => setDateModal('depart')}
            >
              <Text style={s.dateCardLabel}>DEPART</Text>
              <Text style={s.dateCardValue}>{departDate || 'Select Date'}</Text>
            </TouchableOpacity>
            {tripType === 'roundTrip' && (
              <TouchableOpacity
                style={[s.dateCard, { marginLeft: 8 }]}
                onPress={() => setDateModal('return')}
              >
                <Text style={s.dateCardLabel}>RETURN</Text>
                <Text style={s.dateCardValue}>{returnDate || 'Select Date'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* PASSENGERS + CLASS */}
          <View style={s.twoCol}>
            <View style={[s.dateCard, { marginRight: 8 }]}>
              <Text style={s.dateCardLabel}>PASSENGERS</Text>
              <View style={s.passengerRow}>
                <TouchableOpacity
                  style={s.passengerBtn}
                  onPress={() => setPassengers((p) => Math.max(1, p - 1))}
                >
                  <Text style={s.passengerBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={s.passengerCount}>{passengers}</Text>
                <TouchableOpacity
                  style={s.passengerBtn}
                  onPress={() => setPassengers((p) => Math.min(9, p + 1))}
                >
                  <Text style={s.passengerBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[s.dateCard, { marginLeft: 8 }]}
              onPress={() => setCabinModal(true)}
            >
              <Text style={s.dateCardLabel}>CLASS</Text>
              <Text style={s.dateCardValue}>{cabinClass.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* POPULAR ROUTES */}
          <Text style={s.sectionLabel}>— POPULAR ROUTES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.popularScroll}>
            {[
              { from: 'RUH', to: 'DXB' },
              { from: 'JED', to: 'LHR' },
              { from: 'ISB', to: 'JED' },
              { from: 'KHI', to: 'RUH' },
              { from: 'RUH', to: 'IST' },
              { from: 'LHE', to: 'DXB' },
            ].map((route, i) => (
              <TouchableOpacity
                key={i}
                style={s.popularChip}
                onPress={() => {
                  const f = AIRPORTS.find((a) => a.code === route.from)!;
                  const t = AIRPORTS.find((a) => a.code === route.to)!;
                  setFrom(f.city); setFromCode(f.code);
                  setTo(t.city); setToCode(t.code);
                }}
              >
                <Text style={s.popularChipTxt}>{route.from} → {route.to}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* SEARCH BUTTON */}
          <TouchableOpacity
            style={[s.searchBtn, !canSearch && s.searchBtnDisabled]}
            onPress={() =>
              canSearch &&
              onSearch({
                tripType,
                from,
                fromCode,
                to,
                toCode,
                departDate,
                returnDate,
                passengers,
                cabinClass,
                cabin: cabinClass,
              })
            }
          >
            <Text style={s.searchBtnTxt}>SEARCH FLIGHTS</Text>
            <Text style={s.searchBtnArrow}>→</Text>
          </TouchableOpacity>

          <Text style={s.footerNote}>✦ Best fares guaranteed · No hidden charges</Text>
        </Animated.View>
      </ScrollView>

      {/* ── AIRPORT MODAL ── */}
      <Modal visible={!!airportModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalPill} />
            <Text style={s.modalTitle}>
              {airportModal === 'from' ? '— DEPARTURE CITY' : '— ARRIVAL CITY'}
            </Text>
            <View style={s.modalSearchRow}>
              <Text style={s.modalSearchIcon}>✦</Text>
              <TextInput
                style={s.modalSearchInput}
                placeholder="Search city or code..."
                placeholderTextColor={GREY}
                value={airportQuery}
                onChangeText={setAirportQuery}
                autoFocus
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredAirports.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={s.airportRow}
                  onPress={() => {
                    if (airportModal === 'from') { setFrom(a.city); setFromCode(a.code); }
                    else { setTo(a.city); setToCode(a.code); }
                    setAirportModal(null);
                    setAirportQuery('');
                  }}
                >
                  <View style={s.codeBadge}>
                    <Text style={s.codeText}>{a.code}</Text>
                  </View>
                  <View>
                    <Text style={s.airportCity}>{a.city}</Text>
                    <Text style={s.airportCountry}>{a.country}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => { setAirportModal(null); setAirportQuery(''); }}
            >
              <Text style={s.modalCloseTxt}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── DATE MODAL ── */}
      <Modal visible={!!dateModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalPill} />
            <Text style={s.modalTitle}>
              {dateModal === 'depart' ? '— DEPARTURE DATE' : '— RETURN DATE'}
            </Text>
            <View style={s.calNavRow}>
              <TouchableOpacity
                style={s.calNavBtn}
                onPress={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                  else setCalMonth((m) => m - 1);
                }}
              >
                <Text style={s.calNavArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={s.calMonthLabel}>{MONTHS[calMonth]} {calYear}</Text>
              <TouchableOpacity
                style={s.calNavBtn}
                onPress={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                  else setCalMonth((m) => m + 1);
                }}
              >
                <Text style={s.calNavArrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={s.calDayHeaders}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={s.calDayHeader}>{d}</Text>
              ))}
            </View>
            <View style={s.calGrid}>
              {[
                ...Array(getFirstDay(calMonth, calYear)).fill(null),
                ...Array.from({ length: getDaysInMonth(calMonth, calYear) }, (_, i) => i + 1),
              ].map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.calCell}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                >
                  <Text style={[s.calDayText, !day && { opacity: 0 }]}>{day ?? '.'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setDateModal(null)}>
              <Text style={s.modalCloseTxt}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── CABIN MODAL ── */}
      <Modal visible={cabinModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalPill} />
            <Text style={s.modalTitle}>— CABIN CLASS</Text>
            {CABIN_CLASSES.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[s.cabinRow, cabinClass === cls && s.cabinRowActive]}
                onPress={() => { setCabinClass(cls); setCabinModal(false); }}
              >
                <Text style={[s.cabinRowText, cabinClass === cls && s.cabinRowTextActive]}>
                  {cls.toUpperCase()}
                </Text>
                {cabinClass === cls && <Text style={s.cabinCheck}>✦</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setCabinModal(false)}>
              <Text style={s.modalCloseTxt}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 60 },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: 150, backgroundColor: '#C9A84C08',
    top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: '#C9A84C05',
    bottom: 200, left: -60,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderWidth: 1,
    borderColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: GOLD, fontSize: 20 },
  headerCenter: { flex: 1, marginLeft: 16 },
  headerLabel: { color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: '300' },
  headerTitle: { color: WHITE, fontSize: 22, fontWeight: '200', letterSpacing: 2, marginTop: 2 },
  headerIcon: {
    width: 40, height: 40, borderWidth: 1,
    borderColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center',
  },
  planeIcon: { color: GOLD, fontSize: 18 },
  goldLine: { height: 1, backgroundColor: GOLD_DIM, marginHorizontal: 20, marginBottom: 28 },
  tripTypeRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24 },
  tripTypeBtn: {
    flex: 1, paddingVertical: 10, borderWidth: 1,
    borderColor: GOLD_DIM, alignItems: 'center', marginRight: 8,
  },
  tripTypeBtnActive: { backgroundColor: GOLD_DIM, borderColor: GOLD },
  tripTypeTxt: { color: GREY, fontSize: 11, letterSpacing: 2, fontWeight: '300' },
  tripTypeTxtActive: { color: GOLD },
  routeCard: {
    marginHorizontal: 20, borderWidth: 1,
    borderColor: GOLD_DIM, backgroundColor: CARD,
    padding: 20, marginBottom: 16,
  },
  routeCardLabel: { color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: '300', marginBottom: 16 },
  cityField: { paddingVertical: 12 },
  cityFieldLabel: { color: GREY, fontSize: 10, letterSpacing: 3, fontWeight: '300', marginBottom: 8 },
  citySelected: { flexDirection: 'row', alignItems: 'baseline' },
  cityCode: { color: GOLD_LIGHT, fontSize: 32, fontWeight: '200', letterSpacing: 4, marginRight: 12 },
  cityName: { color: WHITE, fontSize: 16, fontWeight: '300', letterSpacing: 1 },
  cityPlaceholder: { color: GREY, fontSize: 16, fontWeight: '300', letterSpacing: 1 },
  swapRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  swapLine: { flex: 1, height: 1, backgroundColor: GOLD_DIM },
  swapBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 12, backgroundColor: CARD,
  },
  swapIcon: { color: GOLD, fontSize: 18 },
  twoCol: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 },
  dateCard: {
    flex: 1, borderWidth: 1, borderColor: GOLD_DIM,
    backgroundColor: CARD, padding: 16,
  },
  dateCardLabel: { color: GREY, fontSize: 10, letterSpacing: 3, fontWeight: '300', marginBottom: 8 },
  dateCardValue: { color: WHITE, fontSize: 13, fontWeight: '300', letterSpacing: 1 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  passengerBtn: {
    width: 28, height: 28, borderWidth: 1,
    borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  passengerBtnTxt: { color: GOLD, fontSize: 16, lineHeight: 20 },
  passengerCount: { color: WHITE, fontSize: 18, fontWeight: '300', marginHorizontal: 16, letterSpacing: 2 },
  sectionLabel: { color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: '300', marginHorizontal: 20, marginBottom: 12 },
  popularScroll: { paddingLeft: 20, marginBottom: 28 },
  popularChip: {
    borderWidth: 1, borderColor: GOLD_DIM,
    paddingHorizontal: 16, paddingVertical: 10,
    marginRight: 10, backgroundColor: CARD,
  },
  popularChipTxt: { color: GOLD, fontSize: 12, letterSpacing: 2, fontWeight: '300' },
  searchBtn: {
    marginHorizontal: 20, backgroundColor: GOLD,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 18, marginBottom: 16,
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnTxt: { color: BG, fontSize: 13, letterSpacing: 4, fontWeight: '700' },
  searchBtnArrow: { color: BG, fontSize: 20 },
  footerNote: { color: GREY, fontSize: 11, letterSpacing: 2, textAlign: 'center', fontWeight: '300' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0E0E15', borderTopWidth: 1,
    borderColor: GOLD_DIM, padding: 24, maxHeight: '85%',
  },
  modalPill: { width: 40, height: 3, backgroundColor: GOLD_DIM, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: GOLD, fontSize: 11, letterSpacing: 4, fontWeight: '300', marginBottom: 20 },
  modalSearchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: GOLD_DIM, paddingHorizontal: 14, marginBottom: 16,
  },
  modalSearchIcon: { color: GOLD, fontSize: 12, marginRight: 10 },
  modalSearchInput: { flex: 1, color: WHITE, fontSize: 14, paddingVertical: 12, fontWeight: '300' },
  airportRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GOLD_DIM,
  },
  codeBadge: { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, marginRight: 14 },
  codeText: { color: GOLD, fontSize: 13, letterSpacing: 2, fontWeight: '300' },
  airportCity: { color: WHITE, fontSize: 14, fontWeight: '300', letterSpacing: 1 },
  airportCountry: { color: GREY, fontSize: 11, letterSpacing: 1, marginTop: 2 },
  calNavRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  calNavBtn: { width: 36, height: 36, borderWidth: 1, borderColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center' },
  calNavArrow: { color: GOLD, fontSize: 22 },
  calMonthLabel: { color: WHITE, fontSize: 15, fontWeight: '300', letterSpacing: 2 },
  calDayHeaders: { flexDirection: 'row', marginBottom: 8 },
  calDayHeader: { flex: 1, textAlign: 'center', color: GREY, fontSize: 11, letterSpacing: 1, fontWeight: '300' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calDayText: { color: WHITE, fontSize: 13, fontWeight: '300' },
  cabinRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: GOLD_DIM,
  },
  cabinRowActive: { backgroundColor: GOLD_DIM },
  cabinRowText: { color: GREY, fontSize: 13, letterSpacing: 3, fontWeight: '300' },
  cabinRowTextActive: { color: GOLD },
  cabinCheck: { color: GOLD, fontSize: 12 },
  modalCloseBtn: { borderWidth: 1, borderColor: GOLD_DIM, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalCloseTxt: { color: GREY, fontSize: 11, letterSpacing: 4, fontWeight: '300' },
});