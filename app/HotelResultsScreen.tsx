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

interface Hotel {
  id: string;
  name: string;
  brand: string;
  stars: number;
  category: string;
  area: string;
  city: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  tag?: string;
  distanceKm: string;
  refundable: boolean;
  breakfastIncluded: boolean;
}

interface Props {
  searchParams: HotelSearchParams;
  onBack: () => void;
  onSelect: (hotel: Hotel) => void;
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
  danger: '#E74C3C',
  info: '#3498DB',
};

const SORT_OPTIONS = ['RECOMMENDED', 'PRICE: LOW', 'PRICE: HIGH', 'RATING', 'DISTANCE'];

const TAG_COLORS: Record<string, string> = {
  'LUXORA PICK': '#C9A84C',
  'BEST VALUE': '#2ECC71',
  'MOST POPULAR': '#3498DB',
  'NEW LISTING': '#9B59B6',
};

const AMENITY_ICONS: Record<string, string> = {
  wifi: '▲',
  pool: '◈',
  spa: '◆',
  gym: '◉',
  restaurant: '▣',
  parking: '▤',
  concierge: '✦',
  lounge: '◐',
  breakfast: '▸',
  transfer: '▻',
};

// ─── Mock Hotels ──────────────────────────────────────────────────────────────

const generateHotels = (params: HotelSearchParams): Hotel[] => [
  {
    id: 'h1',
    name: 'The Ritz-Carlton',
    brand: 'Ritz-Carlton',
    stars: 5,
    category: 'Ultra Luxury',
    area: 'Downtown',
    city: params.city,
    price: 1250,
    originalPrice: 1600,
    rating: 9.6,
    reviews: 2841,
    image: '◈',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'concierge', 'lounge'],
    tag: 'LUXORA PICK',
    distanceKm: '0.3 km from center',
    refundable: true,
    breakfastIncluded: true,
  },
  {
    id: 'h2',
    name: 'Four Seasons Hotel',
    brand: 'Four Seasons',
    stars: 5,
    category: 'Ultra Luxury',
    area: 'Financial District',
    city: params.city,
    price: 980,
    originalPrice: 1200,
    rating: 9.4,
    reviews: 1923,
    image: '◆',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'lounge', 'transfer'],
    tag: 'MOST POPULAR',
    distanceKm: '0.8 km from center',
    refundable: true,
    breakfastIncluded: true,
  },
  {
    id: 'h3',
    name: 'Mandarin Oriental',
    brand: 'Mandarin Oriental',
    stars: 5,
    category: 'Luxury',
    area: 'Old Town',
    city: params.city,
    price: 820,
    rating: 9.2,
    reviews: 1456,
    image: '◉',
    amenities: ['wifi', 'pool', 'spa', 'restaurant', 'concierge'],
    distanceKm: '1.2 km from center',
    refundable: true,
    breakfastIncluded: false,
  },
  {
    id: 'h4',
    name: 'Hyatt Regency',
    brand: 'Hyatt',
    stars: 5,
    category: 'Luxury',
    area: 'Business Bay',
    city: params.city,
    price: 650,
    originalPrice: 820,
    rating: 8.9,
    reviews: 3102,
    image: '▣',
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
    tag: 'BEST VALUE',
    distanceKm: '2.1 km from center',
    refundable: true,
    breakfastIncluded: true,
  },
  {
    id: 'h5',
    name: 'InterContinental',
    brand: 'IHG',
    stars: 5,
    category: 'Luxury',
    area: 'Corniche',
    city: params.city,
    price: 590,
    rating: 8.7,
    reviews: 2234,
    image: '▤',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant'],
    distanceKm: '3.4 km from center',
    refundable: false,
    breakfastIncluded: false,
  },
  {
    id: 'h6',
    name: 'Waldorf Astoria',
    brand: 'Hilton',
    stars: 5,
    category: 'Ultra Luxury',
    area: 'Palm District',
    city: params.city,
    price: 1450,
    originalPrice: 1800,
    rating: 9.7,
    reviews: 987,
    image: '◐',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'concierge', 'lounge', 'transfer', 'breakfast'],
    tag: 'NEW LISTING',
    distanceKm: '4.2 km from center',
    refundable: true,
    breakfastIncluded: true,
  },
  {
    id: 'h7',
    name: 'Sofitel Luxury',
    brand: 'Accor',
    stars: 4,
    category: 'Premium',
    area: 'City Centre',
    city: params.city,
    price: 380,
    rating: 8.4,
    reviews: 4521,
    image: '▸',
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
    distanceKm: '0.5 km from center',
    refundable: true,
    breakfastIncluded: false,
  },
];

// ─── Star Renderer ─────────────────────────────────────────────────────────────

const Stars = ({ count, size = 10 }: { count: number; size?: number }) => (
  <Text style={{ color: C.gold, fontSize: size, letterSpacing: 1 }}>
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </Text>
);

// ─── Rating Badge ──────────────────────────────────────────────────────────────

const RatingBadge = ({ rating }: { rating: number }) => {
  const color = rating >= 9 ? C.success : rating >= 8 ? C.gold : C.info;
  return (
    <View style={[styles.ratingBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.ratingNum, { color }]}>{rating.toFixed(1)}</Text>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HotelResultsScreen({ searchParams, onBack, onSelect }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [onlyRefundable, setOnlyRefundable] = useState(false);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      const data = generateHotels(searchParams);
      setHotels(data);
      setFiltered(data);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 2000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sortBy, onlyRefundable, onlyBreakfast, maxPrice, hotels]);

  const applyFilters = () => {
    let result = [...hotels];
    if (onlyRefundable) result = result.filter(h => h.refundable);
    if (onlyBreakfast) result = result.filter(h => h.breakfastIncluded);
    result = result.filter(h => h.price <= maxPrice);
    if (sortBy === 'PRICE: LOW') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'PRICE: HIGH') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'RATING') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'DISTANCE') result.sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
    setFiltered(result);
  };

  const totalPerStay = (price: number) => price * searchParams.nights * searchParams.rooms;

  // ─── Skeleton ──────────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <View style={{ padding: 16 }}>
      {[1, 2, 3].map(i => (
        <Animated.View
          key={i}
          style={[
            styles.skeletonCard,
            { opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }
          ]}
        >
          <View style={styles.skeletonImageBox} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={[styles.skeletonLine, { width: '70%', marginBottom: 8 }]} />
            <View style={[styles.skeletonLine, { width: '45%', marginBottom: 12 }]} />
            <View style={[styles.skeletonLine, { width: '55%' }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  // ─── Hotel Card (List) ─────────────────────────────────────────────────────

  const renderHotelCard = ({ item }: { item: Hotel }) => {
    const isExpanded = expandedId === item.id;
    const totalPrice = totalPerStay(item.price);

    return (
      <Animated.View
        style={[
          styles.hotelCard,
          item.tag === 'LUXORA PICK' && styles.luxoraCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Tag */}
        {item.tag && (
          <View style={[
            styles.tagBadge,
            {
              backgroundColor: TAG_COLORS[item.tag] + '18',
              borderColor: TAG_COLORS[item.tag] + '55',
            }
          ]}>
            <Text style={[styles.tagText, { color: TAG_COLORS[item.tag] }]}>
              {item.tag}
            </Text>
          </View>
        )}

        <View style={styles.cardBody}>
          {/* Image Placeholder */}
          <View style={styles.hotelImageBox}>
            <Text style={styles.hotelImageIcon}>{item.image}</Text>
            <View style={styles.starsOverlay}>
              <Stars count={item.stars} size={9} />
            </View>
          </View>

          {/* Info */}
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.hotelBrand}>{item.brand} · {item.category}</Text>
            <Text style={styles.hotelArea}>{item.area}, {item.city}</Text>
            <Text style={styles.hotelDist}>{item.distanceKm}</Text>

            {/* Amenities */}
            <View style={styles.amenitiesRow}>
              {item.amenities.slice(0, 4).map(a => (
                <View key={a} style={styles.amenityPill}>
                  <Text style={styles.amenityPillIcon}>{AMENITY_ICONS[a]}</Text>
                </View>
              ))}
              {item.amenities.length > 4 && (
                <Text style={styles.moreAmenities}>+{item.amenities.length - 4}</Text>
              )}
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {item.refundable && (
                <View style={styles.greenBadge}>
                  <Text style={styles.greenBadgeText}>FREE CANCEL</Text>
                </View>
              )}
              {item.breakfastIncluded && (
                <View style={styles.goldBadge}>
                  <Text style={styles.goldBadgeText}>BREAKFAST</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Price + Actions Row */}
        <View style={styles.priceRow}>
          <View style={styles.ratingBlock}>
            <RatingBadge rating={item.rating} />
            <Text style={styles.reviewCount}>{item.reviews.toLocaleString()} reviews</Text>
          </View>

          <View style={styles.priceBlock}>
            {item.originalPrice && (
              <Text style={styles.oldPrice}>USD {item.originalPrice}</Text>
            )}
            <Text style={styles.price}>USD {item.price}</Text>
            <Text style={styles.priceNight}>/night</Text>
          </View>

          <View style={styles.actionBlock}>
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <Text style={styles.expandBtnText}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectBtn} onPress={() => onSelect(item)}>
              <Text style={styles.selectBtnText}>SELECT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price Strip */}
        <View style={styles.totalStrip}>
          <Text style={styles.totalStripText}>
            {searchParams.nights} nights · {searchParams.rooms} room{searchParams.rooms > 1 ? 's' : ''}
          </Text>
          <Text style={styles.totalStripPrice}>Total: USD {totalPrice.toLocaleString()}</Text>
        </View>

        {/* Expanded Section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandDivider} />
            <Text style={styles.expandTitle}>ALL AMENITIES</Text>
            <View style={styles.expandAmenities}>
              {item.amenities.map(a => (
                <View key={a} style={styles.expandAmenityItem}>
                  <Text style={styles.expandAmenityIcon}>{AMENITY_ICONS[a]}</Text>
                  <Text style={styles.expandAmenityText}>
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.expandPolicies}>
              <View style={styles.expandPolicy}>
                <Text style={styles.expandPolicyLabel}>CANCELLATION</Text>
                <Text style={[
                  styles.expandPolicyValue,
                  { color: item.refundable ? C.success : C.danger }
                ]}>
                  {item.refundable ? 'Free cancellation' : 'Non-refundable'}
                </Text>
              </View>
              <View style={styles.expandPolicy}>
                <Text style={styles.expandPolicyLabel}>BREAKFAST</Text>
                <Text style={[
                  styles.expandPolicyValue,
                  { color: item.breakfastIncluded ? C.success : C.grey }
                ]}>
                  {item.breakfastIncluded ? 'Included' : 'Not included'}
                </Text>
              </View>
              <View style={styles.expandPolicy}>
                <Text style={styles.expandPolicyLabel}>CHECK-IN</Text>
                <Text style={styles.expandPolicyValue}>From 14:00</Text>
              </View>
              <View style={styles.expandPolicy}>
                <Text style={styles.expandPolicyLabel}>CHECK-OUT</Text>
                <Text style={styles.expandPolicyValue}>Until 12:00</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => onSelect(item)}>
              <Text style={styles.bookNowBtnText}>✦ BOOK THIS HOTEL</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  // ─── Sort Modal ────────────────────────────────────────────────────────────

  const SortModal = () => (
    <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>SORT BY</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.sheetOption, sortBy === opt && styles.sheetOptionActive]}
              onPress={() => { setSortBy(opt); setShowSortModal(false); }}
            >
              <Text style={[styles.sheetOptionText, sortBy === opt && { color: C.gold }]}>{opt}</Text>
              {sortBy === opt && <Text style={{ color: C.gold }}>✦</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Filter Modal ──────────────────────────────────────────────────────────

  const FilterModal = () => (
    <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>FILTER HOTELS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>

            <Text style={styles.filterLabel}>MAX PRICE PER NIGHT</Text>
            <View style={styles.priceSliderRow}>
              {[300, 500, 800, 1200, 2000].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priceChip, maxPrice === p && styles.priceChipActive]}
                  onPress={() => setMaxPrice(p)}
                >
                  <Text style={[styles.priceChipText, maxPrice === p && { color: C.bg }]}>
                    {p === 2000 ? 'Any' : `$${p}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>POLICIES</Text>
            <TouchableOpacity style={styles.toggleRow} onPress={() => setOnlyRefundable(!onlyRefundable)}>
              <View>
                <Text style={styles.toggleLabel}>Free Cancellation Only</Text>
                <Text style={styles.toggleSub}>Show only refundable hotels</Text>
              </View>
              <View style={[styles.toggle, onlyRefundable && styles.toggleActive]}>
                <View style={[styles.toggleThumb, onlyRefundable && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleRow} onPress={() => setOnlyBreakfast(!onlyBreakfast)}>
              <View>
                <Text style={styles.toggleLabel}>Breakfast Included</Text>
                <Text style={styles.toggleSub}>Show only hotels with breakfast</Text>
              </View>
              <View style={[styles.toggle, onlyBreakfast && styles.toggleActive]}>
                <View style={[styles.toggleThumb, onlyBreakfast && styles.toggleThumbActive]} />
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

  // ─── Empty State ───────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>◈</Text>
      <Text style={styles.emptyTitle}>NO HOTELS FOUND</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
      <TouchableOpacity style={styles.resetBtn} onPress={() => {
        setOnlyRefundable(false);
        setOnlyBreakfast(false);
        setMaxPrice(2000);
        setSortBy('RECOMMENDED');
      }}>
        <Text style={styles.resetBtnText}>RESET FILTERS</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerRoute}>{searchParams.city.toUpperCase()}</Text>
          <Text style={styles.headerMeta}>
            {searchParams.checkIn} → {searchParams.checkOut} · {searchParams.nights}N · {searchParams.rooms} Room
          </Text>
        </View>
        <TouchableOpacity style={styles.modifyBtn} onPress={onBack}>
          <Text style={styles.modifyText}>MODIFY</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {loading ? 'SEARCHING...' : `${filtered.length} HOTELS FOUND`}
        </Text>
        <View style={styles.summaryRight}>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewModeIcon, viewMode === 'list' && { color: C.gold }]}>▤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'grid' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.viewModeIcon, viewMode === 'grid' && { color: C.gold }]}>▦</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity style={styles.summaryBtn} onPress={() => setShowSortModal(true)}>
            <Text style={styles.summaryBtnText}>⇅ SORT</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity style={styles.summaryBtn} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.summaryBtnText}>⊟ FILTER</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {(onlyRefundable || onlyBreakfast || maxPrice < 2000 || sortBy !== 'RECOMMENDED') && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersBar}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {sortBy !== 'RECOMMENDED' && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{sortBy}</Text>
            </View>
          )}
          {onlyRefundable && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>FREE CANCEL</Text>
            </View>
          )}
          {onlyBreakfast && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>BREAKFAST</Text>
            </View>
          )}
          {maxPrice < 2000 && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>MAX ${maxPrice}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Content */}
      {loading ? renderSkeleton() : filtered.length === 0 ? renderEmpty() : (
        <FlatList
          data={filtered}
          renderItem={renderHotelCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>✦ LUXORA · CURATED LUXURY STAYS</Text>
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
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.goldDim, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: C.gold + '44',
  },
  backIcon: { color: C.gold, fontSize: 18, fontWeight: '300' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRoute: { color: C.white, fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  headerMeta: { color: C.grey, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  modifyBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 6, borderWidth: 1,
    borderColor: C.gold + '55', backgroundColor: C.goldDim,
  },
  modifyText: { color: C.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  summaryText: { color: C.white, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  summaryRight: { flexDirection: 'row', alignItems: 'center' },
  summaryBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  summaryBtnText: { color: C.gold, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  summaryDivider: { width: 1, height: 14, backgroundColor: C.border },
  viewModeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  viewModeBtnActive: {},
  viewModeIcon: { color: C.grey, fontSize: 16 },

  activeFiltersBar: { paddingVertical: 8, backgroundColor: C.bg },
  activeChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '44', marginRight: 8,
  },
  activeChipText: { color: C.gold, fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  listContainer: { padding: 16, paddingBottom: 32 },

  hotelCard: {
    backgroundColor: C.card, borderRadius: 18,
    marginBottom: 14, borderWidth: 1,
    borderColor: C.cardBorder, overflow: 'hidden',
  },
  luxoraCard: {
    borderColor: C.gold + '55',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
  },
  tagBadge: {
    alignSelf: 'flex-start', marginHorizontal: 16,
    marginTop: 12, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 4, borderWidth: 1,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  cardBody: { flexDirection: 'row', padding: 16 },
  hotelImageBox: {
    width: 90, height: 100, borderRadius: 12,
    backgroundColor: C.goldDim2,
    borderWidth: 1, borderColor: C.gold + '33',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  hotelImageIcon: { fontSize: 32, color: C.gold },
  starsOverlay: {
    position: 'absolute', bottom: 6,
    alignSelf: 'center',
  },

  hotelInfo: { flex: 1, marginLeft: 14 },
  hotelName: { color: C.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.3, marginBottom: 3 },
  hotelBrand: { color: C.gold, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 3 },
  hotelArea: { color: C.grey, fontSize: 10, letterSpacing: 0.3, marginBottom: 2 },
  hotelDist: { color: C.grey + '88', fontSize: 9, letterSpacing: 0.5, marginBottom: 8 },

  amenitiesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  amenityPill: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: C.goldDim, borderWidth: 1,
    borderColor: C.gold + '33', alignItems: 'center',
    justifyContent: 'center', marginRight: 4,
  },
  amenityPillIcon: { color: C.gold, fontSize: 9 },
  moreAmenities: { color: C.grey, fontSize: 9, marginLeft: 2 },

  badgeRow: { flexDirection: 'row', gap: 6 },
  greenBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 4, backgroundColor: C.success + '18',
    borderWidth: 1, borderColor: C.success + '44',
  },
  greenBadgeText: { color: C.success, fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  goldBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 4, backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '44',
  },
  goldBadgeText: { color: C.gold, fontSize: 7, fontWeight: '800', letterSpacing: 1 },

  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  ratingBlock: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  ratingBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, marginRight: 6,
  },
  ratingNum: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  reviewCount: { color: C.grey, fontSize: 9, letterSpacing: 0.3 },

  priceBlock: { alignItems: 'flex-end', marginRight: 10 },
  oldPrice: {
    color: C.grey, fontSize: 10,
    textDecorationLine: 'line-through', letterSpacing: 0.3,
  },
  price: { color: C.goldLight, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  priceNight: { color: C.grey, fontSize: 9, letterSpacing: 0.5 },

  actionBlock: { flexDirection: 'row', alignItems: 'center' },
  expandBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: C.goldDim, borderWidth: 1,
    borderColor: C.gold + '44', alignItems: 'center',
    justifyContent: 'center', marginRight: 6,
  },
  expandBtnText: { color: C.gold, fontSize: 10 },
  selectBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 10, backgroundColor: C.gold,
  },
  selectBtnText: { color: C.bg, fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  totalStrip: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: C.goldDim,
    borderTopWidth: 1, borderTopColor: C.gold + '22',
  },
  totalStripText: { color: C.grey, fontSize: 10, letterSpacing: 0.5 },
  totalStripPrice: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  expandedSection: {
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: C.goldDim,
  },
  expandDivider: { height: 1, backgroundColor: C.gold + '22', marginBottom: 14 },
  expandTitle: { color: C.gold, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  expandAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  expandAmenityItem: { flexDirection: 'row', alignItems: 'center' },
  expandAmenityIcon: { color: C.gold, fontSize: 10, marginRight: 4 },
  expandAmenityText: { color: C.white, fontSize: 11, letterSpacing: 0.3 },
  expandPolicies: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, marginBottom: 14,
  },
  expandPolicy: { width: '45%' },
  expandPolicyLabel: { color: C.grey, fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginBottom: 3 },
  expandPolicyValue: { color: C.white, fontSize: 11, letterSpacing: 0.3 },
  bookNowBtn: {
    paddingVertical: 13, borderRadius: 10,
    backgroundColor: C.gold, alignItems: 'center',
  },
  bookNowBtnText: { color: C.bg, fontSize: 12, fontWeight: '800', letterSpacing: 2 },

  skeletonCard: {
    flexDirection: 'row', backgroundColor: C.card,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  skeletonImageBox: {
    width: 90, height: 100, borderRadius: 12,
    backgroundColor: C.border,
  },
  skeletonLine: { height: 12, backgroundColor: C.border, borderRadius: 4 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: C.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.grey + '66',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { color: C.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetOptionActive: {
    backgroundColor: C.goldDim, borderRadius: 8, paddingHorizontal: 12,
  },
  sheetOptionText: { color: C.white, fontSize: 13, letterSpacing: 1 },

  filterLabel: {
    color: C.gold, fontSize: 10, fontWeight: '800',
    letterSpacing: 2, marginTop: 16, marginBottom: 10,
  },
  priceSliderRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  priceChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    borderColor: C.gold + '44', backgroundColor: C.goldDim,
  },
  priceChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  priceChipText: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  toggleLabel: { color: C.white, fontSize: 13, letterSpacing: 0.3 },
  toggleSub: { color: C.grey, fontSize: 10, letterSpacing: 0.3, marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: C.gold + '33', borderWidth: 1, borderColor: C.gold },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.grey },
  toggleThumbActive: { backgroundColor: C.gold, alignSelf: 'flex-end' },
  applyBtn: {
    marginTop: 20, paddingVertical: 14,
    borderRadius: 12, backgroundColor: C.gold, alignItems: 'center',
  },
  applyBtnText: { color: C.bg, fontSize: 13, fontWeight: '800', letterSpacing: 2 },

  emptyState: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 40, paddingTop: 80,
  },
  emptyIcon: { fontSize: 48, color: C.gold + '44', marginBottom: 16 },
  emptyTitle: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  emptySubtitle: { color: C.grey, fontSize: 12, letterSpacing: 1, textAlign: 'center', marginBottom: 24 },
  resetBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.gold + '55',
  },
  resetBtnText: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2 },

  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { color: C.grey, fontSize: 9, letterSpacing: 2 },
});