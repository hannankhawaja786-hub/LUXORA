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

export interface Hotel {
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
  hotel: Hotel;
  searchParams: HotelSearchParams;
  onBack: () => void;
  onBook: (bookingRef: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0F',
  card: '#0E0E15',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  goldDim: '#C9A84C14',
  goldDim2: '#C9A84C22',
  goldDim3: '#C9A84C33',
  white: '#FFFFFF',
  grey: '#55556A',
  border: '#1A1A2E',
  cardBorder: '#1C1C2E',
  success: '#2ECC71',
  danger: '#E74C3C',
  info: '#3498DB',
};

const ROOM_TYPES = [
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    size: '42 m²',
    bed: 'King Bed',
    view: 'City View',
    priceMultiplier: 1,
    icon: '◈',
    features: ['Free WiFi', 'Mini Bar', 'Rain Shower', 'Bathrobe'],
  },
  {
    id: 'premier',
    name: 'Premier Suite',
    size: '68 m²',
    bed: 'King Bed',
    view: 'Sea View',
    priceMultiplier: 1.45,
    icon: '◆',
    features: ['Butler Service', 'Private Terrace', 'Jacuzzi', 'Lounge Access'],
  },
  {
    id: 'royal',
    name: 'Royal Penthouse',
    size: '120 m²',
    bed: '2 King Beds',
    view: 'Panoramic',
    priceMultiplier: 2.2,
    icon: '✦',
    features: ['Private Pool', 'Dedicated Butler', 'Heli Pad Access', 'VIP Transfer'],
  },
];

const AMENITY_ICONS: Record<string, { icon: string; label: string }> = {
  wifi: { icon: '▲', label: 'High-Speed WiFi' },
  pool: { icon: '◈', label: 'Infinity Pool' },
  spa: { icon: '◆', label: 'Luxury Spa' },
  gym: { icon: '◉', label: 'Fitness Center' },
  restaurant: { icon: '▣', label: 'Fine Dining' },
  parking: { icon: '▤', label: 'Valet Parking' },
  concierge: { icon: '✦', label: 'Concierge' },
  lounge: { icon: '◐', label: 'Executive Lounge' },
  breakfast: { icon: '▸', label: 'Breakfast' },
  transfer: { icon: '▻', label: 'Airport Transfer' },
};

const GALLERY_ITEMS = [
  { icon: '◈', label: 'Lobby' },
  { icon: '◆', label: 'Suite' },
  { icon: '◉', label: 'Pool' },
  { icon: '▣', label: 'Restaurant' },
  { icon: '✦', label: 'Spa' },
  { icon: '◐', label: 'Lounge' },
];

const REVIEWS_DATA = [
  {
    id: 'r1',
    name: 'Sultan Al-Rashidi',
    country: '🇸🇦',
    rating: 10,
    date: 'March 2025',
    text: 'Absolutely flawless. The butler service was impeccable and the view from the suite was breathtaking.',
    category: 'Royal Penthouse',
  },
  {
    id: 'r2',
    name: 'James Whitmore',
    country: '🇬🇧',
    rating: 9.5,
    date: 'February 2025',
    text: 'Finest hotel experience in years. The spa treatment was world-class and the breakfast was exceptional.',
    category: 'Premier Suite',
  },
  {
    id: 'r3',
    name: 'Aisha Mohammed',
    country: '🇦🇪',
    rating: 9.8,
    date: 'January 2025',
    text: 'A truly luxurious escape. From check-in to check-out, every detail was handled with absolute precision.',
    category: 'Deluxe Room',
  },
];

const TAG_COLORS: Record<string, string> = {
  'LUXORA PICK': '#C9A84C',
  'BEST VALUE': '#2ECC71',
  'MOST POPULAR': '#3498DB',
  'NEW LISTING': '#9B59B6',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Stars = ({ count, size = 12 }: { count: number; size?: number }) => (
  <Text style={{ color: C.gold, fontSize: size, letterSpacing: 1 }}>
    {'★'.repeat(count)}{'☆'.repeat(Math.max(0, 5 - count))}
  </Text>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HotelDetailScreen({ hotel, searchParams, onBack, onBook }: Props) {
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'amenities' | 'reviews'>('overview');
  const [activeGallery, setActiveGallery] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [addBreakfast, setAddBreakfast] = useState(hotel.breakfastIncluded);
  const [addTransfer, setAddTransfer] = useState(false);
  const [addLateCheckout, setAddLateCheckout] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const galleryAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const switchGallery = (idx: number) => {
    Animated.sequence([
      Animated.timing(galleryAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(galleryAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveGallery(idx);
  };

  const roomPrice = Math.round(hotel.price * selectedRoom.priceMultiplier);
  const totalNightsCost = roomPrice * searchParams.nights * searchParams.rooms;
  const extrasTotal =
    (addBreakfast && !hotel.breakfastIncluded ? 45 * searchParams.adults * searchParams.nights : 0) +
    (addTransfer ? 120 : 0) +
    (addLateCheckout ? 80 : 0);
  const grandTotal = totalNightsCost + extrasTotal;

  const handleConfirmBooking = () => {
    const ref = 'LX-HTL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmedRef(ref);
    setBookingStep(3);
  };

  // ─── Tab: Overview ─────────────────────────────────────────────────────────

  const renderOverview = () => (
    <View>
      {/* About */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>ABOUT THIS PROPERTY</Text>
        <Text style={styles.aboutText}>
          {hotel.name} stands as one of the most iconic luxury properties in {hotel.city},
          offering an unparalleled blend of contemporary design and timeless Arabian hospitality.
          Nestled in the prestigious {hotel.area} district, guests are treated to panoramic vistas
          and world-class service from the moment they arrive.
        </Text>
        <View style={styles.aboutStats}>
          <View style={styles.aboutStat}>
            <Text style={styles.aboutStatNum}>{hotel.stars}</Text>
            <Text style={styles.aboutStatLabel}>STAR RATING</Text>
          </View>
          <View style={styles.aboutStatDivider} />
          <View style={styles.aboutStat}>
            <Text style={styles.aboutStatNum}>{hotel.rating}</Text>
            <Text style={styles.aboutStatLabel}>GUEST SCORE</Text>
          </View>
          <View style={styles.aboutStatDivider} />
          <View style={styles.aboutStat}>
            <Text style={styles.aboutStatNum}>{hotel.reviews.toLocaleString()}</Text>
            <Text style={styles.aboutStatLabel}>REVIEWS</Text>
          </View>
        </View>
      </View>

      {/* Location Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>LOCATION</Text>
        <View style={styles.locationMap}>
          <View style={styles.locationMapInner}>
            <Text style={styles.locationMapIcon}>◈</Text>
            <View style={styles.locationPulseOuter}>
              <View style={styles.locationPulseInner} />
            </View>
          </View>
          <View style={styles.locationGrid}>
            {Array.from({ length: 30 }).map((_, i) => (
              <View key={i} style={styles.locationGridDot} />
            ))}
          </View>
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>◆</Text>
            <Text style={styles.locationText}>{hotel.area}, {hotel.city}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>▸</Text>
            <Text style={styles.locationText}>{hotel.distanceKm}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>▻</Text>
            <Text style={styles.locationText}>45 min from International Airport</Text>
          </View>
        </View>
      </View>

      {/* Policies */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>HOTEL POLICIES</Text>
        {[
          { label: 'CHECK-IN', value: 'From 14:00 · Early check-in on request' },
          { label: 'CHECK-OUT', value: 'Until 12:00 · Late checkout USD 80' },
          { label: 'CANCELLATION', value: hotel.refundable ? 'Free cancellation before check-in' : 'Non-refundable booking' },
          { label: 'CHILDREN', value: 'Children under 12 stay free' },
          { label: 'PETS', value: 'Pets not allowed' },
          { label: 'SMOKING', value: 'Non-smoking property' },
        ].map(p => (
          <View key={p.label} style={styles.policyRow}>
            <Text style={styles.policyLabel}>{p.label}</Text>
            <Text style={[
              styles.policyValue,
              p.label === 'CANCELLATION' && { color: hotel.refundable ? C.success : C.danger }
            ]}>{p.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Tab: Rooms ────────────────────────────────────────────────────────────

  const renderRooms = () => (
    <View>
      <Text style={styles.roomsSubheader}>SELECT YOUR ROOM TYPE</Text>
      {ROOM_TYPES.map(room => {
        const rPrice = Math.round(hotel.price * room.priceMultiplier);
        const isSelected = selectedRoom.id === room.id;
        return (
          <TouchableOpacity
            key={room.id}
            style={[styles.roomCard, isSelected && styles.roomCardActive]}
            onPress={() => setSelectedRoom(room)}
            activeOpacity={0.85}
          >
            {isSelected && (
              <View style={styles.roomSelectedBadge}>
                <Text style={styles.roomSelectedText}>SELECTED</Text>
              </View>
            )}
            <View style={styles.roomTop}>
              <View style={[styles.roomIconBox, isSelected && styles.roomIconBoxActive]}>
                <Text style={styles.roomIcon}>{room.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.roomName, isSelected && { color: C.gold }]}>{room.name}</Text>
                <Text style={styles.roomSub}>{room.size} · {room.bed}</Text>
                <View style={styles.roomViewBadge}>
                  <Text style={styles.roomViewText}>{room.view}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.roomPrice}>USD {rPrice}</Text>
                <Text style={styles.roomPriceNight}>/night</Text>
                <Text style={styles.roomPriceTotal}>
                  {searchParams.nights}N · USD {(rPrice * searchParams.nights).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.roomFeatures}>
              {room.features.map(f => (
                <View key={f} style={styles.roomFeaturePill}>
                  <Text style={styles.roomFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Tab: Amenities ────────────────────────────────────────────────────────

  const renderAmenities = () => (
    <View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>PROPERTY AMENITIES</Text>
        <View style={styles.amenitiesGrid}>
          {hotel.amenities.map(a => {
            const info = AMENITY_ICONS[a];
            if (!info) return null;
            return (
              <View key={a} style={styles.amenityCard}>
                <View style={styles.amenityCardIcon}>
                  <Text style={styles.amenityCardIconText}>{info.icon}</Text>
                </View>
                <Text style={styles.amenityCardLabel}>{info.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>DINING & ENTERTAINMENT</Text>
        {[
          { name: 'The Royal Terrace', cuisine: 'International Fine Dining', hours: '6:00 – 23:00', icon: '▣' },
          { name: 'Al Majlis Lounge', cuisine: 'Afternoon Tea & Cocktails', hours: '14:00 – 02:00', icon: '◐' },
          { name: 'The Cave Bar', cuisine: 'Premium Spirits & Cigars', hours: '18:00 – 03:00', icon: '◆' },
        ].map(d => (
          <View key={d.name} style={styles.diningRow}>
            <View style={styles.diningIconBox}>
              <Text style={styles.diningIcon}>{d.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.diningName}>{d.name}</Text>
              <Text style={styles.diningCuisine}>{d.cuisine}</Text>
            </View>
            <Text style={styles.diningHours}>{d.hours}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>SPA & WELLNESS</Text>
        {[
          { name: 'Arabian Hammam Ritual', duration: '90 min', price: 280 },
          { name: 'Deep Tissue Massage', duration: '60 min', price: 180 },
          { name: 'Couples Sanctuary', duration: '120 min', price: 450 },
          { name: 'Facial Glow Treatment', duration: '75 min', price: 220 },
        ].map(s => (
          <View key={s.name} style={styles.spaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.spaName}>{s.name}</Text>
              <Text style={styles.spaDuration}>{s.duration}</Text>
            </View>
            <Text style={styles.spaPrice}>USD {s.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Tab: Reviews ──────────────────────────────────────────────────────────

  const renderReviews = () => (
    <View>
      {/* Score Overview */}
      <View style={styles.sectionCard}>
        <View style={styles.reviewScoreRow}>
          <View style={styles.reviewScoreBig}>
            <Text style={styles.reviewScoreNum}>{hotel.rating}</Text>
            <Text style={styles.reviewScoreLabel}>EXCEPTIONAL</Text>
            <Stars count={hotel.stars} size={10} />
          </View>
          <View style={styles.reviewBars}>
            {[
              { label: 'Cleanliness', val: 9.8 },
              { label: 'Service', val: 9.6 },
              { label: 'Location', val: 9.2 },
              { label: 'Value', val: 8.7 },
              { label: 'Facilities', val: 9.4 },
            ].map(b => (
              <View key={b.label} style={styles.reviewBarRow}>
                <Text style={styles.reviewBarLabel}>{b.label}</Text>
                <View style={styles.reviewBarTrack}>
                  <View style={[styles.reviewBarFill, { width: `${(b.val / 10) * 100}%` as any }]} />
                </View>
                <Text style={styles.reviewBarNum}>{b.val}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.reviewCount}>{hotel.reviews.toLocaleString()} verified guest reviews</Text>
      </View>

      {/* Individual Reviews */}
      {REVIEWS_DATA.map(r => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>{r.name[0]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.reviewerName}>{r.name}</Text>
                <Text style={{ marginLeft: 6, fontSize: 14 }}>{r.country}</Text>
              </View>
              <Text style={styles.reviewDate}>{r.category} · {r.date}</Text>
            </View>
            <View style={styles.reviewRatingBadge}>
              <Text style={styles.reviewRatingNum}>{r.rating}</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>{r.text}</Text>
        </View>
      ))}
    </View>
  );

  // ─── Booking Modal ─────────────────────────────────────────────────────────

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      transparent
      animationType="slide"
      onRequestClose={() => { setShowBookingModal(false); setBookingStep(1); }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bookingSheet}>
          <View style={styles.sheetHandle} />

          {/* Step Indicators */}
          {bookingStep < 3 && (
            <View style={styles.stepRow}>
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <View style={[styles.stepDot, bookingStep >= s && styles.stepDotActive]}>
                    <Text style={[styles.stepDotText, bookingStep >= s && { color: C.bg }]}>{s}</Text>
                  </View>
                  {s < 2 && <View style={[styles.stepLine, bookingStep > s && styles.stepLineActive]} />}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Step 1: Guest Details */}
          {bookingStep === 1 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>GUEST DETAILS</Text>
              <Text style={styles.sheetSub}>Primary guest information</Text>

              {[
                { label: 'FULL NAME', value: guestName, set: setGuestName, placeholder: 'As per passport' },
                { label: 'EMAIL ADDRESS', value: guestEmail, set: setGuestEmail, placeholder: 'you@example.com' },
                { label: 'PHONE NUMBER', value: guestPhone, set: setGuestPhone, placeholder: '+971 50 000 0000' },
              ].map(field => (
                <View key={field.label} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.set}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.grey}
                  />
                </View>
              ))}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SPECIAL REQUESTS</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={specialRequest}
                  onChangeText={setSpecialRequest}
                  placeholder="e.g. High floor, Anniversary decoration..."
                  placeholderTextColor={C.grey}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Selected Room Summary */}
              <View style={styles.bookingSummaryCard}>
                <Text style={styles.bookingSummaryTitle}>YOUR SELECTION</Text>
                <View style={styles.bookingSummaryRow}>
                  <Text style={styles.bookingSummaryLabel}>Room</Text>
                  <Text style={styles.bookingSummaryValue}>{selectedRoom.name}</Text>
                </View>
                <View style={styles.bookingSummaryRow}>
                  <Text style={styles.bookingSummaryLabel}>Stay</Text>
                  <Text style={styles.bookingSummaryValue}>{searchParams.checkIn} → {searchParams.checkOut}</Text>
                </View>
                <View style={styles.bookingSummaryRow}>
                  <Text style={styles.bookingSummaryLabel}>Duration</Text>
                  <Text style={styles.bookingSummaryValue}>{searchParams.nights} nights · {searchParams.rooms} room</Text>
                </View>
                <View style={styles.bookingSummaryRow}>
                  <Text style={styles.bookingSummaryLabel}>Guests</Text>
                  <Text style={styles.bookingSummaryValue}>{searchParams.adults} Adults{searchParams.children > 0 ? `, ${searchParams.children} Children` : ''}</Text>
                </View>
                <View style={[styles.bookingSummaryRow, styles.bookingSummaryTotal]}>
                  <Text style={styles.bookingSummaryTotalLabel}>BASE TOTAL</Text>
                  <Text style={styles.bookingSummaryTotalValue}>USD {totalNightsCost.toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, (!guestName || !guestEmail) && styles.modalBtnDisabled]}
                onPress={() => setBookingStep(2)}
                disabled={!guestName || !guestEmail}
              >
                <Text style={styles.modalBtnText}>CONTINUE →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Step 2: Extras + Payment */}
          {bookingStep === 2 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>ADD-ONS & PAYMENT</Text>
              <Text style={styles.sheetSub}>Enhance your stay</Text>

              {/* Add-ons */}
              {[
                {
                  key: 'breakfast',
                  label: 'Daily Breakfast',
                  sub: 'USD 45/person/night · Continental & Arabic buffet',
                  price: 45 * searchParams.adults * searchParams.nights,
                  val: addBreakfast,
                  set: setAddBreakfast,
                  disabled: hotel.breakfastIncluded,
                },
                {
                  key: 'transfer',
                  label: 'Airport Transfer',
                  sub: 'USD 120 · Private luxury sedan (round trip)',
                  price: 120,
                  val: addTransfer,
                  set: setAddTransfer,
                  disabled: false,
                },
                {
                  key: 'checkout',
                  label: 'Late Check-out',
                  sub: 'USD 80 · Extend stay until 18:00',
                  price: 80,
                  val: addLateCheckout,
                  set: setAddLateCheckout,
                  disabled: false,
                },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.addonRow, opt.val && !opt.disabled && styles.addonRowActive, opt.disabled && styles.addonRowDisabled]}
                  onPress={() => !opt.disabled && opt.set(!opt.val)}
                  activeOpacity={opt.disabled ? 1 : 0.85}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.addonLabel, opt.val && { color: C.gold }]}>{opt.label}</Text>
                      {opt.disabled && (
                        <View style={styles.includedBadge}>
                          <Text style={styles.includedBadgeText}>INCLUDED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addonSub}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.addonCheck, opt.val && styles.addonCheckActive]}>
                    {(opt.val || opt.disabled) && <Text style={styles.addonCheckIcon}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Price Breakdown */}
              <View style={styles.priceBreakdownCard}>
                <Text style={styles.priceBreakdownTitle}>PRICE BREAKDOWN</Text>
                <View style={styles.priceBreakdownRow}>
                  <Text style={styles.priceBreakdownLabel}>{selectedRoom.name} × {searchParams.nights} nights</Text>
                  <Text style={styles.priceBreakdownValue}>USD {totalNightsCost.toLocaleString()}</Text>
                </View>
                {(addBreakfast && !hotel.breakfastIncluded) && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Breakfast add-on</Text>
                    <Text style={styles.priceBreakdownValue}>USD {(45 * searchParams.adults * searchParams.nights).toLocaleString()}</Text>
                  </View>
                )}
                {addTransfer && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Airport transfer</Text>
                    <Text style={styles.priceBreakdownValue}>USD 120</Text>
                  </View>
                )}
                {addLateCheckout && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Late check-out</Text>
                    <Text style={styles.priceBreakdownValue}>USD 80</Text>
                  </View>
                )}
                <View style={styles.priceBreakdownDivider} />
                <View style={styles.priceBreakdownRow}>
                  <Text style={styles.priceGrandLabel}>GRAND TOTAL</Text>
                  <Text style={styles.priceGrandValue}>USD {grandTotal.toLocaleString()}</Text>
                </View>
              </View>

              {/* Payment Note */}
              <View style={styles.paymentNote}>
                <Text style={styles.paymentNoteIcon}>✦</Text>
                <Text style={styles.paymentNoteText}>
                  This is a demo booking. No real payment processed. Confirmation will be instant.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  style={styles.backSmallBtn}
                  onPress={() => setBookingStep(1)}
                >
                  <Text style={styles.backSmallBtnText}>← BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { flex: 1 }]}
                  onPress={handleConfirmBooking}
                >
                  <Text style={styles.modalBtnText}>CONFIRM BOOKING</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
              <View style={styles.confirmIconWrap}>
                <Text style={styles.confirmIcon}>✦</Text>
              </View>
              <Text style={styles.confirmTitle}>BOOKING CONFIRMED</Text>
              <Text style={styles.confirmSub}>Your luxury stay is reserved</Text>

              <View style={styles.confirmRefCard}>
                <Text style={styles.confirmRefLabel}>BOOKING REFERENCE</Text>
                <Text style={styles.confirmRefNum}>{confirmedRef}</Text>
                <Text style={styles.confirmRefNote}>Save this reference for your records</Text>
              </View>

              <View style={styles.confirmDetails}>
                {[
                  { label: 'HOTEL', value: hotel.name },
                  { label: 'ROOM', value: selectedRoom.name },
                  { label: 'GUEST', value: guestName },
                  { label: 'CHECK-IN', value: searchParams.checkIn },
                  { label: 'CHECK-OUT', value: searchParams.checkOut },
                  { label: 'NIGHTS', value: `${searchParams.nights} nights` },
                  { label: 'TOTAL PAID', value: `USD ${grandTotal.toLocaleString()}` },
                ].map(d => (
                  <View key={d.label} style={styles.confirmDetailRow}>
                    <Text style={styles.confirmDetailLabel}>{d.label}</Text>
                    <Text style={[styles.confirmDetailValue, d.label === 'TOTAL PAID' && { color: C.goldLight }]}>
                      {d.value}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  setShowBookingModal(false);
                  setBookingStep(1);
                  onBook(confirmedRef);
                }}
              >
                <Text style={styles.modalBtnText}>✦ DONE</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle} numberOfLines={1}>{hotel.name.toUpperCase()}</Text>
          <Text style={styles.headerSub}>{hotel.area} · {hotel.city}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnIcon}>◈</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Hero Gallery */}
          <View style={styles.galleryHero}>
            <Animated.View style={[styles.galleryMain, { opacity: galleryAnim }]}>
              <Text style={styles.galleryMainIcon}>{GALLERY_ITEMS[activeGallery].icon}</Text>
              <Text style={styles.galleryMainLabel}>{GALLERY_ITEMS[activeGallery].label}</Text>
              <View style={styles.galleryOverlay}>
                {hotel.tag && (
                  <View style={[
                    styles.galleryTag,
                    { backgroundColor: TAG_COLORS[hotel.tag] + '22', borderColor: TAG_COLORS[hotel.tag] + '66' }
                  ]}>
                    <Text style={[styles.galleryTagText, { color: TAG_COLORS[hotel.tag] }]}>
                      {hotel.tag}
                    </Text>
                  </View>
                )}
                <View style={styles.galleryStars}>
                  <Stars count={hotel.stars} size={11} />
                </View>
              </View>
            </Animated.View>

            {/* Thumbnail Strip */}
            <View style={styles.galleryThumbs}>
              {GALLERY_ITEMS.map((g, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.galleryThumb, activeGallery === idx && styles.galleryThumbActive]}
                  onPress={() => switchGallery(idx)}
                >
                  <Text style={[styles.galleryThumbIcon, activeGallery === idx && { color: C.gold }]}>
                    {g.icon}
                  </Text>
                  <Text style={[styles.galleryThumbLabel, activeGallery === idx && { color: C.gold }]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hotel Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.titleCardLeft}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.hotelBrand}>{hotel.brand} · {hotel.category}</Text>
              <Stars count={hotel.stars} size={12} />
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeIcon}>◆</Text>
                <Text style={styles.locationBadgeText}>{hotel.area}, {hotel.city}</Text>
                <Text style={styles.locationBadgeDist}> · {hotel.distanceKm}</Text>
              </View>
            </View>
            <View style={styles.titleCardRight}>
              <View style={styles.ratingCircle}>
                <Text style={styles.ratingNum}>{hotel.rating}</Text>
                <Text style={styles.ratingLabel}>/ 10</Text>
              </View>
              <Text style={styles.ratingReviews}>{hotel.reviews.toLocaleString()}{'\n'}reviews</Text>
            </View>
          </View>

          {/* Quick Info Strip */}
          <View style={styles.quickStrip}>
            {[
              { icon: '◈', label: searchParams.checkIn, sub: 'CHECK-IN' },
              { icon: '▸', label: `${searchParams.nights}N`, sub: 'DURATION' },
              { icon: '◆', label: searchParams.checkOut, sub: 'CHECK-OUT' },
              { icon: '▣', label: `${searchParams.rooms}R · ${searchParams.adults}A`, sub: 'ROOMS · ADULTS' },
            ].map((q, i) => (
              <View key={i} style={[styles.quickItem, i < 3 && styles.quickItemBorder]}>
                <Text style={styles.quickIcon}>{q.icon}</Text>
                <Text style={styles.quickVal}>{q.label}</Text>
                <Text style={styles.quickSub}>{q.sub}</Text>
              </View>
            ))}
          </View>

          {/* Price Strip */}
          <View style={styles.priceStrip}>
            <View>
              <Text style={styles.priceStripFrom}>FROM</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.priceStripPrice}>USD {roomPrice}</Text>
                <Text style={styles.priceStripNight}>/night</Text>
              </View>
              {hotel.originalPrice && (
                <Text style={styles.priceStripOld}>was USD {Math.round(hotel.originalPrice * selectedRoom.priceMultiplier)}</Text>
              )}
            </View>
            <View style={styles.priceStripBadges}>
              {hotel.refundable && (
                <View style={styles.freeCancelBadge}>
                  <Text style={styles.freeCancelText}>FREE CANCEL</Text>
                </View>
              )}
              {hotel.breakfastIncluded && (
                <View style={styles.breakfastBadge}>
                  <Text style={styles.breakfastText}>BREAKFAST</Text>
                </View>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {(['overview', 'rooms', 'amenities', 'reviews'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.toUpperCase()}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'rooms' && renderRooms()}
            {activeTab === 'amenities' && renderAmenities()}
            {activeTab === 'reviews' && renderReviews()}
          </View>

          {/* Bottom Note */}
          <Text style={styles.bottomNote}>✦  LUXORA  ·  CURATED LUXURY STAYS  ·  HANNAN KHAWAJA</Text>
        </Animated.View>
      </ScrollView>

      {/* Sticky Book CTA */}
      <View style={styles.stickyFooter}>
        <View style={styles.stickyFooterLeft}>
          <Text style={styles.stickyPrice}>USD {roomPrice}</Text>
          <Text style={styles.stickyPriceSub}>{selectedRoom.name} · /night</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => { setBookingStep(1); setShowBookingModal(true); }}
            activeOpacity={0.9}
          >
            <Text style={styles.bookBtnText}>✦ BOOK NOW</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {renderBookingModal()}
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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { color: C.white, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  headerSub: { color: C.grey, fontSize: 9, letterSpacing: 1.5, marginTop: 2 },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.goldDim, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: C.gold + '44',
  },
  shareBtnIcon: { color: C.gold, fontSize: 14 },

  scrollContent: { paddingBottom: 100 },

  // Gallery
  galleryHero: { backgroundColor: C.card, marginBottom: 0 },
  galleryMain: {
    height: 220, backgroundColor: C.goldDim2,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  galleryMainIcon: { fontSize: 64, color: C.gold, opacity: 0.6 },
  galleryMainLabel: {
    position: 'absolute', bottom: 14, right: 16,
    color: C.grey, fontSize: 10, letterSpacing: 1.5, fontWeight: '700',
  },
  galleryOverlay: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', gap: 8,
  },
  galleryTag: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 5, borderWidth: 1,
  },
  galleryTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  galleryStars: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: C.bg + 'CC', borderRadius: 5,
  },
  galleryThumbs: {
    flexDirection: 'row', paddingHorizontal: 12,
    paddingVertical: 10, gap: 8,
  },
  galleryThumb: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 10, backgroundColor: C.border,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  galleryThumbActive: {
    backgroundColor: C.goldDim2,
    borderColor: C.gold + '55',
  },
  galleryThumbIcon: { fontSize: 14, color: C.grey, marginBottom: 3 },
  galleryThumbLabel: { color: C.grey, fontSize: 7, letterSpacing: 0.5, fontWeight: '600' },

  // Title Card
  titleCard: {
    flexDirection: 'row', backgroundColor: C.card,
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  titleCardLeft: { flex: 1 },
  hotelName: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  hotelBrand: { color: C.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationBadgeIcon: { color: C.gold, fontSize: 10, marginRight: 5 },
  locationBadgeText: { color: C.grey, fontSize: 10, letterSpacing: 0.3 },
  locationBadgeDist: { color: C.grey + '88', fontSize: 9, letterSpacing: 0.3 },
  titleCardRight: { alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  ratingCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: C.goldDim3, borderWidth: 2, borderColor: C.gold + '55',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  ratingNum: { color: C.goldLight, fontSize: 18, fontWeight: '900' },
  ratingLabel: { color: C.grey, fontSize: 8, letterSpacing: 0.5, marginTop: -2 },
  ratingReviews: { color: C.grey, fontSize: 8, letterSpacing: 0.3, textAlign: 'center' },

  // Quick Strip
  quickStrip: {
    flexDirection: 'row', backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
    marginBottom: 0,
  },
  quickItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  quickItemBorder: { borderRightWidth: 1, borderRightColor: C.border },
  quickIcon: { color: C.gold, fontSize: 10, marginBottom: 4 },
  quickVal: { color: C.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  quickSub: { color: C.grey, fontSize: 7, letterSpacing: 0.8, marginTop: 2 },

  // Price Strip
  priceStrip: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card, paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: C.border, marginBottom: 16,
  },
  priceStripFrom: { color: C.grey, fontSize: 8, letterSpacing: 1.5, marginBottom: 2 },
  priceStripPrice: { color: C.goldLight, fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  priceStripNight: { color: C.grey, fontSize: 11, marginLeft: 4, marginBottom: 4 },
  priceStripOld: {
    color: C.grey, fontSize: 10,
    textDecorationLine: 'line-through', letterSpacing: 0.3,
  },
  priceStripBadges: { gap: 6 },
  freeCancelBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, backgroundColor: C.success + '18',
    borderWidth: 1, borderColor: C.success + '44',
  },
  freeCancelText: { color: C.success, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  breakfastBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '44',
  },
  breakfastText: { color: C.gold, fontSize: 8, fontWeight: '800', letterSpacing: 1 },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
    marginHorizontal: 16, borderRadius: 12,
    padding: 4, marginBottom: 16,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 9,
    borderRadius: 9, position: 'relative',
  },
  tabActive: { backgroundColor: C.goldDim2 },
  tabText: { color: C.grey, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  tabTextActive: { color: C.gold },
  tabUnderline: {
    position: 'absolute', bottom: 3, width: 16,
    height: 2, backgroundColor: C.gold, borderRadius: 1,
  },

  tabContent: { paddingHorizontal: 16 },

  // Section Card
  sectionCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  sectionTitle: {
    color: C.gold, fontSize: 10,
    fontWeight: '800', letterSpacing: 2.5, marginBottom: 14,
  },

  aboutText: {
    color: C.grey, fontSize: 12,
    lineHeight: 20, letterSpacing: 0.3, marginBottom: 16,
  },
  aboutStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.goldDim, borderRadius: 10,
    paddingVertical: 12,
  },
  aboutStat: { flex: 1, alignItems: 'center' },
  aboutStatNum: { color: C.goldLight, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  aboutStatLabel: { color: C.grey, fontSize: 8, letterSpacing: 1, marginTop: 3 },
  aboutStatDivider: { width: 1, height: 30, backgroundColor: C.gold + '22' },

  // Location Map
  locationMap: {
    height: 100, backgroundColor: C.goldDim, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, overflow: 'hidden', position: 'relative',
  },
  locationMapInner: { alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  locationMapIcon: { fontSize: 28, color: C.gold },
  locationPulseOuter: {
    position: 'absolute', width: 60, height: 60,
    borderRadius: 30, backgroundColor: C.gold + '11',
    borderWidth: 1, borderColor: C.gold + '22',
  },
  locationPulseInner: {
    position: 'absolute', width: 30, height: 30,
    borderRadius: 15, backgroundColor: C.gold + '22', alignSelf: 'center',
    top: 14,
  },
  locationGrid: {
    position: 'absolute', flexDirection: 'row',
    flexWrap: 'wrap', width: '100%', opacity: 0.15,
  },
  locationGridDot: {
    width: '10%', aspectRatio: 1,
    borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: C.gold,
  },
  locationInfo: { gap: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { color: C.gold, fontSize: 10, marginRight: 10, width: 16 },
  locationText: { color: C.grey, fontSize: 11, letterSpacing: 0.3 },

  // Policies
  policyRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  policyLabel: { color: C.grey, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, flex: 1 },
  policyValue: { color: C.white, fontSize: 11, letterSpacing: 0.3, flex: 2, textAlign: 'right' },

  // Rooms
  roomsSubheader: {
    color: C.gold, fontSize: 10, fontWeight: '800',
    letterSpacing: 2.5, marginBottom: 12,
  },
  roomCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.cardBorder,
    position: 'relative',
  },
  roomCardActive: {
    borderColor: C.gold + '77',
    backgroundColor: C.goldDim,
  },
  roomSelectedBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: C.gold, borderRadius: 5,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  roomSelectedText: { color: C.bg, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  roomTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roomIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.goldDim2, borderWidth: 1,
    borderColor: C.gold + '33', alignItems: 'center', justifyContent: 'center',
  },
  roomIconBoxActive: { backgroundColor: C.goldDim3, borderColor: C.gold + '66' },
  roomIcon: { fontSize: 20, color: C.gold },
  roomName: { color: C.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, marginBottom: 3 },
  roomSub: { color: C.grey, fontSize: 10, letterSpacing: 0.3, marginBottom: 6 },
  roomViewBadge: {
    backgroundColor: C.goldDim, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: C.gold + '33',
  },
  roomViewText: { color: C.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  roomPrice: { color: C.goldLight, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  roomPriceNight: { color: C.grey, fontSize: 9, textAlign: 'right' },
  roomPriceTotal: { color: C.grey, fontSize: 9, textAlign: 'right', marginTop: 2 },
  roomFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roomFeaturePill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: C.border,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  roomFeatureText: { color: C.grey, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },

  // Amenities Grid
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityCard: {
    width: '30%', alignItems: 'center',
    padding: 12, borderRadius: 12,
    backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.gold + '22',
  },
  amenityCardIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.goldDim2, alignItems: 'center',
    justifyContent: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: C.gold + '33',
  },
  amenityCardIconText: { color: C.gold, fontSize: 14 },
  amenityCardLabel: { color: C.white, fontSize: 8, letterSpacing: 0.5, textAlign: 'center', fontWeight: '600' },

  // Dining
  diningRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  diningIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.goldDim2, borderWidth: 1,
    borderColor: C.gold + '33', alignItems: 'center', justifyContent: 'center',
  },
  diningIcon: { color: C.gold, fontSize: 14 },
  diningName: { color: C.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  diningCuisine: { color: C.grey, fontSize: 10, letterSpacing: 0.3, marginTop: 2 },
  diningHours: { color: C.gold, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Spa
  spaRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  spaName: { color: C.white, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  spaDuration: { color: C.grey, fontSize: 9, letterSpacing: 0.5, marginTop: 3 },
  spaPrice: { color: C.goldLight, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  // Reviews
  reviewScoreRow: { flexDirection: 'row', marginBottom: 12 },
  reviewScoreBig: { alignItems: 'center', justifyContent: 'center', paddingRight: 16, marginRight: 16,
    borderRightWidth: 1, borderRightColor: C.border },
  reviewScoreNum: { color: C.goldLight, fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  reviewScoreLabel: { color: C.gold, fontSize: 8, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  reviewBars: { flex: 1, gap: 8 },
  reviewBarRow: { flexDirection: 'row', alignItems: 'center' },
  reviewBarLabel: { color: C.grey, fontSize: 8, letterSpacing: 0.5, width: 60 },
  reviewBarTrack: {
    flex: 1, height: 4, backgroundColor: C.border,
    borderRadius: 2, overflow: 'hidden', marginHorizontal: 8,
  },
  reviewBarFill: { height: '100%', backgroundColor: C.gold, borderRadius: 2 },
  reviewBarNum: { color: C.gold, fontSize: 9, fontWeight: '700', width: 26, textAlign: 'right' },
  reviewCount: { color: C.grey, fontSize: 10, letterSpacing: 0.5 },

  reviewCard: {
    backgroundColor: C.card, borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.goldDim3, borderWidth: 1,
    borderColor: C.gold + '44', alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: C.gold, fontSize: 16, fontWeight: '800' },
  reviewerName: { color: C.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  reviewDate: { color: C.grey, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  reviewRatingBadge: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.success + '22', borderWidth: 1,
    borderColor: C.success + '55', alignItems: 'center', justifyContent: 'center',
  },
  reviewRatingNum: { color: C.success, fontSize: 13, fontWeight: '900' },
  reviewText: { color: C.grey, fontSize: 12, lineHeight: 19, letterSpacing: 0.3 },

  bottomNote: {
    color: C.grey + '55', fontSize: 9, letterSpacing: 1.5,
    textAlign: 'center', marginTop: 24, marginBottom: 8,
  },

  // Sticky Footer
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
  },
  stickyFooterLeft: {},
  stickyPrice: { color: C.goldLight, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  stickyPriceSub: { color: C.grey, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  bookBtn: {
    backgroundColor: C.gold, paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 12,
  },
  bookBtnText: { color: C.bg, fontSize: 13, fontWeight: '900', letterSpacing: 3 },

  // Booking Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  bookingSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    borderTopWidth: 1, borderTopColor: C.gold + '44',
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.grey + '66',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.border, borderWidth: 1,
    borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: C.gold, borderColor: C.gold },
  stepDotText: { color: C.grey, fontSize: 11, fontWeight: '800' },
  stepLine: { width: 40, height: 2, backgroundColor: C.border, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: C.gold },
  sheetTitle: {
    color: C.gold, fontSize: 14, fontWeight: '800',
    letterSpacing: 3, marginBottom: 4,
  },
  sheetSub: { color: C.grey, fontSize: 10, letterSpacing: 0.5, marginBottom: 20 },

  // Inputs
  inputGroup: { marginBottom: 14 },
  inputLabel: {
    color: C.grey, fontSize: 9, fontWeight: '700',
    letterSpacing: 2, marginBottom: 8,
  },
  input: {
    backgroundColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: C.white, fontSize: 13, letterSpacing: 0.3,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  inputMultiline: { height: 70, textAlignVertical: 'top' },

  bookingSummaryCard: {
    backgroundColor: C.goldDim, borderRadius: 12,
    padding: 14, marginTop: 8, marginBottom: 20,
    borderWidth: 1, borderColor: C.gold + '33',
  },
  bookingSummaryTitle: {
    color: C.gold, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, marginBottom: 10,
  },
  bookingSummaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: C.gold + '11',
  },
  bookingSummaryLabel: { color: C.grey, fontSize: 10, letterSpacing: 0.5 },
  bookingSummaryValue: { color: C.white, fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  bookingSummaryTotal: {
    borderBottomWidth: 0, marginTop: 4, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: C.gold + '33',
  },
  bookingSummaryTotalLabel: { color: C.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  bookingSummaryTotalValue: { color: C.goldLight, fontSize: 14, fontWeight: '900' },

  // Add-ons
  addonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, marginBottom: 10,
    backgroundColor: C.border, borderWidth: 1, borderColor: C.cardBorder,
  },
  addonRowActive: {
    backgroundColor: C.goldDim, borderColor: C.gold + '55',
  },
  addonRowDisabled: { opacity: 0.7 },
  addonLabel: { color: C.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3, marginBottom: 3 },
  addonSub: { color: C.grey, fontSize: 9, letterSpacing: 0.3 },
  includedBadge: {
    marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: C.success + '22',
    borderWidth: 1, borderColor: C.success + '44',
  },
  includedBadgeText: { color: C.success, fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  addonCheck: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.border, borderWidth: 1,
    borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  addonCheckActive: { backgroundColor: C.gold, borderColor: C.gold },
  addonCheckIcon: { color: C.bg, fontSize: 11, fontWeight: '900' },

  // Price Breakdown
  priceBreakdownCard: {
    backgroundColor: C.goldDim, borderRadius: 12,
    padding: 14, marginTop: 4, marginBottom: 16,
    borderWidth: 1, borderColor: C.gold + '33',
  },
  priceBreakdownTitle: {
    color: C.gold, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, marginBottom: 10,
  },
  priceBreakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5,
  },
  priceBreakdownLabel: { color: C.grey, fontSize: 11, letterSpacing: 0.3 },
  priceBreakdownValue: { color: C.white, fontSize: 11, fontWeight: '600' },
  priceBreakdownDivider: { height: 1, backgroundColor: C.gold + '33', marginVertical: 8 },
  priceGrandLabel: { color: C.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  priceGrandValue: { color: C.goldLight, fontSize: 16, fontWeight: '900' },

  paymentNote: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.info + '11', borderRadius: 8,
    padding: 10, marginBottom: 16,
    borderWidth: 1, borderColor: C.info + '33',
  },
  paymentNoteIcon: { color: C.info, fontSize: 10, marginRight: 8, marginTop: 1 },
  paymentNoteText: { color: C.grey, fontSize: 10, letterSpacing: 0.3, flex: 1, lineHeight: 16 },

  backSmallBtn: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 10, backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  backSmallBtnText: { color: C.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  modalBtn: {
    backgroundColor: C.gold, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  modalBtnDisabled: { backgroundColor: C.gold + '44' },
  modalBtnText: { color: C.bg, fontSize: 13, fontWeight: '900', letterSpacing: 2.5 },

  // Confirmation
  confirmIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.goldDim3, borderWidth: 2,
    borderColor: C.gold + '66', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16, marginTop: 8,
  },
  confirmIcon: { fontSize: 32, color: C.gold },
  confirmTitle: {
    color: C.white, fontSize: 20, fontWeight: '900',
    letterSpacing: 4, marginBottom: 6,
  },
  confirmSub: { color: C.grey, fontSize: 11, letterSpacing: 1, marginBottom: 24 },
  confirmRefCard: {
    backgroundColor: C.goldDim, borderRadius: 14,
    padding: 20, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: C.gold + '55', width: '100%',
  },
  confirmRefLabel: { color: C.grey, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  confirmRefNum: { color: C.goldLight, fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 6 },
  confirmRefNote: { color: C.grey, fontSize: 9, letterSpacing: 0.5 },
  confirmDetails: {
    backgroundColor: C.card, borderRadius: 12, width: '100%',
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  confirmDetailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  confirmDetailLabel: { color: C.grey, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  confirmDetailValue: { color: C.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});