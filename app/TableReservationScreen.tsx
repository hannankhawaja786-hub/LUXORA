import React, { useMemo, useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  priceRange: string;
  deliveryTime: string;
  image: string;
  tag?: string;
  isOpen: boolean;
  distance: string;
  discount?: string;
  featured?: boolean;
}

interface Props {
  restaurant: Restaurant;
  guests: number;
  onBack: () => void;
  onConfirm: (ref: string) => void;
}

const LUNCH_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const DINNER_SLOTS = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
const FULL_SLOTS = ['12:30', '13:00', '19:00', '20:00'];

const DINING_OPTIONS = [
  {
    id: 'indoor',
    label: 'INDOOR',
    sub: 'Air-conditioned comfort',
    icon: '◻',
  },
  {
    id: 'outdoor',
    label: 'OUTDOOR',
    sub: 'Open-air terrace',
    icon: '◇',
  },
  {
    id: 'private',
    label: 'PRIVATE',
    sub: 'Exclusive dining room',
    icon: '◈',
  },
];

const OCCASIONS = [
  'CASUAL',
  'BUSINESS',
  'ANNIVERSARY',
  'BIRTHDAY',
  'CELEBRATION',
  'CORPORATE',
];

function generateDates() {
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const result = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    result.push({
      day: DAYS[d.getDay()],
      date: d.getDate(),
      month: MONTHS[d.getMonth()],
      isToday: i === 0,
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      label: `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
    });
  }
  return result;
}

export default function TableReservationScreen({ restaurant, guests: initialGuests, onBack, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const dates = useMemo(() => generateDates(), []);

  const [selectedDate, setSelectedDate] = useState(dates[0].key);
  const [selectedTime, setSelectedTime] = useState('');
  const [dining, setDining] = useState('indoor');
  const [occasion, setOccasion] = useState('CASUAL');
  const [guests, setGuests] = useState(initialGuests);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialReq, setSpecialReq] = useState('');

  const selectedDateObj = dates.find((d) => d.key === selectedDate);
  const canConfirm = selectedDate && selectedTime && guestName.trim().length > 0;

  const handleConfirm = () => {
    const ref = 'LXR-TBL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    onConfirm(ref);
  };

  const renderTimeGrid = (slots: string[], label: string) => (
    <View style={styles.timeSection}>
      <Text style={styles.timeSessionLabel}>{label}</Text>
      <View style={styles.timeGrid}>
        {slots.map((t) => {
          const isFull = FULL_SLOTS.includes(t);
          const isSelected = selectedTime === t;
          return (
            <TouchableOpacity
              key={t}
              disabled={isFull}
              onPress={() => setSelectedTime(t)}
              style={[
                styles.timeChip,
                isSelected && styles.timeChipSelected,
                isFull && styles.timeChipFull,
              ]}
            >
              <Text
                style={[
                  styles.timeChipText,
                  isSelected && styles.timeChipTextSelected,
                  isFull && styles.timeChipTextFull,
                ]}
              >
                {t}
              </Text>
              {isFull && <Text style={styles.timeChipFullTag}>FULL</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>TABLE RESERVATION</Text>
          <Text style={styles.headerSub}>{restaurant.name}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeIcon}>◈</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Restaurant Hero Card ── */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          {/* Corner brackets */}
          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroName}>{restaurant.name}</Text>
              <Text style={styles.heroCuisine}>{restaurant.cuisine}  ·  {restaurant.area}</Text>
            </View>
            <View style={styles.heroMeta}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroRating}>★  {restaurant.rating}</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroPrice}>{restaurant.priceRange}</Text>
              </View>
              <View style={[styles.heroBadge, restaurant.isOpen ? styles.heroBadgeOpen : styles.heroBadgeClosed]}>
                <View style={[styles.heroDot, !restaurant.isOpen && styles.heroDotClosed]} />
                <Text style={[styles.heroStatus, !restaurant.isOpen && styles.heroStatusClosed]}>
                  {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Date Selector ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>SELECT DATE</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {dates.map((d) => {
              const isSelected = selectedDate === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => setSelectedDate(d.key)}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                >
                  <Text style={[styles.dateDayText, isSelected && styles.dateDayTextSelected]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateDateNum, isSelected && styles.dateDateNumSelected]}>
                    {d.date}
                  </Text>
                  <Text style={[styles.dateMonthText, isSelected && styles.dateMonthTextSelected]}>
                    {d.month}
                  </Text>
                  {d.isToday && (
                    <View style={styles.todayDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Time Slots ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>SELECT TIME</Text>
          </View>
          <View style={styles.timeSlotsContainer}>
            {renderTimeGrid(LUNCH_SLOTS, 'LUNCH SERVICE')}
            <View style={styles.timeSessionDivider} />
            {renderTimeGrid(DINNER_SLOTS, 'DINNER SERVICE')}
          </View>
          <View style={styles.slotLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#C9A84C' }]} />
              <Text style={styles.legendText}>AVAILABLE</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#55556A' }]} />
              <Text style={styles.legendText}>FULLY BOOKED</Text>
            </View>
          </View>
        </View>

        {/* ── Dining Preference ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>DINING PREFERENCE</Text>
          </View>
          <View style={styles.diningRow}>
            {DINING_OPTIONS.map((opt) => {
              const isSelected = dining === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setDining(opt.id)}
                  style={[styles.diningCard, isSelected && styles.diningCardSelected]}
                >
                  <Text style={[styles.diningIcon, isSelected && styles.diningIconSelected]}>
                    {opt.icon}
                  </Text>
                  <Text style={[styles.diningLabel, isSelected && styles.diningLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.diningSub, isSelected && styles.diningSubSelected]}>
                    {opt.sub}
                  </Text>
                  {isSelected && <View style={styles.diningSelectedLine} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Occasion ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>OCCASION</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.occasionScroll}
          >
            {OCCASIONS.map((occ) => {
              const isSelected = occasion === occ;
              return (
                <TouchableOpacity
                  key={occ}
                  onPress={() => setOccasion(occ)}
                  style={[styles.occasionChip, isSelected && styles.occasionChipSelected]}
                >
                  <Text style={[styles.occasionText, isSelected && styles.occasionTextSelected]}>
                    {occ}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Guests ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>GUESTS</Text>
          </View>
          <View style={styles.guestsCard}>
            <View>
              <Text style={styles.guestsCardLabel}>NUMBER OF GUESTS</Text>
              <Text style={styles.guestsCardSub}>Maximum 20 per reservation</Text>
            </View>
            <View style={styles.guestsStepper}>
              <TouchableOpacity
                onPress={() => setGuests(Math.max(1, guests - 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperNum}>{guests}</Text>
              <TouchableOpacity
                onPress={() => setGuests(Math.min(20, guests + 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Your Details ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>YOUR DETAILS</Text>
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>FULL NAME  *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ahmed Al-Rashid"
                placeholderTextColor="#2A2A3A"
                value={guestName}
                onChangeText={setGuestName}
              />
              <View style={styles.inputLine} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+966 5XX XXX XXXX"
                placeholderTextColor="#2A2A3A"
                value={guestPhone}
                onChangeText={setGuestPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.inputLine} />
            </View>
          </View>
        </View>

        {/* ── Special Requests ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>SPECIAL REQUESTS</Text>
          </View>
          <View style={styles.specialCard}>
            <TextInput
              style={styles.specialInput}
              placeholder="Dietary restrictions, allergies, seating preferences, celebration details..."
              placeholderTextColor="#2A2A3A"
              value={specialReq}
              onChangeText={setSpecialReq}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* ── Booking Summary ── */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryHeaderText}>✦  RESERVATION SUMMARY</Text>
            </View>
            <View style={styles.summaryBody}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>RESTAURANT</Text>
                <Text style={styles.summaryVal}>{restaurant.name}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>DATE</Text>
                <Text style={styles.summaryVal}>
                  {selectedDateObj ? selectedDateObj.label : '—'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>TIME</Text>
                <Text style={styles.summaryVal}>{selectedTime || '—'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>GUESTS</Text>
                <Text style={styles.summaryVal}>{guests} Persons</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>SEATING</Text>
                <Text style={styles.summaryVal}>
                  {DINING_OPTIONS.find((d) => d.id === dining)?.label ?? '—'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>OCCASION</Text>
                <Text style={styles.summaryVal}>{occasion}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Confirm Button ── */}
      <View style={[styles.confirmBar, { paddingBottom: insets.bottom + 12 }]}>
        {!canConfirm && (
          <Text style={styles.confirmHint}>
            {!selectedTime ? 'Please select a time slot' : 'Please enter your name'}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>CONFIRM RESERVATION</Text>
          <Text style={styles.confirmBtnSub}>
            {selectedDateObj?.label ?? '—'}  ·  {selectedTime || '—'}  ·  {guests} Guests
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#C9A84C', fontSize: 20 },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    color: '#C9A84C', fontSize: 13, fontWeight: '800', letterSpacing: 4,
  },
  headerSub: { color: '#55556A', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  headerBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeIcon: { color: '#C9A84C', fontSize: 16 },

  // ── Hero Card ──
  heroCard: {
    marginHorizontal: 20, marginTop: 20, marginBottom: 4,
    height: 180, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#C9A84C20',
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0FCC',
  },
  bracket: {
    position: 'absolute', width: 16, height: 16,
    borderColor: '#C9A84C60',
  },
  bracketTL: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
  bracketTR: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
  bracketBL: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
  bracketBR: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 18, flexDirection: 'row',
    alignItems: 'flex-end', justifyContent: 'space-between',
  },
  heroName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  heroCuisine: { color: '#FFFFFF80', fontSize: 11, marginTop: 3 },
  heroMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  heroBadge: {
    backgroundColor: '#0E0E15CC', borderWidth: 1, borderColor: '#C9A84C30',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  heroBadgeOpen: { backgroundColor: '#1A2A1ACC', borderColor: '#4CAF5040' },
  heroBadgeClosed: { backgroundColor: '#2A1A1ACC', borderColor: '#FF444440' },
  heroRating: { color: '#F0C040', fontSize: 11, fontWeight: '700' },
  heroPrice: { color: '#C9A84C', fontSize: 11, fontWeight: '600' },
  heroDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4CAF50' },
  heroDotClosed: { backgroundColor: '#FF4444' },
  heroStatus: {
    color: '#4CAF50', fontSize: 9, fontWeight: '700', letterSpacing: 1,
  },
  heroStatusClosed: { color: '#FF4444' },

  // ── Section ──
  section: { marginBottom: 8, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 16, marginTop: 24,
  },
  sectionAccent: {
    width: 3, height: 14, borderRadius: 2, backgroundColor: '#C9A84C',
  },
  sectionTitle: {
    color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3,
  },

  // ── Date Selector ──
  dateScroll: { paddingBottom: 4 },
  dateCard: {
    width: 56, alignItems: 'center', paddingVertical: 14,
    backgroundColor: '#0E0E15', borderRadius: 14,
    borderWidth: 1, borderColor: '#C9A84C14',
    marginRight: 10, position: 'relative',
  },
  dateCardSelected: {
    backgroundColor: '#C9A84C', borderColor: '#C9A84C',
  },
  dateDayText: { color: '#55556A', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  dateDayTextSelected: { color: '#0A0A0FA0' },
  dateDateNum: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  dateDateNumSelected: { color: '#0A0A0F' },
  dateMonthText: { color: '#55556A', fontSize: 9, marginTop: 4, letterSpacing: 0.5 },
  dateMonthTextSelected: { color: '#0A0A0F80' },
  todayDot: {
    position: 'absolute', bottom: 6,
    width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9A84C',
  },

  // ── Time Slots ──
  timeSlotsContainer: {
    backgroundColor: '#0E0E15', borderRadius: 18,
    borderWidth: 1, borderColor: '#C9A84C14', padding: 18,
  },
  timeSection: {},
  timeSessionLabel: {
    color: '#55556A', fontSize: 9, fontWeight: '700',
    letterSpacing: 2, marginBottom: 12,
  },
  timeSessionDivider: {
    height: 1, backgroundColor: '#C9A84C14', marginVertical: 16,
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#13131A',
    borderWidth: 1, borderColor: '#C9A84C20',
    alignItems: 'center',
  },
  timeChipSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  timeChipFull: { borderColor: '#55556A14', opacity: 0.4 },
  timeChipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  timeChipTextSelected: { color: '#0A0A0F' },
  timeChipTextFull: { color: '#55556A' },
  timeChipFullTag: { color: '#FF4444', fontSize: 7, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  slotLegend: {
    flexDirection: 'row', gap: 16, marginTop: 14, paddingHorizontal: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: '#55556A', fontSize: 9, letterSpacing: 1 },

  // ── Dining Preference ──
  diningRow: { flexDirection: 'row', gap: 10 },
  diningCard: {
    flex: 1, backgroundColor: '#0E0E15',
    borderRadius: 14, borderWidth: 1, borderColor: '#C9A84C14',
    padding: 14, alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  diningCardSelected: { borderColor: '#C9A84C40', backgroundColor: '#C9A84C08' },
  diningIcon: { color: '#55556A', fontSize: 22, marginBottom: 8 },
  diningIconSelected: { color: '#C9A84C' },
  diningLabel: {
    color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4,
  },
  diningLabelSelected: { color: '#C9A84C' },
  diningSub: { color: '#55556A', fontSize: 9, textAlign: 'center', lineHeight: 13 },
  diningSubSelected: { color: '#C9A84C80' },
  diningSelectedLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#C9A84C',
  },

  // ── Occasion ──
  occasionScroll: { paddingBottom: 4 },
  occasionChip: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 20, backgroundColor: '#0E0E15',
    borderWidth: 1, borderColor: '#C9A84C14', marginRight: 8,
  },
  occasionChipSelected: { backgroundColor: '#C9A84C14', borderColor: '#C9A84C' },
  occasionText: { color: '#55556A', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  occasionTextSelected: { color: '#C9A84C' },

  // ── Guests ──
  guestsCard: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14',
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  guestsCardLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  guestsCardSub: { color: '#55556A', fontSize: 10 },
  guestsStepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { color: '#C9A84C', fontSize: 20, fontWeight: '300' },
  stepperNum: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', minWidth: 28, textAlign: 'center' },

  // ── Inputs ──
  inputGroup: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14', padding: 18, gap: 20,
  },
  inputWrapper: {},
  inputLabel: { color: '#55556A', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: { color: '#FFFFFF', fontSize: 14, paddingBottom: 8 },
  inputLine: { height: 1, backgroundColor: '#C9A84C20' },

  // ── Special Request ──
  specialCard: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14', padding: 18,
  },
  specialInput: {
    color: '#FFFFFF', fontSize: 13, lineHeight: 20,
    minHeight: 72, textAlignVertical: 'top',
  },

  // ── Summary ──
  summaryCard: {
    borderRadius: 18, borderWidth: 1, borderColor: '#C9A84C40',
    overflow: 'hidden', marginTop: 8,
  },
  summaryHeader: {
    backgroundColor: '#C9A84C14', paddingVertical: 12, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C20',
  },
  summaryHeaderText: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  summaryBody: { backgroundColor: '#0E0E15', paddingHorizontal: 18 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 13,
  },
  summaryDivider: { height: 1, backgroundColor: '#C9A84C0A' },
  summaryKey: { color: '#55556A', fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  summaryVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // ── Confirm Bar ──
  confirmBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1, borderTopColor: '#C9A84C14',
  },
  confirmHint: {
    color: '#55556A', fontSize: 10, textAlign: 'center',
    letterSpacing: 1, marginBottom: 8,
  },
  confirmBtn: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.35 },
  confirmBtnText: {
    color: '#0A0A0F', fontSize: 14, fontWeight: '800', letterSpacing: 3,
  },
  confirmBtnSub: { color: '#0A0A0F70', fontSize: 10, marginTop: 4, letterSpacing: 0.5 },
});