import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onBack: () => void;
  onBook: (ref: string) => void;
}

interface Tour {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  region: string;
  duration: string;
  groupSize: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  tag?: string;
  highlights: string[];
  includes: string[];
  difficulty: string;
  language: string[];
  nextAvailable: string;
}

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'desert', label: 'DESERT' },
  { id: 'heritage', label: 'HERITAGE' },
  { id: 'adventure', label: 'ADVENTURE' },
  { id: 'marine', label: 'MARINE' },
  { id: 'cultural', label: 'CULTURAL' },
  { id: 'private', label: 'PRIVATE' },
];

const TOURS: Tour[] = [
  {
    id: 't1',
    title: 'Empty Quarter Dune Safari',
    subtitle: 'Rub al Khali Overnight Expedition',
    location: 'Rub al Khali Desert',
    region: 'Southern Saudi Arabia',
    duration: '2 Days / 1 Night',
    groupSize: 'Max 8 Guests',
    price: 2800,
    originalPrice: 3400,
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
    category: 'desert',
    tag: 'BESTSELLER',
    highlights: ['Camel Trek at Sunrise', 'Bedouin Camp Dinner', 'Stargazing Session', 'Dune Bashing'],
    includes: ['Private 4x4 Transfer', 'Luxury Camp Stay', 'All Meals', 'Expert Guide'],
    difficulty: 'MODERATE',
    language: ['English', 'Arabic'],
    nextAvailable: 'Thu 30 Apr',
  },
  {
    id: 't2',
    title: 'AlUla Heritage & Hegra',
    subtitle: 'UNESCO World Heritage Private Tour',
    location: 'AlUla',
    region: 'Medina Province',
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 6 Guests',
    price: 5500,
    originalPrice: 6200,
    rating: 5.0,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80',
    category: 'heritage',
    tag: 'EXCLUSIVE',
    highlights: ['Hegra Tombs Private Access', 'Elephant Rock Sunset', 'Dadan Ancient City', 'Hot Air Balloon'],
    includes: ['Luxury Desert Lodge', 'Private Archaeologist Guide', 'Fine Dining', 'Airport Transfers'],
    difficulty: 'EASY',
    language: ['English', 'Arabic', 'French'],
    nextAvailable: 'Fri 1 May',
  },
  {
    id: 't3',
    title: 'Red Sea Dive Expedition',
    subtitle: 'Pristine Coral Reef Discovery',
    location: 'NEOM Coastline',
    region: 'Tabuk Province',
    duration: '1 Day',
    groupSize: 'Max 4 Guests',
    price: 1200,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    category: 'marine',
    tag: 'NEW',
    highlights: ['2 Guided Dive Sites', 'Coral Garden Snorkel', 'Marine Biologist On Board', 'Underwater Photography'],
    includes: ['Dive Equipment', 'Luxury Yacht', 'Gourmet Lunch', 'Insurance'],
    difficulty: 'MODERATE',
    language: ['English', 'Arabic'],
    nextAvailable: 'Wed 29 Apr',
  },
  {
    id: 't4',
    title: 'Riyadh Royal Heritage Walk',
    subtitle: 'Diriyah to Masmak Private Experience',
    location: 'Riyadh',
    region: 'Riyadh Province',
    duration: 'Half Day',
    groupSize: 'Max 10 Guests',
    price: 650,
    rating: 4.7,
    reviews: 421,
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80',
    category: 'cultural',
    highlights: ['Diriyah At-Turaif Quarter', 'Masmak Fortress', 'Al Bujairi Heritage Park', 'Traditional Souq'],
    includes: ['Private Expert Guide', 'Traditional Lunch', 'Museum Entry', 'Transport'],
    difficulty: 'EASY',
    language: ['English', 'Arabic', 'Urdu'],
    nextAvailable: 'Today',
  },
  {
    id: 't5',
    title: 'Asir Mountain Retreat',
    subtitle: 'Cloud Forest & Village Immersion',
    location: 'Abha',
    region: 'Asir Province',
    duration: '2 Days / 1 Night',
    groupSize: 'Max 6 Guests',
    price: 1900,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'adventure',
    highlights: ['Cable Car Panorama', 'Traditional Village Stay', 'Asir National Park Hike', 'Local Cuisine Experience'],
    includes: ['Mountain Lodge', 'All Meals', 'Trekking Guide', 'Transfers'],
    difficulty: 'MODERATE',
    language: ['English', 'Arabic'],
    nextAvailable: 'Sat 2 May',
  },
  {
    id: 't6',
    title: 'NEOM Futuristic Expedition',
    subtitle: 'Exclusive Access to The Line & Sindalah',
    location: 'NEOM',
    region: 'Tabuk Province',
    duration: '2 Days / 1 Night',
    groupSize: 'Max 4 Guests',
    price: 8500,
    rating: 5.0,
    reviews: 44,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
    category: 'private',
    tag: 'ULTRA',
    highlights: ['Private NEOM Site Tour', 'Sindalah Yacht Marina', 'Architecture Briefing', 'Helicopter Transfer'],
    includes: ['Helicopter Flight', '5-Star Suite', 'Private Chef', 'Dedicated Host'],
    difficulty: 'EASY',
    language: ['English', 'Arabic'],
    nextAvailable: 'By Request',
  },
  {
    id: 't7',
    title: 'Jeddah Old Town & Corniche',
    subtitle: 'Al Balad Night & Seafront Sunset',
    location: 'Jeddah',
    region: 'Makkah Province',
    duration: 'Full Day',
    groupSize: 'Max 12 Guests',
    price: 480,
    originalPrice: 600,
    rating: 4.6,
    reviews: 534,
    image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&q=80',
    category: 'cultural',
    highlights: ['Al Balad UNESCO District', 'King Fahd Fountain View', 'Seafood Corniche Dinner', 'Art Gallery Visit'],
    includes: ['Private Guide', 'Dinner', 'Transport', 'Museum Entry'],
    difficulty: 'EASY',
    language: ['English', 'Arabic', 'Urdu'],
    nextAvailable: 'Tomorrow',
  },
  {
    id: 't8',
    title: 'Tabuk Rock Art Wilderness',
    subtitle: 'Ancient Petroglyphs & Wadi Trekking',
    location: 'Tabuk',
    region: 'Tabuk Province',
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 8 Guests',
    price: 3200,
    rating: 4.8,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    category: 'adventure',
    tag: 'RARE',
    highlights: ['10,000-Year-Old Rock Art', 'Wadi Disah Canyon', 'Wild Camp Under Stars', 'Geology Expert Guide'],
    includes: ['Wild Luxury Camping', 'All Meals', 'Equipment', 'Expert Guides x2'],
    difficulty: 'CHALLENGING',
    language: ['English', 'Arabic'],
    nextAvailable: 'Sun 3 May',
  },
];

const SORT_OPTIONS = ['RECOMMENDED', 'PRICE: LOW', 'PRICE: HIGH', 'TOP RATED', 'DURATION'];

export default function ToursExperiencesScreen({ onBack, onBook }: Props) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [showSort, setShowSort] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [guests, setGuests] = useState(2);

  const filtered = TOURS.filter(
    (t) => activeCategory === 'all' || t.category === activeCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'PRICE: LOW') return a.price - b.price;
    if (sortBy === 'PRICE: HIGH') return b.price - a.price;
    if (sortBy === 'TOP RATED') return b.rating - a.rating;
    return 0;
  });

  const handleBook = () => {
    const ref = 'LXR-TOUR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    onBook(ref);
  };

  if (selectedTour) {
    return (
      <TourDetailView
        tour={selectedTour}
        guests={guests}
        onGuests={setGuests}
        onBack={() => setSelectedTour(null)}
        onBook={handleBook}
        insets={insets}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>TOURS & EXPERIENCES</Text>
          <Text style={styles.headerSub}>Curated Saudi Arabia Journeys</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSort(!showSort)} style={styles.sortBtnHeader}>
          <Text style={styles.sortBtnHeaderIcon}>◈</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => { setSortBy(opt); setShowSort(false); }}
              style={[styles.sortOption, sortBy === opt && styles.sortOptionActive]}
            >
              <Text style={[styles.sortOptionText, sortBy === opt && styles.sortOptionTextActive]}>
                {opt}
              </Text>
              {sortBy === opt && <Text style={styles.sortCheckmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryChipText, activeCategory === cat.id && styles.categoryChipTextActive]}>
              {cat.label}
            </Text>
            {activeCategory === cat.id && <View style={styles.categoryChipBar} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{sorted.length} EXPERIENCES FOUND</Text>
        <TouchableOpacity onPress={() => setShowSort(!showSort)}>
          <Text style={styles.sortLabel}>SORT: {sortBy}  ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Tour List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
        {sorted.map((tour) => (
          <TouchableOpacity
            key={tour.id}
            onPress={() => setSelectedTour(tour)}
            style={styles.tourCard}
            activeOpacity={0.88}
          >
            {/* Image */}
            <View style={styles.tourImgWrapper}>
              <Image source={{ uri: tour.image }} style={styles.tourImg} resizeMode="cover" />
              <View style={styles.tourImgGradient} />

              {tour.tag && (
                <View style={[
                  styles.tourTag,
                  tour.tag === 'ULTRA' && styles.tourTagUltra,
                  tour.tag === 'EXCLUSIVE' && styles.tourTagExclusive,
                  tour.tag === 'NEW' && styles.tourTagNew,
                  tour.tag === 'RARE' && styles.tourTagRare,
                ]}>
                  <Text style={[
                    styles.tourTagText,
                    (tour.tag === 'ULTRA' || tour.tag === 'EXCLUSIVE') && styles.tourTagTextDark,
                  ]}>
                    {tour.tag}
                  </Text>
                </View>
              )}

              <View style={styles.tourImgBottom}>
                <View style={styles.tourRatingBadge}>
                  <Text style={styles.tourRatingStar}>★</Text>
                  <Text style={styles.tourRatingVal}>{tour.rating}</Text>
                  <Text style={styles.tourRatingCount}>({tour.reviews})</Text>
                </View>
                <View style={styles.tourDiffBadge}>
                  <Text style={styles.tourDiffText}>{tour.difficulty}</Text>
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={styles.tourInfo}>
              <View style={styles.tourLocationRow}>
                <Text style={styles.tourLocationDot}>◎</Text>
                <Text style={styles.tourLocation}>{tour.location}  ·  {tour.region}</Text>
              </View>
              <Text style={styles.tourTitle}>{tour.title}</Text>
              <Text style={styles.tourSubtitle}>{tour.subtitle}</Text>

              <View style={styles.tourMetaRow}>
                <View style={styles.tourMeta}>
                  <Text style={styles.tourMetaIcon}>◷</Text>
                  <Text style={styles.tourMetaText}>{tour.duration}</Text>
                </View>
                <View style={styles.tourMetaDot} />
                <View style={styles.tourMeta}>
                  <Text style={styles.tourMetaIcon}>◎</Text>
                  <Text style={styles.tourMetaText}>{tour.groupSize}</Text>
                </View>
                <View style={styles.tourMetaDot} />
                <View style={styles.tourMeta}>
                  <Text style={styles.tourMetaIcon}>▷</Text>
                  <Text style={styles.tourMetaText}>{tour.nextAvailable}</Text>
                </View>
              </View>

              <View style={styles.highlightRow}>
                {tour.highlights.slice(0, 3).map((h) => (
                  <View key={h} style={styles.highlightChip}>
                    <Text style={styles.highlightChipText}>{h}</Text>
                  </View>
                ))}
                {tour.highlights.length > 3 && (
                  <View style={styles.highlightMore}>
                    <Text style={styles.highlightMoreText}>+{tour.highlights.length - 3}</Text>
                  </View>
                )}
              </View>

              <View style={styles.tourPriceRow}>
                <View>
                  <Text style={styles.tourPriceLabel}>FROM</Text>
                  <View style={styles.tourPriceGroup}>
                    <Text style={styles.tourPrice}>SAR {tour.price.toLocaleString()}</Text>
                    {tour.originalPrice && (
                      <Text style={styles.tourOriginalPrice}>SAR {tour.originalPrice.toLocaleString()}</Text>
                    )}
                  </View>
                  <Text style={styles.tourPricePer}>per person</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedTour(tour)} style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>VIEW DETAILS</Text>
                  <Text style={styles.viewBtnArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour Detail View (internal component)
// ─────────────────────────────────────────────────────────────────────────────

interface DetailProps {
  tour: Tour;
  guests: number;
  onGuests: (n: number) => void;
  onBack: () => void;
  onBook: () => void;
  insets: { top: number; bottom: number };
}

function TourDetailView({ tour, guests, onGuests, onBack, onBook, insets }: DetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'includes' | 'itinerary'>('overview');
  const totalPrice = tour.price * guests;

  const TABS: Array<'overview' | 'includes' | 'itinerary'> = ['overview', 'includes', 'itinerary'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Hero Image */}
      <View style={styles.heroWrapper}>
        <Image source={{ uri: tour.image }} style={styles.heroImg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <TouchableOpacity onPress={onBack} style={[styles.heroBack]}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        {tour.tag && (
          <View style={[
            styles.heroTag,
            tour.tag === 'ULTRA' && styles.tourTagUltra,
            tour.tag === 'EXCLUSIVE' && styles.tourTagExclusive,
          ]}>
            <Text style={[styles.tourTagText, (tour.tag === 'ULTRA' || tour.tag === 'EXCLUSIVE') && styles.tourTagTextDark]}>
              {tour.tag}
            </Text>
          </View>
        )}
        <View style={styles.heroBottom}>
          <Text style={styles.heroLocation}>{tour.location}  ·  {tour.region}</Text>
          <Text style={styles.heroTitle}>{tour.title}</Text>
          <Text style={styles.heroSubtitle}>{tour.subtitle}</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>★ {tour.rating}</Text>
              <Text style={styles.heroStatLabel}>RATING</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{tour.reviews}</Text>
              <Text style={styles.heroStatLabel}>REVIEWS</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{tour.difficulty}</Text>
              <Text style={styles.heroStatLabel}>LEVEL</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{tour.nextAvailable}</Text>
              <Text style={styles.heroStatLabel}>NEXT DATE</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Stats Strip */}
        <View style={styles.quickStrip}>
          <View style={styles.quickStripItem}>
            <Text style={styles.quickStripIcon}>◷</Text>
            <Text style={styles.quickStripVal}>{tour.duration}</Text>
          </View>
          <View style={styles.quickStripDiv} />
          <View style={styles.quickStripItem}>
            <Text style={styles.quickStripIcon}>◎</Text>
            <Text style={styles.quickStripVal}>{tour.groupSize}</Text>
          </View>
          <View style={styles.quickStripDiv} />
          <View style={styles.quickStripItem}>
            <Text style={styles.quickStripIcon}>▷</Text>
            <Text style={styles.quickStripVal}>{tour.language.join(' · ')}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.toUpperCase()}
              </Text>
              {activeTab === tab && <View style={styles.tabBar} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View>
              <View style={styles.detailSectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>HIGHLIGHTS</Text>
              </View>
              {tour.highlights.map((h, i) => (
                <View key={i} style={styles.detailListRow}>
                  <View style={styles.detailListDot} />
                  <Text style={styles.detailListText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'includes' && (
            <View>
              <View style={styles.detailSectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>WHAT IS INCLUDED</Text>
              </View>
              {tour.includes.map((item, i) => (
                <View key={i} style={styles.detailListRow}>
                  <View style={styles.includeCheck}>
                    <Text style={styles.includeCheckText}>✓</Text>
                  </View>
                  <Text style={styles.detailListText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'itinerary' && (
            <View>
              <View style={styles.detailSectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>EXPERIENCE TIMELINE</Text>
              </View>
              {tour.highlights.map((h, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDot} />
                    {i < tour.highlights.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStep}>STEP {i + 1}</Text>
                    <Text style={styles.timelineText}>{h}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Guest Count */}
        <View style={styles.guestSection}>
          <View style={styles.detailSectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>NUMBER OF GUESTS</Text>
          </View>
          <View style={styles.guestCard}>
            <View>
              <Text style={styles.guestLabel}>GUESTS</Text>
              <Text style={styles.guestSub}>{tour.groupSize}</Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => onGuests(Math.max(1, guests - 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperNum}>{guests}</Text>
              <TouchableOpacity
                onPress={() => onGuests(Math.min(8, guests + 1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <View style={styles.fareCard}>
            <View style={styles.fareHeader}>
              <Text style={styles.fareTitle}>✦  PRICE SUMMARY</Text>
            </View>
            <View style={styles.fareBody}>
              <View style={styles.fareRow}>
                <Text style={styles.fareKey}>Tour Rate (per person)</Text>
                <Text style={styles.fareVal}>SAR {tour.price.toLocaleString()}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareKey}>Guests</Text>
                <Text style={styles.fareVal}>x {guests}</Text>
              </View>
              {tour.originalPrice && (
                <View style={styles.fareRow}>
                  <Text style={styles.fareKey}>You Save</Text>
                  <Text style={styles.savingsVal}>SAR {((tour.originalPrice - tour.price) * guests).toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.fareDivider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareTotalKey}>TOTAL</Text>
                <Text style={styles.fareTotalVal}>SAR {totalPrice.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Book Bar */}
      <View style={[styles.bookBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>BOOK THIS EXPERIENCE  ✦</Text>
          <Text style={styles.bookBtnSub}>
            {guests} Guest{guests > 1 ? 's' : ''}  ·  {tour.duration}  ·  SAR {totalPrice.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
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
  sortBtnHeader: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  sortBtnHeaderIcon: { color: '#C9A84C', fontSize: 16 },

  // Sort Dropdown
  sortDropdown: {
    marginHorizontal: 20, backgroundColor: '#0E0E15',
    borderRadius: 14, borderWidth: 1, borderColor: '#C9A84C20',
    overflow: 'hidden', zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C0A',
  },
  sortOptionActive: { backgroundColor: '#C9A84C08' },
  sortOptionText: { color: '#55556A', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sortOptionTextActive: { color: '#C9A84C' },
  sortCheckmark: { color: '#C9A84C', fontSize: 12, fontWeight: '800' },

  // Category
  categoryScroll: { maxHeight: 52 },
  categoryScrollContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#0E0E15',
    borderWidth: 1, borderColor: '#C9A84C14',
    position: 'relative', overflow: 'hidden',
  },
  categoryChipActive: { borderColor: '#C9A84C40', backgroundColor: '#C9A84C0A' },
  categoryChipText: { color: '#55556A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  categoryChipTextActive: { color: '#C9A84C' },
  categoryChipBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#C9A84C',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C0A',
  },
  statsText: { color: '#55556A', fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  sortLabel: { color: '#C9A84C', fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  // List
  listScroll: { flex: 1 },

  // Tour Card
  tourCard: {
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: '#0E0E15',
    borderRadius: 20, borderWidth: 1, borderColor: '#C9A84C14',
    overflow: 'hidden',
  },
  tourImgWrapper: { height: 200, position: 'relative' },
  tourImg: { width: '100%', height: '100%' },
  tourImgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F40',
  },
  tourTag: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#C9A84C',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  tourTagUltra: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C' },
  tourTagExclusive: { backgroundColor: '#C9A84C' },
  tourTagNew: { backgroundColor: '#1A2A1A', borderWidth: 1, borderColor: '#4CAF50' },
  tourTagRare: { backgroundColor: '#1A1A2A', borderWidth: 1, borderColor: '#7C4DFF' },
  tourTagText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  tourTagTextDark: { color: '#0A0A0F' },
  tourImgBottom: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tourRatingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#0A0A0FCC', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#C9A84C30',
  },
  tourRatingStar: { color: '#C9A84C', fontSize: 10 },
  tourRatingVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tourRatingCount: { color: '#55556A', fontSize: 10 },
  tourDiffBadge: {
    backgroundColor: '#0A0A0FCC', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#C9A84C14',
  },
  tourDiffText: { color: '#C9A84C', fontSize: 8, fontWeight: '700', letterSpacing: 1 },

  // Tour Info
  tourInfo: { padding: 18 },
  tourLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tourLocationDot: { color: '#C9A84C', fontSize: 10 },
  tourLocation: { color: '#C9A84C', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  tourTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  tourSubtitle: { color: '#55556A', fontSize: 11, marginBottom: 14 },
  tourMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tourMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tourMetaIcon: { color: '#C9A84C', fontSize: 10 },
  tourMetaText: { color: '#55556A', fontSize: 10 },
  tourMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#C9A84C30', marginHorizontal: 8 },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  highlightChip: {
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C14',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  highlightChipText: { color: '#FFFFFF80', fontSize: 10 },
  highlightMore: {
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C30',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  highlightMoreText: { color: '#C9A84C', fontSize: 10, fontWeight: '700' },

  // Tour Price Row
  tourPriceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: 14, borderTopWidth: 1, borderTopColor: '#C9A84C0A',
  },
  tourPriceLabel: { color: '#55556A', fontSize: 8, letterSpacing: 1, marginBottom: 2 },
  tourPriceGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  tourPrice: { color: '#C9A84C', fontSize: 22, fontWeight: '800' },
  tourOriginalPrice: {
    color: '#55556A', fontSize: 13, fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  tourPricePer: { color: '#55556A', fontSize: 9, marginTop: 2 },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C40',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  viewBtnText: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  viewBtnArrow: { color: '#C9A84C', fontSize: 12 },

  // Hero (Detail)
  heroWrapper: { height: 340, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F80',
  },
  heroBack: {
    position: 'absolute', top: 16, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0A0A0F80', borderWidth: 1, borderColor: '#C9A84C30',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTag: {
    position: 'absolute', top: 16, right: 20,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    backgroundColor: '#C9A84C',
  },
  heroBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: '#0A0A0FA0',
  },
  heroLocation: { color: '#C9A84C', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  heroSubtitle: { color: '#FFFFFFB0', fontSize: 12, marginBottom: 14 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { color: '#C9A84C', fontSize: 11, fontWeight: '800', marginBottom: 2 },
  heroStatLabel: { color: '#FFFFFF60', fontSize: 8, letterSpacing: 1 },
  heroStatDiv: { width: 1, height: 28, backgroundColor: '#FFFFFF20' },

  // Quick Strip
  quickStrip: {
    flexDirection: 'row', backgroundColor: '#0E0E15',
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
  },
  quickStripItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  quickStripIcon: { color: '#C9A84C', fontSize: 12 },
  quickStripVal: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  quickStripDiv: { width: 1, backgroundColor: '#C9A84C14' },

  // Tabs
  tabRow: {
    flexDirection: 'row', backgroundColor: '#0A0A0F',
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: { color: '#55556A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  tabTextActive: { color: '#C9A84C' },
  tabBar: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: '#C9A84C',
  },
  tabContent: { padding: 20 },

  // Detail Sections
  detailSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  sectionAccent: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#C9A84C' },
  sectionTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },

  detailListRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#C9A84C08',
  },
  detailListDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9A84C',
    marginTop: 5,
  },
  includeCheck: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#C9A84C14', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  includeCheckText: { color: '#C9A84C', fontSize: 9, fontWeight: '800' },
  detailListText: { flex: 1, color: '#FFFFFF', fontSize: 13, lineHeight: 20 },

  // Timeline
  timelineRow: { flexDirection: 'row', paddingBottom: 4 },
  timelineLeft: { width: 30, alignItems: 'center' },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#C9A84C', borderWidth: 2, borderColor: '#C9A84C40',
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#C9A84C30', marginTop: 4, minHeight: 30 },
  timelineContent: { flex: 1, paddingBottom: 20, paddingLeft: 8 },
  timelineStep: { color: '#C9A84C', fontSize: 8, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  timelineText: { color: '#FFFFFF', fontSize: 13, lineHeight: 20 },

  // Guest Section
  guestSection: { paddingHorizontal: 20, marginBottom: 4 },
  guestCard: {
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14',
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  guestLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  guestSub: { color: '#55556A', fontSize: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { color: '#C9A84C', fontSize: 20, fontWeight: '300' },
  stepperNum: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', minWidth: 30, textAlign: 'center' },

  // Price Section
  priceSection: { paddingHorizontal: 20, marginBottom: 4 },
  fareCard: {
    borderRadius: 18, borderWidth: 1, borderColor: '#C9A84C30', overflow: 'hidden',
  },
  fareHeader: {
    backgroundColor: '#C9A84C0A', paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14',
  },
  fareTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  fareBody: { backgroundColor: '#0E0E15', padding: 18 },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  fareKey: { color: '#55556A', fontSize: 12 },
  fareVal: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  savingsVal: { color: '#4CAF50', fontSize: 13, fontWeight: '700' },
  fareDivider: { height: 1, backgroundColor: '#C9A84C20', marginVertical: 6 },
  fareTotalKey: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  fareTotalVal: { color: '#C9A84C', fontSize: 20, fontWeight: '800' },

  // Book Bar
  bookBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1, borderTopColor: '#C9A84C14',
  },
  bookBtn: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  bookBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  bookBtnSub: { color: '#0A0A0F70', fontSize: 10, marginTop: 4 },
});