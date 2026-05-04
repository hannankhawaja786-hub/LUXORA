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

export interface RestaurantBrowseParams {
  city: string;
  cuisine?: string;
  date?: string;
  guests?: number;
}

interface Props {
  onBack: () => void;
  onSelect: (restaurant: Restaurant) => void;
}

const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Al Baik',
    cuisine: 'Saudi Fast Food',
    area: 'Al Olaya',
    city: 'Riyadh',
    rating: 4.8,
    reviews: 12400,
    priceRange: '$$',
    deliveryTime: '20-30 min',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
    tag: 'ICONIC',
    isOpen: true,
    distance: '1.2 km',
    discount: '15% OFF',
    featured: true,
  },
  {
    id: 'r2',
    name: 'Nusret Riyadh',
    cuisine: 'Turkish Steakhouse',
    area: 'King Fahd Rd',
    city: 'Riyadh',
    rating: 4.9,
    reviews: 3200,
    priceRange: '$$$$',
    deliveryTime: '45-60 min',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    tag: 'PREMIUM',
    isOpen: true,
    distance: '3.5 km',
    featured: true,
  },
  {
    id: 'r3',
    name: 'Karam Beirut',
    cuisine: 'Lebanese',
    area: 'Tahlia Street',
    city: 'Riyadh',
    rating: 4.7,
    reviews: 5600,
    priceRange: '$$$',
    deliveryTime: '30-45 min',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tag: 'POPULAR',
    isOpen: true,
    distance: '2.1 km',
    discount: '10% OFF',
  },
  {
    id: 'r4',
    name: 'Nobu Riyadh',
    cuisine: 'Japanese Fusion',
    area: 'Four Seasons Hotel',
    city: 'Riyadh',
    rating: 4.9,
    reviews: 1800,
    priceRange: '$$$$',
    deliveryTime: '60-75 min',
    image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80',
    tag: 'LUXURY',
    isOpen: true,
    distance: '4.8 km',
  },
  {
    id: 'r5',
    name: 'Shawarma House',
    cuisine: 'Middle Eastern',
    area: 'Al Malaz',
    city: 'Riyadh',
    rating: 4.5,
    reviews: 8900,
    priceRange: '$',
    deliveryTime: '15-25 min',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    distance: '0.8 km',
    discount: '20% OFF',
  },
  {
    id: 'r6',
    name: 'Tatel Madrid',
    cuisine: 'Spanish Fine Dining',
    area: 'Al Nakheel',
    city: 'Riyadh',
    rating: 4.8,
    reviews: 920,
    priceRange: '$$$$',
    deliveryTime: '50-65 min',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    isOpen: false,
    distance: '6.2 km',
  },
  {
    id: 'r7',
    name: 'Burger Boutique',
    cuisine: 'Gourmet Burgers',
    area: 'Hittin',
    city: 'Riyadh',
    rating: 4.6,
    reviews: 6700,
    priceRange: '$$',
    deliveryTime: '25-35 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isOpen: true,
    distance: '2.9 km',
    discount: '5% OFF',
  },
  {
    id: 'r8',
    name: 'Mezzaluna',
    cuisine: 'Italian',
    area: 'Al Sulimaniyah',
    city: 'Riyadh',
    rating: 4.7,
    reviews: 2300,
    priceRange: '$$$',
    deliveryTime: '35-50 min',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    tag: 'RECOMMENDED',
    isOpen: true,
    distance: '3.3 km',
  },
];

const CITIES = ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'NEOM'];
const CUISINES = ['All', 'Saudi', 'Lebanese', 'Japanese', 'Turkish', 'Italian', 'Fast Food', 'Fine Dining'];
const SORT_OPTIONS = ['Rating', 'Distance', 'Price: Low', 'Price: High', 'Delivery'];

export default function RestaurantBrowseScreen({ onBack, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState('Riyadh');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('Rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState(2);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filtered = RESTAURANTS.filter((r) => {
    const matchCity = r.city === selectedCity;
    const matchCuisine =
      selectedCuisine === 'All' ||
      r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
    const matchSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchOpen = showOpenOnly ? r.isOpen : true;
    return matchCity && matchCuisine && matchSearch && matchOpen;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'Distance') return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === 'Price: Low') return a.priceRange.length - b.priceRange.length;
    if (sortBy === 'Price: High') return b.priceRange.length - a.priceRange.length;
    return 0;
  });

  const featured = sorted.filter((r) => r.featured);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>DINING</Text>
          <Text style={styles.headerSub}>Discover Finest Restaurants</Text>
        </View>
        <View style={styles.guestBadge}>
          <Text style={styles.guestBadgeLabel}>GUEST</Text>
          <Text style={styles.guestCount}>{guests}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchGlyph}>◈</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisine..."
            placeholderTextColor="#55556A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* City */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cityScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setSelectedCity(city)}
              style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Guests + Open */}
        <View style={styles.filterRow}>
          <View style={styles.guestControl}>
            <Text style={styles.filterLabel}>GUESTS</Text>
            <View style={styles.guestRow}>
              <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.guestBtn}>
                <Text style={styles.guestBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.guestNum}>{guests}</Text>
              <TouchableOpacity onPress={() => setGuests(Math.min(20, guests + 1))} style={styles.guestBtn}>
                <Text style={styles.guestBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowOpenOnly(!showOpenOnly)}
            style={[styles.openToggle, showOpenOnly && styles.openToggleActive]}
          >
            <View style={[styles.openDot, showOpenOnly && styles.openDotActive]} />
            <Text style={[styles.openToggleText, showOpenOnly && styles.openToggleTextActive]}>OPEN NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Cuisine */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
        >
          {CUISINES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedCuisine(c)}
              style={[styles.cuisineChip, selectedCuisine === c && styles.cuisineChipActive]}
            >
              <Text style={[styles.cuisineText, selectedCuisine === c && styles.cuisineTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        >
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
                {sortBy === s ? '✦ ' : ''}{s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        {featured.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✦  FEATURED TONIGHT</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {featured.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.featuredCard}
                  onPress={() => onSelect(r)}
                  activeOpacity={0.85}
                >
                  <View style={styles.featuredImageWrapper}>
                    <Image
                      source={{ uri: r.image }}
                      style={styles.featuredImage}
                      resizeMode="cover"
                    />
                    <View style={styles.featuredImageOverlay} />
                  </View>
                  {r.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{r.tag}</Text>
                    </View>
                  )}
                  {r.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{r.discount}</Text>
                    </View>
                  )}
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName}>{r.name}</Text>
                    <Text style={styles.featuredCuisine}>{r.cuisine}</Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.ratingText}>★ {r.rating}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.priceText}>{r.priceRange}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.distText}>{r.distance}</Text>
                    </View>
                    <View style={styles.deliveryRow}>
                      <Text style={styles.deliveryText}>▸ {r.deliveryTime}</Text>
                      {!r.isOpen && (
                        <View style={styles.closedPill}>
                          <Text style={styles.closedPillText}>CLOSED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ALL RESTAURANTS</Text>
            <Text style={styles.resultCount}>{sorted.length} found</Text>
          </View>

          {sorted.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.listCard, !r.isOpen && styles.listCardClosed]}
              onPress={() => onSelect(r)}
              activeOpacity={0.85}
            >
              <View style={styles.listImageWrapper}>
                <Image
                  source={{ uri: r.image }}
                  style={styles.listImage}
                  resizeMode="cover"
                />
                {!r.isOpen && <View style={styles.closedOverlay} />}
              </View>

              <View style={styles.listInfo}>
                <View style={styles.listTopRow}>
                  <Text style={styles.listName}>{r.name}</Text>
                  {r.tag && (
                    <View style={styles.listTag}>
                      <Text style={styles.listTagText}>{r.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.listCuisine}>{r.cuisine}  ·  {r.area}</Text>
                <View style={styles.listMeta}>
                  <Text style={styles.ratingText}>★ {r.rating}</Text>
                  <Text style={styles.reviewCount}>({r.reviews.toLocaleString()})</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.priceText}>{r.priceRange}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.distText}>{r.distance}</Text>
                </View>
                <View style={styles.listBottomRow}>
                  <Text style={styles.deliveryText}>▸ {r.deliveryTime}</Text>
                  {r.discount && <Text style={styles.listDiscount}>{r.discount}</Text>}
                  {!r.isOpen && (
                    <View style={styles.closedPill}>
                      <Text style={styles.closedPillText}>CLOSED</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C9A84C14',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#C9A84C', fontSize: 20 },
  headerTitle: { color: '#C9A84C', fontSize: 18, fontWeight: '700', letterSpacing: 4 },
  headerSub: { color: '#55556A', fontSize: 11, letterSpacing: 1 },
  guestBadge: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  guestBadgeLabel: { color: '#C9A84C80', fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  guestCount: { color: '#C9A84C', fontSize: 15, fontWeight: '700' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    margin: 20, backgroundColor: '#0E0E15',
    borderRadius: 14, borderWidth: 1, borderColor: '#C9A84C20',
    paddingHorizontal: 16, height: 50,
  },
  searchGlyph: { color: '#C9A84C60', fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, letterSpacing: 0.5 },
  clearBtn: { color: '#55556A', fontSize: 16, paddingLeft: 8 },

  cityScroll: { marginBottom: 16 },
  cityChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#55556A40', marginRight: 10,
  },
  cityChipActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  cityChipText: { color: '#55556A', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  cityChipTextActive: { color: '#0A0A0F' },

  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16,
  },
  filterLabel: { color: '#55556A', fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  guestControl: {},
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  guestBtnText: { color: '#C9A84C', fontSize: 18, fontWeight: '300' },
  guestNum: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  openToggle: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#0E0E15',
    borderWidth: 1, borderColor: '#55556A30', gap: 8,
  },
  openToggleActive: { backgroundColor: '#1A2A1A', borderColor: '#4CAF50' },
  openDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#55556A' },
  openDotActive: { backgroundColor: '#4CAF50' },
  openToggleText: { color: '#55556A', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  openToggleTextActive: { color: '#4CAF50' },

  cuisineChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#55556A30', marginRight: 8,
  },
  cuisineChipActive: { backgroundColor: '#C9A84C14', borderColor: '#C9A84C' },
  cuisineText: { color: '#55556A', fontSize: 12, letterSpacing: 0.5 },
  cuisineTextActive: { color: '#C9A84C', fontWeight: '600' },

  sortChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: '#55556A20', marginRight: 8,
  },
  sortChipActive: { borderColor: '#C9A84C40', backgroundColor: '#C9A84C08' },
  sortText: { color: '#55556A', fontSize: 11, letterSpacing: 0.5 },
  sortTextActive: { color: '#C9A84C', fontWeight: '600' },

  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16,
  },
  sectionTitle: {
    color: '#C9A84C', fontSize: 11, fontWeight: '700',
    letterSpacing: 3, paddingHorizontal: 20, marginBottom: 16,
  },
  resultCount: { color: '#55556A', fontSize: 12 },

  featuredCard: {
    width: 240, backgroundColor: '#0E0E15',
    borderRadius: 20, marginRight: 16,
    borderWidth: 1, borderColor: '#C9A84C20', overflow: 'hidden',
  },
  featuredImageWrapper: { height: 150, position: 'relative' },
  featuredImage: { width: '100%', height: '100%' },
  featuredImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F30',
  },
  tagBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#C9A84C',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  tagText: { color: '#0A0A0F', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  discountBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#1A2A1A', borderWidth: 1, borderColor: '#4CAF50',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  discountText: { color: '#4CAF50', fontSize: 9, fontWeight: '700' },
  featuredInfo: { padding: 14 },
  featuredName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  featuredCuisine: { color: '#55556A', fontSize: 11, marginBottom: 8 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  listCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14', padding: 12,
  },
  listCardClosed: { opacity: 0.5 },
  listImageWrapper: {
    width: 75, height: 75, borderRadius: 12,
    overflow: 'hidden', marginRight: 14, position: 'relative',
  },
  listImage: { width: '100%', height: '100%' },
  closedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0A0A0F70' },
  listInfo: { flex: 1 },
  listTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  listName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  listTag: {
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C30',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  listTagText: { color: '#C9A84C', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  listCuisine: { color: '#55556A', fontSize: 11, marginBottom: 5 },
  listMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  listBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listDiscount: { color: '#4CAF50', fontSize: 10, fontWeight: '700' },
  closedPill: {
    backgroundColor: '#FF444414', borderWidth: 1, borderColor: '#FF444430',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  closedPillText: { color: '#FF4444', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  chevron: { color: '#C9A84C', fontSize: 22, marginLeft: 8 },

  ratingText: { color: '#F0C040', fontSize: 12, fontWeight: '700' },
  reviewCount: { color: '#55556A', fontSize: 10, marginLeft: 3 },
  metaDot: { color: '#55556A', marginHorizontal: 5 },
  priceText: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  distText: { color: '#55556A', fontSize: 11 },
  deliveryText: { color: '#55556A', fontSize: 11 },
});