import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlightSearchParams {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: string;
  tripType: 'roundTrip' | 'oneWay';
}

interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  logo: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  stopInfo?: string;
  price: number;
  originalPrice?: number;
  cabin: string;
  seatsLeft?: number;
  amenities: string[];
  baggage: string;
  refundable: boolean;
  tag?: 'BEST VALUE' | 'FASTEST' | 'CHEAPEST' | 'LUXORA PICK';
}

interface Props {
  searchParams: FlightSearchParams;
  onBack: () => void;
  onBook: (flight: FlightResult) => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const generateFlights = (params: FlightSearchParams): FlightResult[] => [
  {
    id: 'f1',
    airline: 'Saudi Airlines',
    airlineCode: 'SV',
    logo: '🟢',
    flightNumber: 'SV 821',
    departure: '06:00',
    arrival: '08:30',
    duration: '2h 30m',
    stops: 0,
    price: 485,
    originalPrice: 620,
    cabin: params.cabin || 'Economy',
    seatsLeft: 3,
    amenities: ['wifi', 'meal', 'entertainment'],
    baggage: '30 KG',
    refundable: true,
    tag: 'LUXORA PICK',
  },
  {
    id: 'f2',
    airline: 'Emirates',
    airlineCode: 'EK',
    logo: '🔴',
    flightNumber: 'EK 802',
    departure: '09:15',
    arrival: '11:55',
    duration: '2h 40m',
    stops: 0,
    price: 540,
    cabin: params.cabin || 'Economy',
    seatsLeft: 7,
    amenities: ['wifi', 'meal', 'entertainment', 'lounge'],
    baggage: '35 KG',
    refundable: true,
    tag: 'BEST VALUE',
  },
  {
    id: 'f3',
    airline: 'Flydubai',
    airlineCode: 'FZ',
    logo: '🟣',
    flightNumber: 'FZ 201',
    departure: '11:30',
    arrival: '15:45',
    duration: '4h 15m',
    stops: 1,
    stopInfo: '1h 10m in DXB',
    price: 299,
    cabin: params.cabin || 'Economy',
    seatsLeft: 12,
    amenities: ['meal'],
    baggage: '20 KG',
    refundable: false,
    tag: 'CHEAPEST',
  },
  {
    id: 'f4',
    airline: 'Qatar Airways',
    airlineCode: 'QR',
    logo: '🟤',
    flightNumber: 'QR 1102',
    departure: '14:00',
    arrival: '16:10',
    duration: '2h 10m',
    stops: 0,
    price: 612,
    cabin: params.cabin || 'Economy',
    seatsLeft: 5,
    amenities: ['wifi', 'meal', 'entertainment', 'lounge', 'priority'],
    baggage: '40 KG',
    refundable: true,
    tag: 'FASTEST',
  },
  {
    id: 'f5',
    airline: 'Air Arabia',
    airlineCode: 'G9',
    logo: '🟠',
    flightNumber: 'G9 545',
    departure: '18:45',
    arrival: '21:00',
    duration: '2h 15m',
    stops: 0,
    price: 335,
    cabin: params.cabin || 'Economy',
    seatsLeft: 20,
    amenities: ['meal'],
    baggage: '20 KG',
    refundable: false,
  },
  {
    id: 'f6',
    airline: 'Etihad Airways',
    airlineCode: 'EY',
    logo: '🔵',
    flightNumber: 'EY 311',
    departure: '22:30',
    arrival: '00:55+1',
    duration: '2h 25m',
    stops: 0,
    price: 490,
    originalPrice: 550,
    cabin: params.cabin || 'Economy',
    seatsLeft: 8,
    amenities: ['wifi', 'meal', 'entertainment'],
    baggage: '30 KG',
    refundable: true,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0A0A0F',
  card: '#0E0E15',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  goldDim: '#C9A84C14',
  white: '#FFFFFF',
  grey: '#55556A',
  border: '#1A1A2E',
  success: '#2ECC71',
  danger: '#E74C3C',
  cardBorder: '#1C1C2E',
};

const SORT_OPTIONS = ['RECOMMENDED', 'PRICE: LOW', 'PRICE: HIGH', 'DURATION', 'DEPARTURE'];
const FILTER_STOPS = ['ALL', 'NON-STOP', '1 STOP'];
const FILTER_TIMES = ['ALL DAY', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶',
  meal: '🍽️',
  entertainment: '🎬',
  lounge: '🛋️',
  priority: '⭐',
};

const TAG_COLORS: Record<string, string> = {
  'LUXORA PICK': '#C9A84C',
  'BEST VALUE': '#2ECC71',
  FASTEST: '#3498DB',
  CHEAPEST: '#E74C3C',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlightResultsScreen({ searchParams, onBack, onBook }: Props) {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightResult[]>([]);
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [filterStops, setFilterStops] = useState('ALL');
  const [filterTime, setFilterTime] = useState('ALL DAY');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [onlyRefundable, setOnlyRefundable] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      const data = generateFlights(searchParams);
      setFlights(data);
      setFilteredFlights(data);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 1800);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortBy, filterStops, filterTime, onlyRefundable, flights]);

  const applyFiltersAndSort = () => {
    let result = [...flights];
    if (filterStops === 'NON-STOP') result = result.filter(f => f.stops === 0);
    if (filterStops === '1 STOP') result = result.filter(f => f.stops === 1);
    if (filterTime === 'MORNING') result = result.filter(f => parseInt(f.departure) < 12);
    if (filterTime === 'AFTERNOON') result = result.filter(f => parseInt(f.departure) >= 12 && parseInt(f.departure) < 17);
    if (filterTime === 'EVENING') result = result.filter(f => parseInt(f.departure) >= 17 && parseInt(f.departure) < 21);
    if (filterTime === 'NIGHT') result = result.filter(f => parseInt(f.departure) >= 21);
    if (onlyRefundable) result = result.filter(f => f.refundable);
    if (sortBy === 'PRICE: LOW') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'PRICE: HIGH') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'DURATION') result.sort((a, b) => a.duration.localeCompare(b.duration));
    if (sortBy === 'DEPARTURE') result.sort((a, b) => a.departure.localeCompare(b.departure));
    setFilteredFlights(result);
  };

  // ─── Skeleton ───────────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      {[1, 2, 3].map(i => (
        <Animated.View
          key={i}
          style={[styles.skeletonItem, {
            opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
          }]}
        >
          <View style={styles.skeletonRow}>
            <View style={[styles.skeletonBox, { width: 40, height: 40, borderRadius: 20 }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={[styles.skeletonBox, { width: '60%', height: 14, marginBottom: 8 }]} />
              <View style={[styles.skeletonBox, { width: '40%', height: 10 }]} />
            </View>
            <View style={[styles.skeletonBox, { width: 70, height: 30, borderRadius: 8 }]} />
          </View>
          <View style={[styles.skeletonBox, { width: '100%', height: 1, marginVertical: 12 }]} />
          <View style={styles.skeletonRow}>
            <View style={[styles.skeletonBox, { width: 50, height: 22 }]} />
            <View style={[styles.skeletonBox, { width: 80, height: 2, flex: 1, marginHorizontal: 12 }]} />
            <View style={[styles.skeletonBox, { width: 50, height: 22 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  // ─── Flight Card ─────────────────────────────────────────────────────────────

  const renderFlightCard = ({ item }: { item: FlightResult }) => {
    const isExpanded = expandedId === item.id;
    const cabinText = item.cabin ? item.cabin.toUpperCase() : 'ECONOMY';

    return (
      <Animated.View
        style={[
          styles.flightCard,
          item.tag === 'LUXORA PICK' && styles.luxoraPickCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Tag */}
        {item.tag && (
          <View style={[styles.tagBadge, {
            backgroundColor: TAG_COLORS[item.tag] + '22',
            borderColor: TAG_COLORS[item.tag] + '55'
          }]}>
            <Text style={[styles.tagText, { color: TAG_COLORS[item.tag] }]}>{item.tag}</Text>
          </View>
        )}

        <View style={styles.cardMain}>
          {/* Airline Row */}
          <View style={styles.airlineRow}>
            <View style={styles.airlineLogo}>
              <Text style={styles.airlineLogoText}>{item.logo}</Text>
            </View>
            <View style={styles.airlineInfo}>
              <Text style={styles.airlineName}>{item.airline}</Text>
              <Text style={styles.flightNumber}>
                {item.flightNumber} · {cabinText}
              </Text>
            </View>
            <View style={styles.priceBlock}>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>USD {item.originalPrice}</Text>
              )}
              <Text style={styles.price}>USD {item.price}</Text>
              <Text style={styles.perPax}>/ pax</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Route */}
          <View style={styles.routeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>{item.departure}</Text>
              <Text style={styles.airportCode}>{searchParams.fromCode || '---'}</Text>
            </View>
            <View style={styles.durationBlock}>
              <Text style={styles.durationText}>{item.duration}</Text>
              <View style={styles.routeLine}>
                <View style={styles.routeDot} />
                <View style={styles.routeLineBar} />
                {item.stops > 0 && <View style={styles.stopDot} />}
                {item.stops > 0 && <View style={styles.routeLineBar} />}
                <View style={styles.routeDot} />
              </View>
              <Text style={styles.stopsText}>
                {item.stops === 0 ? 'NON-STOP' : `${item.stops} STOP`}
              </Text>
              {item.stopInfo && <Text style={styles.stopInfoText}>{item.stopInfo}</Text>}
            </View>
            <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.timeText}>{item.arrival}</Text>
              <Text style={styles.airportCode}>{searchParams.toCode || '---'}</Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.amenitiesRow}>
              {item.amenities.slice(0, 3).map(a => (
                <Text key={a} style={styles.amenityIcon}>{AMENITY_ICONS[a]}</Text>
              ))}
              {item.amenities.length > 3 && (
                <Text style={styles.moreAmenities}>+{item.amenities.length - 3}</Text>
              )}
              <Text style={styles.baggageText}>🧳 {item.baggage}</Text>
            </View>
            <View style={styles.actionRow}>
              {item.seatsLeft && item.seatsLeft <= 5 && (
                <Text style={styles.seatsLeft}>{item.seatsLeft} LEFT</Text>
              )}
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <Text style={styles.detailsBtnText}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(item)}>
                <Text style={styles.bookBtnText}>BOOK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Expanded */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandDivider} />
            <View style={styles.expandRow}>
              <View style={styles.expandItem}>
                <Text style={styles.expandLabel}>BAGGAGE</Text>
                <Text style={styles.expandValue}>🧳 {item.baggage} Checked</Text>
                <Text style={styles.expandValue}>👜 7 KG Cabin</Text>
              </View>
              <View style={styles.expandItem}>
                <Text style={styles.expandLabel}>REFUND</Text>
                <Text style={[styles.expandValue, {
                  color: item.refundable ? COLORS.success : COLORS.danger
                }]}>
                  {item.refundable ? '✓ Refundable' : '✗ Non-Refundable'}
                </Text>
              </View>
              <View style={styles.expandItem}>
                <Text style={styles.expandLabel}>AMENITIES</Text>
                {item.amenities.map(a => (
                  <Text key={a} style={styles.expandValue}>
                    {AMENITY_ICONS[a]} {a.charAt(0).toUpperCase() + a.slice(1)}
                  </Text>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.selectSeatBtn} onPress={() => onBook(item)}>
              <Text style={styles.selectSeatText}>✦ SELECT & BOOK THIS FLIGHT</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  // ─── Sort Modal ──────────────────────────────────────────────────────────────

  const SortModal = () => (
    <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>SORT FLIGHTS</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.sheetOption, sortBy === opt && styles.sheetOptionActive]}
              onPress={() => { setSortBy(opt); setShowSortModal(false); }}
            >
              <Text style={[styles.sheetOptionText, sortBy === opt && { color: COLORS.gold }]}>{opt}</Text>
              {sortBy === opt && <Text style={styles.checkMark}>✦</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Filter Modal ────────────────────────────────────────────────────────────

  const FilterModal = () => (
    <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
        <View style={[styles.bottomSheet, { maxHeight: '80%' }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>FILTER FLIGHTS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>STOPS</Text>
            <View style={styles.filterChipsRow}>
              {FILTER_STOPS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterChip, filterStops === s && styles.filterChipActive]}
                  onPress={() => setFilterStops(s)}
                >
                  <Text style={[styles.filterChipText, filterStops === s && { color: COLORS.bg }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterSectionTitle}>DEPARTURE TIME</Text>
            <View style={styles.filterChipsRow}>
              {FILTER_TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterChip, filterTime === t && styles.filterChipActive]}
                  onPress={() => setFilterTime(t)}
                >
                  <Text style={[styles.filterChipText, filterTime === t && { color: COLORS.bg }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterSectionTitle}>TICKET TYPE</Text>
            <TouchableOpacity style={styles.toggleRow} onPress={() => setOnlyRefundable(!onlyRefundable)}>
              <Text style={styles.toggleLabel}>Refundable Only</Text>
              <View style={[styles.toggle, onlyRefundable && styles.toggleActive]}>
                <View style={[styles.toggleThumb, onlyRefundable && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
            <Text style={styles.applyBtnText}>APPLY FILTERS</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Header ──────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerRoute}>
          {searchParams.fromCode || '---'} → {searchParams.toCode || '---'}
        </Text>
        <Text style={styles.headerMeta}>
          {searchParams.departDate || ''} · {searchParams.passengers || 1} PAX · {searchParams.cabin?.toUpperCase?.() || 'ECONOMY'}
        </Text>
      </View>
      <TouchableOpacity style={styles.modifyBtn} onPress={onBack}>
        <Text style={styles.modifyText}>MODIFY</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Summary Bar ─────────────────────────────────────────────────────────────

  const renderSummaryBar = () => (
    <View style={styles.summaryBar}>
      <Text style={styles.summaryText}>
        {loading ? 'SEARCHING...' : `${filteredFlights.length} FLIGHTS FOUND`}
      </Text>
      <View style={styles.summaryActions}>
        <TouchableOpacity style={styles.summaryBtn} onPress={() => setShowSortModal(true)}>
          <Text style={styles.summaryBtnText}>⇅ SORT</Text>
        </TouchableOpacity>
        <View style={styles.summaryDivider} />
        <TouchableOpacity style={styles.summaryBtn} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.summaryBtnText}>⊟ FILTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Active Filters ───────────────────────────────────────────────────────────

  const renderActiveFilters = () => {
    const active = [];
    if (sortBy !== 'RECOMMENDED') active.push(sortBy);
    if (filterStops !== 'ALL') active.push(filterStops);
    if (filterTime !== 'ALL DAY') active.push(filterTime);
    if (onlyRefundable) active.push('REFUNDABLE');
    if (active.length === 0) return null;
    return (
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.activeFiltersBar}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {active.map(f => (
          <View key={f} style={styles.activeFilterChip}>
            <Text style={styles.activeFilterText}>{f}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // ─── Empty State ──────────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✈</Text>
      <Text style={styles.emptyTitle}>NO FLIGHTS FOUND</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
      <TouchableOpacity style={styles.resetBtn} onPress={() => {
        setFilterStops('ALL');
        setFilterTime('ALL DAY');
        setOnlyRefundable(false);
        setSortBy('RECOMMENDED');
      }}>
        <Text style={styles.resetBtnText}>RESET FILTERS</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      {renderHeader()}
      {renderSummaryBar()}
      {renderActiveFilters()}
      {loading ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {renderSkeleton()}
        </ScrollView>
      ) : filteredFlights.length === 0 ? renderEmpty() : (
        <FlatList
          data={filteredFlights}
          renderItem={renderFlightCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>✦ LUXORA · PREMIUM TRAVEL EXPERIENCE</Text>
            </View>
          }
        />
      )}
      <SortModal />
      <FilterModal />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.goldDim, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  backIcon: { color: COLORS.gold, fontSize: 18, fontWeight: '300' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRoute: { color: COLORS.white, fontSize: 18, fontWeight: '700', letterSpacing: 3 },
  headerMeta: { color: COLORS.grey, fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  modifyBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: COLORS.gold + '55', backgroundColor: COLORS.goldDim,
  },
  modifyText: { color: COLORS.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingVertical: 10, backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryText: { color: COLORS.white, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  summaryActions: { flexDirection: 'row', alignItems: 'center' },
  summaryBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  summaryBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  summaryDivider: { width: 1, height: 14, backgroundColor: COLORS.border },
  activeFiltersBar: { paddingVertical: 8, backgroundColor: COLORS.bg },
  activeFilterChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: COLORS.goldDim, borderWidth: 1,
    borderColor: COLORS.gold + '44', marginRight: 8,
  },
  activeFilterText: { color: COLORS.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  listContainer: { padding: 16, paddingBottom: 32 },
  flightCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden',
  },
  luxoraPickCard: {
    borderColor: COLORS.gold + '55',
    shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  tagBadge: {
    alignSelf: 'flex-start', marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, borderWidth: 1,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  cardMain: { padding: 16 },
  airlineRow: { flexDirection: 'row', alignItems: 'center' },
  airlineLogo: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.goldDim, borderWidth: 1,
    borderColor: COLORS.gold + '33', alignItems: 'center', justifyContent: 'center',
  },
  airlineLogoText: { fontSize: 22 },
  airlineInfo: { flex: 1, marginLeft: 12 },
  airlineName: { color: COLORS.white, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  flightNumber: { color: COLORS.grey, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  priceBlock: { alignItems: 'flex-end' },
  originalPrice: {
    color: COLORS.grey, fontSize: 10,
    textDecorationLine: 'line-through', letterSpacing: 0.5,
  },
  price: { color: COLORS.goldLight, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  perPax: { color: COLORS.grey, fontSize: 9, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  timeBlock: { alignItems: 'flex-start', minWidth: 50 },
  timeText: { color: COLORS.white, fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  airportCode: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  durationBlock: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  durationText: { color: COLORS.grey, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  routeLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold },
  routeLineBar: { flex: 1, height: 1, backgroundColor: COLORS.gold + '55' },
  stopDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.bg, borderWidth: 2,
    borderColor: COLORS.gold, marginHorizontal: 4,
  },
  stopsText: { color: COLORS.grey, fontSize: 9, letterSpacing: 1.5, marginTop: 4, fontWeight: '700' },
  stopInfoText: { color: COLORS.danger, fontSize: 8, letterSpacing: 0.5, marginTop: 2 },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 14,
  },
  amenitiesRow: { flexDirection: 'row', alignItems: 'center' },
  amenityIcon: { fontSize: 14, marginRight: 4 },
  moreAmenities: { color: COLORS.grey, fontSize: 10, marginRight: 8 },
  baggageText: { color: COLORS.grey, fontSize: 10, letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  seatsLeft: { color: COLORS.danger, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginRight: 8 },
  detailsBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: COLORS.goldDim, borderWidth: 1,
    borderColor: COLORS.gold + '44', alignItems: 'center',
    justifyContent: 'center', marginRight: 6,
  },
  detailsBtnText: { color: COLORS.gold, fontSize: 10 },
  bookBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.gold },
  bookBtnText: { color: COLORS.bg, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  expandedSection: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: COLORS.goldDim },
  expandDivider: { height: 1, backgroundColor: COLORS.gold + '22', marginBottom: 14 },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between' },
  expandItem: { flex: 1 },
  expandLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  expandValue: { color: COLORS.white, fontSize: 11, letterSpacing: 0.3, marginBottom: 3 },
  selectSeatBtn: {
    marginTop: 14, paddingVertical: 12,
    borderRadius: 10, backgroundColor: COLORS.gold, alignItems: 'center',
  },
  selectSeatText: { color: COLORS.bg, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  skeletonCard: { gap: 12 },
  skeletonItem: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  skeletonRow: { flexDirection: 'row', alignItems: 'center' },
  skeletonBox: { backgroundColor: COLORS.border, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: COLORS.gold + '33',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: COLORS.grey,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { color: COLORS.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sheetOptionActive: { backgroundColor: COLORS.goldDim, borderRadius: 8, paddingHorizontal: 12 },
  sheetOptionText: { color: COLORS.white, fontSize: 13, letterSpacing: 1 },
  checkMark: { color: COLORS.gold, fontSize: 14 },
  filterSectionTitle: {
    color: COLORS.gold, fontSize: 10, fontWeight: '800',
    letterSpacing: 2, marginTop: 16, marginBottom: 10,
  },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.gold + '44', backgroundColor: COLORS.goldDim,
  },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterChipText: { color: COLORS.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  toggleLabel: { color: COLORS.white, fontSize: 13, letterSpacing: 0.5 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: COLORS.border, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: COLORS.gold + '33', borderWidth: 1, borderColor: COLORS.gold },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.grey },
  toggleThumbActive: { backgroundColor: COLORS.gold, alignSelf: 'flex-end' },
  applyBtn: {
    marginTop: 20, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.gold, alignItems: 'center',
  },
  applyBtnText: { color: COLORS.bg, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.4 },
  emptyTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  emptySubtitle: { color: COLORS.grey, fontSize: 12, letterSpacing: 1, textAlign: 'center', marginBottom: 24 },
  resetBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
    backgroundColor: COLORS.goldDim, borderWidth: 1, borderColor: COLORS.gold + '55',
  },
  resetBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: COLORS.grey, fontSize: 9, letterSpacing: 2 },
});