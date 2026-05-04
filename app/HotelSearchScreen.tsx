import React, { useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HotelSearchParams {
  city: string;
  cityCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  starRating: number[];
  propertyType: string;
}

interface Props {
  onBack: () => void;
  onSearch: (params: HotelSearchParams) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0F',
  card: '#0E0E15',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  goldDim: '#C9A84C14',
  goldDim2: '#C9A84C22',
  white: '#FFFFFF',
  grey: '#55556A',
  border: '#1A1A2E',
  cardBorder: '#1C1C2E',
  success: '#2ECC71',
};

const CITIES = [
  { name: 'Riyadh', code: 'RUH', country: 'Saudi Arabia', tag: 'CAPITAL' },
  { name: 'Jeddah', code: 'JED', country: 'Saudi Arabia', tag: 'COASTAL' },
  { name: 'Makkah', code: 'MKH', country: 'Saudi Arabia', tag: 'HOLY CITY' },
  { name: 'Madinah', code: 'MED', country: 'Saudi Arabia', tag: 'HOLY CITY' },
  { name: 'Dubai', code: 'DXB', country: 'UAE', tag: 'LUXURY HUB' },
  { name: 'Abu Dhabi', code: 'AUH', country: 'UAE', tag: 'PREMIUM' },
  { name: 'Doha', code: 'DOH', country: 'Qatar', tag: 'WORLD CLASS' },
  { name: 'Istanbul', code: 'IST', country: 'Turkey', tag: 'HISTORIC' },
  { name: 'London', code: 'LON', country: 'United Kingdom', tag: 'ICONIC' },
  { name: 'Paris', code: 'PAR', country: 'France', tag: 'ROMANTIC' },
  { name: 'New York', code: 'NYC', country: 'United States', tag: 'VIBRANT' },
  { name: 'Karachi', code: 'KHI', country: 'Pakistan', tag: 'CITY' },
  { name: 'Lahore', code: 'LHE', country: 'Pakistan', tag: 'CULTURAL' },
  { name: 'Islamabad', code: 'ISB', country: 'Pakistan', tag: 'CAPITAL' },
];

const PROPERTY_TYPES = [
  { id: 'hotel', label: 'Hotel', icon: '▣' },
  { id: 'resort', label: 'Resort', icon: '◈' },
  { id: 'villa', label: 'Villa', icon: '⌂' },
  { id: 'apartment', label: 'Apartment', icon: '▤' },
  { id: 'riad', label: 'Riad', icon: '◉' },
  { id: 'boutique', label: 'Boutique', icon: '◆' },
];

const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const POPULAR_DESTINATIONS = [
  { name: 'Riyadh', code: 'RUH', emoji: '◈' },
  { name: 'Dubai', code: 'DXB', emoji: '◆' },
  { name: 'Makkah', code: 'MKH', emoji: '◉' },
  { name: 'Istanbul', code: 'IST', emoji: '▲' },
];

// ─── Calendar Helper ──────────────────────────────────────────────────────────

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

const formatDate = (day: number, month: number, year: number) => {
  const d = String(day).padStart(2, '0');
  const m = String(month + 1).padStart(2, '0');
  return `${d}/${m}/${year}`;
};

const calcNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const [d1, m1, y1] = checkIn.split('/').map(Number);
  const [d2, m2, y2] = checkOut.split('/').map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HotelSearchScreen({ onBack, onSearch }: Props) {
  const today = new Date();

  const [city, setCity] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [starRating, setStarRating] = useState<number[]>([5]);
  const [propertyType, setPropertyType] = useState('hotel');
  const [cityQuery, setCityQuery] = useState('');

  const [showCityModal, setShowCityModal] = useState(false);
  const [showCalModal, setShowCalModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [calMode, setCalMode] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const filteredCities = CALENDAR_MONTHS
    ? CITIES.filter(c =>
        cityQuery.length === 0 ||
        c.name.toLowerCase().includes(cityQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(cityQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(cityQuery.toLowerCase())
      )
    : CITIES;

  const nights = calcNights(checkIn, checkOut);

  const toggleStar = (s: number) => {
    setStarRating(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSearch = () => {
    if (!city || !checkIn || !checkOut) return;
    onSearch({
      city,
      cityCode,
      checkIn,
      checkOut,
      nights,
      rooms,
      adults,
      children,
      starRating,
      propertyType,
    });
  };

  // ─── Calendar ──────────────────────────────────────────────────────────────

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calMonth, calYear);
    const firstDay = getFirstDayOfMonth(calMonth, calYear);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const isSelected = (day: number) => {
      const d = formatDate(day, calMonth, calYear);
      return d === checkIn || d === checkOut;
    };

    const isInRange = (day: number) => {
      if (!checkIn || !checkOut) return false;
      const d = formatDate(day, calMonth, calYear);
      const [d1, m1, y1] = checkIn.split('/').map(Number);
      const [d2, m2, y2] = checkOut.split('/').map(Number);
      const curr = new Date(calYear, calMonth, day);
      const a = new Date(y1, m1 - 1, d1);
      const b = new Date(y2, m2 - 1, d2);
      return curr > a && curr < b;
    };

    const isPast = (day: number) => {
      const d = new Date(calYear, calMonth, day);
      const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return d < t;
    };

    const handleDayPress = (day: number) => {
      if (isPast(day)) return;
      const d = formatDate(day, calMonth, calYear);
      if (selectingCheckIn) {
        setCheckIn(d);
        setCheckOut('');
        setSelectingCheckIn(false);
      } else {
        if (d <= checkIn) {
          setCheckIn(d);
          setCheckOut('');
          setSelectingCheckIn(false);
        } else {
          setCheckOut(d);
          setSelectingCheckIn(true);
        }
      }
    };

    return (
      <View style={styles.calendarWrap}>
        <View style={styles.calNav}>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
              else setCalMonth(m => m - 1);
            }}
          >
            <Text style={styles.calNavIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calMonthLabel}>
            {CALENDAR_MONTHS[calMonth]} {calYear}
          </Text>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
              else setCalMonth(m => m + 1);
            }}
          >
            <Text style={styles.calNavIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calDayLabels}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <Text key={d} style={styles.calDayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.calGrid}>
          {cells.map((day, idx) => {
            if (!day) return <View key={idx} style={styles.calCell} />;
            const sel = isSelected(day);
            const range = isInRange(day);
            const past = isPast(day);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.calCell,
                  range && styles.calCellRange,
                  sel && styles.calCellSelected,
                  past && { opacity: 0.25 },
                ]}
                onPress={() => handleDayPress(day)}
                disabled={past}
              >
                <Text style={[
                  styles.calDayText,
                  sel && { color: C.bg, fontWeight: '800' },
                  range && { color: C.gold },
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>HOTELS</Text>
          <Text style={styles.headerSub}>PREMIUM STAYS WORLDWIDE</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Label */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>WHERE TO?</Text>
          </View>

          {/* City Selector */}
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => { setCityQuery(''); setShowCityModal(true); }}
            activeOpacity={0.85}
          >
            <View style={styles.citySelectorLeft}>
              <Text style={styles.citySelectorIcon}>◈</Text>
              <View>
                <Text style={styles.citySelectorLabel}>DESTINATION</Text>
                <Text style={[
                  styles.citySelectorValue,
                  !city && { color: C.grey, fontSize: 14, fontWeight: '400' }
                ]}>
                  {city || 'Search city or hotel'}
                </Text>
                {cityCode ? (
                  <Text style={styles.citySelectorCode}>{cityCode} · {
                    CITIES.find(c => c.code === cityCode)?.country
                  }</Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.citySelectorArrow}>▾</Text>
          </TouchableOpacity>

          {/* Popular Destinations */}
          {!city && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.popularRow}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {POPULAR_DESTINATIONS.map(d => (
                <TouchableOpacity
                  key={d.code}
                  style={styles.popularChip}
                  onPress={() => { setCity(d.name); setCityCode(d.code); }}
                >
                  <Text style={styles.popularChipIcon}>{d.emoji}</Text>
                  <Text style={styles.popularChipText}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Date Row */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateCard, { flex: 1, marginRight: 8 }]}
              onPress={() => { setSelectingCheckIn(true); setShowCalModal(true); }}
            >
              <Text style={styles.dateCardLabel}>CHECK-IN</Text>
              <Text style={[styles.dateCardValue, !checkIn && { color: C.grey, fontSize: 13 }]}>
                {checkIn || 'Select Date'}
              </Text>
              {checkIn && <Text style={styles.dateCardDay}>
                {(() => {
                  const [d, m, y] = checkIn.split('/').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
                })()}
              </Text>}
            </TouchableOpacity>

            <View style={styles.nightsBadge}>
              {nights > 0 ? (
                <>
                  <Text style={styles.nightsNum}>{nights}</Text>
                  <Text style={styles.nightsLabel}>nights</Text>
                </>
              ) : (
                <Text style={styles.nightsArrow}>→</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.dateCard, { flex: 1, marginLeft: 8 }]}
              onPress={() => { setSelectingCheckIn(false); setShowCalModal(true); }}
            >
              <Text style={styles.dateCardLabel}>CHECK-OUT</Text>
              <Text style={[styles.dateCardValue, !checkOut && { color: C.grey, fontSize: 13 }]}>
                {checkOut || 'Select Date'}
              </Text>
              {checkOut && <Text style={styles.dateCardDay}>
                {(() => {
                  const [d, m, y] = checkOut.split('/').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
                })()}
              </Text>}
            </TouchableOpacity>
          </View>

          {/* Guests Card */}
          <TouchableOpacity style={styles.guestsCard} onPress={() => setShowGuestModal(true)}>
            <View style={styles.guestsLeft}>
              <Text style={styles.guestsIcon}>▣</Text>
              <View>
                <Text style={styles.guestsLabel}>ROOMS & GUESTS</Text>
                <Text style={styles.guestsValue}>
                  {rooms} Room{rooms > 1 ? 's' : ''} · {adults} Adult{adults > 1 ? 's' : ''}
                  {children > 0 ? ` · ${children} Child${children > 1 ? 'ren' : ''}` : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.guestsArrow}>▾</Text>
          </TouchableOpacity>

          {/* Star Rating */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>STAR RATING</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.starBtn,
                    starRating.includes(s) && styles.starBtnActive,
                  ]}
                  onPress={() => toggleStar(s)}
                >
                  <Text style={[
                    styles.starBtnStar,
                    starRating.includes(s) && { color: C.bg },
                  ]}>{'★'.repeat(s)}</Text>
                  <Text style={[
                    styles.starBtnNum,
                    starRating.includes(s) && { color: C.bg },
                  ]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Property Type */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>PROPERTY TYPE</Text>
            <View style={styles.propTypeRow}>
              {PROPERTY_TYPES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.propTypeBtn,
                    propertyType === p.id && styles.propTypeBtnActive,
                  ]}
                  onPress={() => setPropertyType(p.id)}
                >
                  <Text style={[
                    styles.propTypeIcon,
                    propertyType === p.id && { color: C.bg },
                  ]}>{p.icon}</Text>
                  <Text style={[
                    styles.propTypeLabel,
                    propertyType === p.id && { color: C.bg },
                  ]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Requests Tags */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            <View style={styles.prefRow}>
              {['Sea View', 'Pool Access', 'Free Breakfast', 'Airport Transfer', 'Spa', 'Pet Friendly'].map(tag => (
                <View key={tag} style={styles.prefChip}>
                  <Text style={styles.prefChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Search CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.searchBtn,
                (!city || !checkIn || !checkOut) && styles.searchBtnDisabled,
              ]}
              onPress={handleSearch}
              activeOpacity={0.9}
            >
              <Text style={styles.searchBtnIcon}>◈</Text>
              <Text style={styles.searchBtnText}>SEARCH HOTELS</Text>
              {nights > 0 && (
                <View style={styles.searchNightsBadge}>
                  <Text style={styles.searchNightsText}>{nights}N</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.bottomNote}>
            ✦  LUXORA  ·  CURATED LUXURY STAYS  ·  HANNAN KHAWAJA
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ── City Modal ── */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.citySheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>SELECT DESTINATION</Text>
            <TextInput
              style={styles.citySearch}
              placeholder="Search city, country..."
              placeholderTextColor={C.grey}
              value={cityQuery}
              onChangeText={setCityQuery}
              autoFocus
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {CITIES.filter(c =>
                cityQuery.length === 0 ||
                c.name.toLowerCase().includes(cityQuery.toLowerCase()) ||
                c.code.toLowerCase().includes(cityQuery.toLowerCase()) ||
                c.country.toLowerCase().includes(cityQuery.toLowerCase())
              ).map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.cityOption,
                    cityCode === c.code && styles.cityOptionActive,
                  ]}
                  onPress={() => {
                    setCity(c.name);
                    setCityCode(c.code);
                    setShowCityModal(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.cityOptionName,
                      cityCode === c.code && { color: C.gold },
                    ]}>{c.name}</Text>
                    <Text style={styles.cityOptionCountry}>{c.country}</Text>
                  </View>
                  <View style={styles.cityOptionRight}>
                    <View style={styles.cityTagBadge}>
                      <Text style={styles.cityTagText}>{c.tag}</Text>
                    </View>
                    <Text style={styles.cityCode}>{c.code}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Calendar Modal ── */}
      <Modal
        visible={showCalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.calSheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {selectingCheckIn ? 'SELECT CHECK-IN' : 'SELECT CHECK-OUT'}
                </Text>
                <Text style={styles.calSheetSub}>
                  {checkIn && checkOut
                    ? `${checkIn}  →  ${checkOut}  (${nights} nights)`
                    : checkIn
                    ? `Check-in: ${checkIn}`
                    : 'Tap a date to begin'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.calDoneBtn}
                onPress={() => setShowCalModal(false)}
              >
                <Text style={styles.calDoneBtnText}>DONE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calModeToggle}>
              {(['checkIn', 'checkOut'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.calModeBtn,
                    selectingCheckIn === (m === 'checkIn') && styles.calModeBtnActive,
                  ]}
                  onPress={() => setSelectingCheckIn(m === 'checkIn')}
                >
                  <Text style={[
                    styles.calModeBtnText,
                    selectingCheckIn === (m === 'checkIn') && { color: C.bg },
                  ]}>
                    {m === 'checkIn' ? 'CHECK-IN' : 'CHECK-OUT'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderCalendar()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Guest Modal ── */}
      <Modal
        visible={showGuestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.guestSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>ROOMS & GUESTS</Text>

            {[
              { label: 'Rooms', sub: 'Number of rooms', val: rooms, set: setRooms, min: 1, max: 10 },
              { label: 'Adults', sub: 'Age 13+', val: adults, set: setAdults, min: 1, max: 20 },
              { label: 'Children', sub: 'Age 0–12', val: children, set: setChildren, min: 0, max: 10 },
            ].map(item => (
              <View key={item.label} style={styles.guestRow}>
                <View>
                  <Text style={styles.guestRowLabel}>{item.label}</Text>
                  <Text style={styles.guestRowSub}>{item.sub}</Text>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[styles.counterBtn, item.val <= item.min && styles.counterBtnDisabled]}
                    onPress={() => item.val > item.min && item.set(item.val - 1)}
                  >
                    <Text style={styles.counterBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{item.val}</Text>
                  <TouchableOpacity
                    style={[styles.counterBtn, item.val >= item.max && styles.counterBtnDisabled]}
                    onPress={() => item.val < item.max && item.set(item.val + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.guestDoneBtn}
              onPress={() => setShowGuestModal(false)}
            >
              <Text style={styles.guestDoneBtnText}>CONFIRM GUESTS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.goldDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.gold + '44',
  },
  backIcon: { color: C.gold, fontSize: 18, fontWeight: '300' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: C.white, fontSize: 16,
    fontWeight: '800', letterSpacing: 4,
  },
  headerSub: {
    color: C.grey, fontSize: 9,
    letterSpacing: 2, marginTop: 2,
  },

  scrollContent: { padding: 20, paddingBottom: 48 },

  heroLabel: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: C.goldDim2,
    borderLeftWidth: 2, borderLeftColor: C.gold,
  },
  heroLabelText: {
    color: C.gold, fontSize: 11,
    fontWeight: '800', letterSpacing: 3,
  },

  citySelector: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.gold + '44',
  },
  citySelectorLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  citySelectorIcon: { color: C.gold, fontSize: 22, marginRight: 14 },
  citySelectorLabel: {
    color: C.grey, fontSize: 9,
    fontWeight: '700', letterSpacing: 2, marginBottom: 4,
  },
  citySelectorValue: {
    color: C.white, fontSize: 18,
    fontWeight: '700', letterSpacing: 0.5,
  },
  citySelectorCode: { color: C.grey, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  citySelectorArrow: { color: C.gold, fontSize: 16 },

  popularRow: { marginBottom: 16 },
  popularChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.gold + '33',
  },
  popularChipIcon: { color: C.gold, fontSize: 12, marginRight: 6 },
  popularChipText: { color: C.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  dateCardLabel: {
    color: C.grey, fontSize: 9,
    fontWeight: '700', letterSpacing: 2, marginBottom: 6,
  },
  dateCardValue: {
    color: C.white, fontSize: 16,
    fontWeight: '700', letterSpacing: 0.5,
  },
  dateCardDay: {
    color: C.gold, fontSize: 10,
    letterSpacing: 1, marginTop: 3,
  },
  nightsBadge: {
    width: 44, alignItems: 'center', justifyContent: 'center',
  },
  nightsNum: {
    color: C.goldLight, fontSize: 18,
    fontWeight: '800', letterSpacing: 0.5,
  },
  nightsLabel: { color: C.grey, fontSize: 8, letterSpacing: 0.5 },
  nightsArrow: { color: C.grey, fontSize: 18 },

  guestsCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  guestsLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  guestsIcon: { color: C.gold, fontSize: 20, marginRight: 14 },
  guestsLabel: {
    color: C.grey, fontSize: 9,
    fontWeight: '700', letterSpacing: 2, marginBottom: 4,
  },
  guestsValue: { color: C.white, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  guestsArrow: { color: C.gold, fontSize: 16 },

  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  sectionTitle: {
    color: C.gold, fontSize: 10,
    fontWeight: '800', letterSpacing: 2.5, marginBottom: 14,
  },

  starRow: { flexDirection: 'row', gap: 8 },
  starBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.border,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  starBtnActive: { backgroundColor: C.gold, borderColor: C.goldLight },
  starBtnStar: { color: C.gold, fontSize: 10, letterSpacing: -1 },
  starBtnNum: { color: C.grey, fontSize: 11, fontWeight: '700', marginTop: 3 },

  propTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  propTypeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, backgroundColor: C.border,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  propTypeBtnActive: { backgroundColor: C.gold, borderColor: C.goldLight },
  propTypeIcon: { color: C.gold, fontSize: 14, marginRight: 6 },
  propTypeLabel: { color: C.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  prefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1, borderColor: C.gold + '33',
    backgroundColor: C.goldDim,
  },
  prefChipText: { color: C.gold, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 4,
  },
  searchBtnDisabled: { backgroundColor: C.gold + '55' },
  searchBtnIcon: { color: C.bg, fontSize: 16, marginRight: 10 },
  searchBtnText: {
    color: C.bg, fontSize: 15,
    fontWeight: '800', letterSpacing: 3,
  },
  searchNightsBadge: {
    marginLeft: 12, backgroundColor: C.bg + '33',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  searchNightsText: { color: C.bg, fontSize: 11, fontWeight: '800' },

  bottomNote: {
    color: C.grey + '66',
    fontSize: 9, letterSpacing: 1.5,
    textAlign: 'center', marginTop: 20,
  },

  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    width: 40, height: 4,
    backgroundColor: C.grey + '66',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: C.gold, fontSize: 12,
    fontWeight: '800', letterSpacing: 3,
    marginBottom: 16,
  },

  // City Modal
  citySheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
    maxHeight: '85%',
  },
  citySearch: {
    backgroundColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    color: C.white, fontSize: 14,
    marginBottom: 16,
    borderWidth: 1, borderColor: C.cardBorder,
    letterSpacing: 0.5,
  },
  cityOption: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  cityOptionActive: {
    backgroundColor: C.goldDim,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  cityOptionName: { color: C.white, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  cityOptionCountry: { color: C.grey, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  cityOptionRight: { alignItems: 'flex-end' },
  cityTagBadge: {
    backgroundColor: C.goldDim,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, marginBottom: 4,
    borderWidth: 1, borderColor: C.gold + '33',
  },
  cityTagText: { color: C.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  cityCode: { color: C.grey, fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  // Calendar Modal
  calSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
    maxHeight: '88%',
  },
  calSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calSheetSub: { color: C.grey, fontSize: 11, letterSpacing: 0.5, marginTop: 4 },
  calDoneBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, backgroundColor: C.gold,
  },
  calDoneBtnText: { color: C.bg, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  calModeToggle: {
    flexDirection: 'row',
    backgroundColor: C.border,
    borderRadius: 10, padding: 4,
    marginBottom: 16,
  },
  calModeBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 8, borderRadius: 8,
  },
  calModeBtnActive: { backgroundColor: C.gold },
  calModeBtnText: { color: C.grey, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  calendarWrap: { paddingHorizontal: 4 },
  calNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  calNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  calNavIcon: { color: C.gold, fontSize: 20, fontWeight: '300' },
  calMonthLabel: {
    color: C.white, fontSize: 15,
    fontWeight: '700', letterSpacing: 1,
  },
  calDayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calDayLabel: {
    flex: 1, textAlign: 'center',
    color: C.grey, fontSize: 10,
    fontWeight: '700', letterSpacing: 0.5,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
  },
  calCellSelected: { backgroundColor: C.gold },
  calCellRange: { backgroundColor: C.goldDim2 },
  calDayText: { color: C.white, fontSize: 13, fontWeight: '500' },

  // Guest Modal
  guestSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  guestRowLabel: { color: C.white, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  guestRowSub: { color: C.grey, fontSize: 10, letterSpacing: 0.5, marginTop: 3 },
  counter: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  counterBtnDisabled: { borderColor: C.border, backgroundColor: C.border },
  counterBtnText: { color: C.gold, fontSize: 18, fontWeight: '300', lineHeight: 22 },
  counterValue: {
    color: C.white, fontSize: 18,
    fontWeight: '700', width: 40,
    textAlign: 'center',
  },
  guestDoneBtn: {
    marginTop: 20,
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestDoneBtnText: { color: C.bg, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
});