import React, { useState } from 'react';
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

interface Props {
  onBack: () => void;
  onConfirm: (ref: string) => void;
}

const VEHICLES = [
  {
    id: 'economy',
    class: 'ECONOMY',
    model: 'Toyota Camry or similar',
    capacity: 4,
    luggage: 2,
    baseFare: 35,
    perKm: 3.5,
    eta: '3–5 min',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80',
    features: ['AC', 'Music'],
    tag: null,
  },
  {
    id: 'business',
    class: 'BUSINESS',
    model: 'Mercedes E-Class or similar',
    capacity: 4,
    luggage: 3,
    baseFare: 85,
    perKm: 7.5,
    eta: '5–8 min',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    features: ['AC', 'WiFi', 'Water'],
    tag: 'POPULAR',
  },
  {
    id: 'luxury',
    class: 'LUXURY',
    model: 'Mercedes S-Class or similar',
    capacity: 4,
    luggage: 4,
    baseFare: 165,
    perKm: 14,
    eta: '8–12 min',
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&w=600&q=80',
    features: ['AC', 'WiFi', 'Water', 'Privacy'],
    tag: 'PREMIUM',
  },
  {
    id: 'suv',
    class: 'SUV',
    model: 'Cadillac Escalade or similar',
    capacity: 7,
    luggage: 6,
    baseFare: 125,
    perKm: 11,
    eta: '6–10 min',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
    features: ['AC', 'WiFi', 'Water', '7 Seats'],
    tag: null,
  },
  {
    id: 'vip',
    class: 'VIP',
    model: 'Rolls-Royce Ghost or similar',
    capacity: 4,
    luggage: 3,
    baseFare: 420,
    perKm: 32,
    eta: '10–20 min',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    features: ['AC', 'WiFi', 'Champagne', 'Privacy', 'Chauffeur'],
    tag: 'ULTRA',
  },
];

const PICKUP_SUGGESTIONS = [
  'King Khalid Intl Airport',
  'Kingdom Centre Tower',
  'Al Faisaliah Tower',
  'NEOM Bay Airport',
  'Riyadh Front Mall',
  'King Abdullah Financial District',
];

const DROP_SUGGESTIONS = [
  'Burj Rafal Hotel',
  'Four Seasons Riyadh',
  'Nobu Riyadh',
  'Jeddah Corniche',
  'Al Nakheel Mall',
  'Makkah Grand Mosque',
];

const ADDONS = [
  { id: 'child', label: 'CHILD SEAT', price: 15 },
  { id: 'greet', label: 'MEET & GREET', price: 25 },
  { id: 'wifi', label: 'IN-CAR WIFI', price: 20 },
  { id: 'water', label: 'WATER & SNACKS', price: 10 },
];

const SCHED_DATES = ['Today', 'Tomorrow', 'Wed 29', 'Thu 30', 'Fri 1', 'Sat 2'];
const SCHED_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
];

const EST_KM = 12;

export default function CabBookingScreen({ onBack, onConfirm }: Props) {
  const insets = useSafeAreaInsets();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropFocus, setDropFocus] = useState(false);

  const [rideNow, setRideNow] = useState(true);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');

  const [selectedVehicle, setSelectedVehicle] = useState('business');
  const [passengers, setPassengers] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);

  const vehicle = VEHICLES.find((v) => v.id === selectedVehicle)!;
  const baseFare = vehicle.baseFare;
  const distFare = Math.round(vehicle.perKm * EST_KM);
  const addonTotal = addons.reduce((sum, id) => {
    const a = ADDONS.find((x) => x.id === id);
    return sum + (a ? a.price : 0);
  }, 0);
  const serviceFee = Math.round((baseFare + distFare) * 0.05);
  const total = baseFare + distFare + addonTotal + serviceFee;

  const canBook =
    pickup.trim().length > 0 &&
    dropoff.trim().length > 0 &&
    (rideNow || (schedDate.length > 0 && schedTime.length > 0));

  const handleBook = () => {
    const ref = 'LXR-CAB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    onConfirm(ref);
  };

  const swapLocations = () => {
    const tmp = pickup;
    setPickup(dropoff);
    setDropoff(tmp);
  };

  const toggleAddon = (id: string) =>
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
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
          <Text style={styles.headerTitle}>CAB BOOKING</Text>
          <Text style={styles.headerSub}>Premium Chauffeur Service</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeIcon}>◈</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Route Card ── */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardHeader}>
            <Text style={styles.routeCardTitle}>✦  YOUR ROUTE</Text>
          </View>

          {/* Pickup Row */}
          <View style={styles.locationRow}>
            <View style={styles.locationIconCol}>
              <View style={styles.pickupDot} />
              <View style={styles.routeDashedLine} />
            </View>
            <View style={styles.locationInputCol}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter pickup location"
                placeholderTextColor="#2A2A3A"
                value={pickup}
                onChangeText={setPickup}
                onFocus={() => { setPickupFocus(true); setDropFocus(false); }}
                onBlur={() => setTimeout(() => setPickupFocus(false), 200)}
              />
            </View>
          </View>

          {pickupFocus && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionScroll}
              keyboardShouldPersistTaps="always"
            >
              {PICKUP_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => { setPickup(s); setPickupFocus(false); }}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionIcon}>◎</Text>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Swap Button */}
          <View style={styles.swapRow}>
            <View style={styles.swapLine} />
            <TouchableOpacity onPress={swapLocations} style={styles.swapBtn}>
              <Text style={styles.swapIcon}>⇅</Text>
              <Text style={styles.swapText}>SWAP</Text>
            </TouchableOpacity>
            <View style={styles.swapLine} />
          </View>

          {/* Dropoff Row */}
          <View style={styles.locationRow}>
            <View style={styles.locationIconCol}>
              <View style={styles.routeDashedLine} />
              <View style={styles.dropDot} />
            </View>
            <View style={styles.locationInputCol}>
              <Text style={styles.locationLabel}>DROPOFF</Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter destination"
                placeholderTextColor="#2A2A3A"
                value={dropoff}
                onChangeText={setDropoff}
                onFocus={() => { setDropFocus(true); setPickupFocus(false); }}
                onBlur={() => setTimeout(() => setDropFocus(false), 200)}
              />
            </View>
          </View>

          {dropFocus && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionScroll}
              keyboardShouldPersistTaps="always"
            >
              {DROP_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => { setDropoff(s); setDropFocus(false); }}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionIcon}>▼</Text>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Popular Destinations ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>POPULAR DESTINATIONS</Text>
          </View>
          <View style={styles.quickGrid}>
            {PICKUP_SUGGESTIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                onPress={() => {
                  if (!pickup) setPickup(loc);
                  else if (!dropoff) setDropoff(loc);
                }}
                style={styles.quickChip}
              >
                <Text style={styles.quickChipIcon}>◎</Text>
                <Text style={styles.quickChipText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── When ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>WHEN DO YOU NEED A RIDE</Text>
          </View>
          <View style={styles.whenRow}>
            <TouchableOpacity
              onPress={() => setRideNow(true)}
              style={[styles.whenCard, rideNow && styles.whenCardActive]}
            >
              <Text style={[styles.whenCardIcon, rideNow && styles.whenCardIconActive]}>◉</Text>
              <Text style={[styles.whenCardLabel, rideNow && styles.whenCardLabelActive]}>RIDE NOW</Text>
              <Text style={[styles.whenCardSub, rideNow && styles.whenCardSubActive]}>{vehicle.eta} away</Text>
              {rideNow && <View style={styles.whenCardBar} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRideNow(false)}
              style={[styles.whenCard, !rideNow && styles.whenCardActive]}
            >
              <Text style={[styles.whenCardIcon, !rideNow && styles.whenCardIconActive]}>◷</Text>
              <Text style={[styles.whenCardLabel, !rideNow && styles.whenCardLabelActive]}>SCHEDULE</Text>
              <Text style={[styles.whenCardSub, !rideNow && styles.whenCardSubActive]}>Pick date & time</Text>
              {!rideNow && <View style={styles.whenCardBar} />}
            </TouchableOpacity>
          </View>

          {!rideNow && (
            <View style={styles.schedBox}>
              <Text style={styles.schedLabel}>SELECT DATE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 18 }}
              >
                {SCHED_DATES.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setSchedDate(d)}
                    style={[styles.schedDateChip, schedDate === d && styles.schedDateChipActive]}
                  >
                    <Text style={[styles.schedDateText, schedDate === d && styles.schedDateTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.schedLabel}>SELECT TIME</Text>
              <View style={styles.schedTimeGrid}>
                {SCHED_TIMES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSchedTime(t)}
                    style={[styles.schedTimeChip, schedTime === t && styles.schedTimeChipActive]}
                  >
                    <Text style={[styles.schedTimeText, schedTime === t && styles.schedTimeTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Vehicle Selection ── */}
        <View style={styles.sectionNoH}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>SELECT VEHICLE CLASS</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vehicleScroll}
        >
          {VEHICLES.map((v) => {
            const isSelected = selectedVehicle === v.id;
            const estTotal = v.baseFare + Math.round(v.perKm * EST_KM);
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => {
                  setSelectedVehicle(v.id);
                  setPassengers(Math.min(passengers, v.capacity));
                }}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                activeOpacity={0.85}
              >
                {/* Tag */}
                {v.tag && (
                  <View style={[
                    styles.vehicleTag,
                    v.tag === 'ULTRA' && styles.vehicleTagUltra,
                    v.tag === 'PREMIUM' && styles.vehicleTagPremium,
                  ]}>
                    <Text style={[
                      styles.vehicleTagText,
                      v.tag === 'ULTRA' && styles.vehicleTagTextUltra,
                    ]}>
                      {v.tag}
                    </Text>
                  </View>
                )}

                {/* Image */}
                <View style={styles.vehicleImgWrapper}>
                  <Image
                    source={{ uri: v.image }}
                    style={styles.vehicleImg}
                    resizeMode="cover"
                  />
                  <View style={styles.vehicleImgOverlay} />
                </View>

                {/* Info */}
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleClass, isSelected && styles.vehicleClassSelected]}>
                    {v.class}
                  </Text>
                  <Text style={styles.vehicleModel}>{v.model}</Text>

                  <View style={styles.vehicleStatsRow}>
                    <View style={styles.vehicleStatItem}>
                      <Text style={styles.vehicleStatIcon}>◎</Text>
                      <Text style={styles.vehicleStatText}>{v.capacity} Seats</Text>
                    </View>
                    <View style={styles.vehicleStatDot} />
                    <View style={styles.vehicleStatItem}>
                      <Text style={styles.vehicleStatIcon}>▣</Text>
                      <Text style={styles.vehicleStatText}>{v.luggage} Bags</Text>
                    </View>
                    <View style={styles.vehicleStatDot} />
                    <View style={styles.vehicleStatItem}>
                      <Text style={styles.vehicleStatIcon}>◷</Text>
                      <Text style={styles.vehicleStatText}>{v.eta}</Text>
                    </View>
                  </View>

                  <View style={styles.featureRow}>
                    {v.features.map((f) => (
                      <View key={f} style={styles.featureChip}>
                        <Text style={styles.featureChipText}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.vehiclePriceRow}>
                    <Text style={[styles.vehiclePrice, isSelected && styles.vehiclePriceSelected]}>
                      SAR {estTotal}
                    </Text>
                    <Text style={styles.vehiclePriceSub}>est. fare</Text>
                  </View>
                </View>

                {isSelected && <View style={styles.vehicleSelectedBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Passengers ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>PASSENGERS</Text>
          </View>
          <View style={styles.passengerCard}>
            <View>
              <Text style={styles.passengerLabel}>NUMBER OF PASSENGERS</Text>
              <Text style={styles.passengerSub}>Max {vehicle.capacity} in {vehicle.class} class</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperNum}>{passengers}</Text>
              <TouchableOpacity
                onPress={() => setPassengers(Math.min(vehicle.capacity, passengers + 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Add-ons ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>ADDITIONAL SERVICES</Text>
          </View>
          <View style={styles.addonsGrid}>
            {ADDONS.map((addon) => {
              const isOn = addons.includes(addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  onPress={() => toggleAddon(addon.id)}
                  style={[styles.addonCard, isOn && styles.addonCardActive]}
                >
                  {isOn && (
                    <View style={styles.addonCheck}>
                      <Text style={styles.addonCheckText}>✓</Text>
                    </View>
                  )}
                  <Text style={[styles.addonLabel, isOn && styles.addonLabelActive]}>
                    {addon.label}
                  </Text>
                  <Text style={[styles.addonPrice, isOn && styles.addonPriceActive]}>
                    + SAR {addon.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Fare Estimate ── */}
        <View style={styles.section}>
          <View style={styles.fareCard}>
            <View style={styles.fareHeader}>
              <Text style={styles.fareTitle}>✦  FARE ESTIMATE</Text>
              <Text style={styles.fareTitleSub}>approx. {EST_KM} km route</Text>
            </View>
            <View style={styles.fareBody}>
              <View style={styles.fareRow}>
                <Text style={styles.fareKey}>Base Fare ({vehicle.class})</Text>
                <Text style={styles.fareVal}>SAR {baseFare}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareKey}>Distance Charge (~{EST_KM} km)</Text>
                <Text style={styles.fareVal}>SAR {distFare}</Text>
              </View>
              {addonTotal > 0 && (
                <View style={styles.fareRow}>
                  <Text style={styles.fareKey}>Additional Services</Text>
                  <Text style={styles.fareVal}>SAR {addonTotal}</Text>
                </View>
              )}
              <View style={styles.fareRow}>
                <Text style={styles.fareKey}>Service Fee (5%)</Text>
                <Text style={styles.fareVal}>SAR {serviceFee}</Text>
              </View>
              <View style={styles.fareDivider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareTotalKey}>ESTIMATED TOTAL</Text>
                <Text style={styles.fareTotalVal}>SAR {total}</Text>
              </View>
              <Text style={styles.fareNote}>
                Final fare may vary based on actual distance and waiting time
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Book Button ── */}
      <View style={[styles.bookBar, { paddingBottom: insets.bottom + 12 }]}>
        {!canBook && (
          <Text style={styles.bookHint}>
            {!pickup || !dropoff
              ? 'Enter pickup and dropoff to continue'
              : 'Select a date and time to schedule'}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={!canBook}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>BOOK YOUR RIDE  ✦</Text>
          <Text style={styles.bookBtnSub}>
            {vehicle.class}  ·  {passengers} Passenger{passengers > 1 ? 's' : ''}  ·  SAR {total}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  // Header
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
  headerTitle: { color: '#C9A84C', fontSize: 13, fontWeight: '800', letterSpacing: 4 },
  headerSub: { color: '#55556A', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  headerBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeIcon: { color: '#C9A84C', fontSize: 16 },

  // Route Card
  routeCard: {
    margin: 20, backgroundColor: '#0E0E15',
    borderRadius: 20, borderWidth: 1, borderColor: '#C9A84C20',
    overflow: 'hidden',
  },
  routeCardHeader: {
    backgroundColor: '#C9A84C0A',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
  },
  routeCardTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  locationRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  locationIconCol: {
    width: 24, alignItems: 'center', marginRight: 14, gap: 2,
  },
  pickupDot: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: '#C9A84C', backgroundColor: '#C9A84C40',
  },
  dropDot: {
    width: 12, height: 12, borderRadius: 3,
    backgroundColor: '#C9A84C',
  },
  routeDashedLine: {
    width: 1, height: 20, backgroundColor: '#C9A84C30',
  },
  locationInputCol: { flex: 1 },
  locationLabel: { color: '#55556A', fontSize: 8, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  locationInput: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', paddingVertical: 0 },

  suggestionScroll: { paddingLeft: 18, paddingBottom: 14 },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C20',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, marginRight: 8,
  },
  suggestionIcon: { color: '#C9A84C', fontSize: 10 },
  suggestionText: { color: '#FFFFFFB0', fontSize: 11 },

  swapRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, marginVertical: 2,
  },
  swapLine: { flex: 1, height: 1, backgroundColor: '#C9A84C14' },
  swapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C30',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginHorizontal: 12,
  },
  swapIcon: { color: '#C9A84C', fontSize: 14 },
  swapText: { color: '#C9A84C', fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 4 },
  sectionNoH: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14, marginTop: 20,
  },
  sectionAccent: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#C9A84C' },
  sectionTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },

  // Quick Destinations
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#C9A84C14',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  quickChipIcon: { color: '#C9A84C', fontSize: 10 },
  quickChipText: { color: '#FFFFFF80', fontSize: 11 },

  // When Cards
  whenRow: { flexDirection: 'row', gap: 12 },
  whenCard: {
    flex: 1, backgroundColor: '#0E0E15',
    borderRadius: 16, borderWidth: 1, borderColor: '#C9A84C14',
    padding: 16, alignItems: 'center', overflow: 'hidden',
    position: 'relative',
  },
  whenCardActive: { borderColor: '#C9A84C40', backgroundColor: '#C9A84C08' },
  whenCardIcon: { color: '#55556A', fontSize: 20, marginBottom: 8 },
  whenCardIconActive: { color: '#C9A84C' },
  whenCardLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  whenCardLabelActive: { color: '#C9A84C' },
  whenCardSub: { color: '#55556A', fontSize: 10, textAlign: 'center' },
  whenCardSubActive: { color: '#C9A84C80' },
  whenCardBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#C9A84C',
  },

  // Schedule
  schedBox: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14',
    padding: 16, marginTop: 14,
  },
  schedLabel: { color: '#55556A', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  schedDateChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#13131A',
    borderWidth: 1, borderColor: '#55556A20', marginRight: 8,
  },
  schedDateChipActive: { backgroundColor: '#C9A84C14', borderColor: '#C9A84C' },
  schedDateText: { color: '#55556A', fontSize: 13 },
  schedDateTextActive: { color: '#C9A84C', fontWeight: '700' },
  schedTimeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  schedTimeChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, backgroundColor: '#13131A',
    borderWidth: 1, borderColor: '#55556A20',
  },
  schedTimeChipActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  schedTimeText: { color: '#55556A', fontSize: 12 },
  schedTimeTextActive: { color: '#0A0A0F', fontWeight: '700' },

  // Vehicle Cards
  vehicleScroll: { paddingLeft: 20, paddingRight: 8, paddingBottom: 8 },
  vehicleCard: {
    width: 220, backgroundColor: '#0E0E15',
    borderRadius: 20, borderWidth: 1, borderColor: '#C9A84C14',
    marginRight: 14, overflow: 'hidden', position: 'relative',
  },
  vehicleCardSelected: { borderColor: '#C9A84C50' },
  vehicleTag: {
    position: 'absolute', top: 10, left: 10, zIndex: 10,
    backgroundColor: '#C9A84C',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  vehicleTagUltra: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C' },
  vehicleTagPremium: { backgroundColor: '#C9A84C' },
  vehicleTagText: { color: '#0A0A0F', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  vehicleTagTextUltra: { color: '#C9A84C' },
  vehicleImgWrapper: { height: 130, position: 'relative' },
  vehicleImg: { width: '100%', height: '100%' },
  vehicleImgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F30',
  },
  vehicleInfo: { padding: 14 },
  vehicleClass: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '800',
    letterSpacing: 2, marginBottom: 3,
  },
  vehicleClassSelected: { color: '#C9A84C' },
  vehicleModel: { color: '#55556A', fontSize: 10, marginBottom: 10 },
  vehicleStatsRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  vehicleStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vehicleStatDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#55556A', marginHorizontal: 6 },
  vehicleStatIcon: { color: '#C9A84C', fontSize: 10 },
  vehicleStatText: { color: '#55556A', fontSize: 10 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  featureChip: {
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C20',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5,
  },
  featureChipText: { color: '#C9A84C80', fontSize: 8, fontWeight: '600', letterSpacing: 0.5 },
  vehiclePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  vehiclePrice: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  vehiclePriceSelected: { color: '#C9A84C' },
  vehiclePriceSub: { color: '#55556A', fontSize: 10 },
  vehicleSelectedBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#C9A84C',
  },

  // Passengers
  passengerCard: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14',
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  passengerLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  passengerSub: { color: '#55556A', fontSize: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { color: '#C9A84C', fontSize: 20, fontWeight: '300' },
  stepperNum: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '700',
    minWidth: 30, textAlign: 'center',
  },

  // Add-ons
  addonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addonCard: {
    width: '47%', backgroundColor: '#0E0E15',
    borderRadius: 14, borderWidth: 1, borderColor: '#C9A84C14',
    padding: 14, position: 'relative',
  },
  addonCardActive: { backgroundColor: '#C9A84C08', borderColor: '#C9A84C40' },
  addonCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
  },
  addonCheckText: { color: '#0A0A0F', fontSize: 10, fontWeight: '800' },
  addonLabel: {
    color: '#FFFFFF', fontSize: 11, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 6,
  },
  addonLabelActive: { color: '#C9A84C' },
  addonPrice: { color: '#55556A', fontSize: 12 },
  addonPriceActive: { color: '#C9A84C', fontWeight: '700' },

  // Fare
  fareCard: {
    borderRadius: 18, borderWidth: 1, borderColor: '#C9A84C30', overflow: 'hidden',
  },
  fareHeader: {
    backgroundColor: '#C9A84C0A',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  fareTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  fareTitleSub: { color: '#55556A', fontSize: 10 },
  fareBody: { backgroundColor: '#0E0E15', padding: 18 },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  fareKey: { color: '#55556A', fontSize: 12 },
  fareVal: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  fareDivider: { height: 1, backgroundColor: '#C9A84C20', marginVertical: 6 },
  fareTotalKey: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  fareTotalVal: { color: '#C9A84C', fontSize: 20, fontWeight: '800' },
  fareNote: {
    color: '#55556A', fontSize: 9, marginTop: 10,
    lineHeight: 14, letterSpacing: 0.3,
  },

  // Book Bar
  bookBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1, borderTopColor: '#C9A84C14',
  },
  bookHint: {
    color: '#55556A', fontSize: 10, textAlign: 'center',
    letterSpacing: 0.5, marginBottom: 8,
  },
  bookBtn: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  bookBtnDisabled: { opacity: 0.35 },
  bookBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  bookBtnSub: { color: '#0A0A0F70', fontSize: 10, marginTop: 4 },
});