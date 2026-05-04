import React, { useState } from 'react';
import {
    Image,
    Modal,
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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  isNew?: boolean;
}

interface Props {
  restaurant: Restaurant;
  guests: number;
  onBack: () => void;
  onReserve: (ref: string) => void;
}

const MENU_ITEMS: Record<string, MenuItem[]> = {
  r1: [
    {
      id: 'm1', name: 'Al Baik Broast', price: 35, category: 'Signature',
      description: 'Signature crispy fried chicken, 2 pieces with garlic sauce',
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm2', name: 'Family Bucket', price: 185, category: 'Signature',
      description: '8 pieces chicken + 4 rolls + 2 large fries',
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm3', name: 'Shrimp Broast', price: 55, category: 'Seafood',
      description: '10 pieces crispy shrimp with cocktail sauce',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm4', name: 'Fish Fillet', price: 45, category: 'Seafood',
      description: 'Golden fried fish with tartar sauce',
      image: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'm5', name: 'Chicken Roll', price: 18, category: 'Rolls',
      description: 'Spicy chicken in soft roll with veggies',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
      spicy: true,
    },
    {
      id: 'm6', name: 'Garlic Bread', price: 12, category: 'Sides',
      description: 'Toasted bread with signature garlic sauce',
      image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
    {
      id: 'm7', name: 'Coleslaw', price: 8, category: 'Sides',
      description: 'Fresh creamy coleslaw salad',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
    {
      id: 'm8', name: 'Fresh Juice', price: 15, category: 'Drinks',
      description: 'Seasonal fresh squeezed juice',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
  ],
  r2: [
    {
      id: 'm1', name: 'Gold Tomahawk', price: 850, category: 'Signature',
      description: '1.5kg premium dry-aged tomahawk steak, gold leaf garnish',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80',
      popular: true, isNew: true,
    },
    {
      id: 'm2', name: 'Salt Bae Burger', price: 320, category: 'Signature',
      description: 'Wagyu beef patty, truffle mayo, gold flake',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm3', name: 'Ottoman Kebab', price: 180, category: 'Grills',
      description: 'Mixed charcoal grilled kebabs, lavash bread',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm4', name: 'Wagyu Ribeye', price: 580, category: 'Steaks',
      description: '300g A5 Japanese wagyu, pink salt finishing',
      image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=400&q=80',
      isNew: true,
    },
    {
      id: 'm5', name: 'Truffle Fries', price: 95, category: 'Sides',
      description: 'Crispy fries, black truffle oil, parmesan',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
    {
      id: 'm6', name: 'Turkish Mezze', price: 120, category: 'Starters',
      description: '7 cold & hot mezze selection',
      image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
    {
      id: 'm7', name: 'Baklava Platter', price: 85, category: 'Desserts',
      description: 'Assorted Ottoman sweets, 12 pieces',
      image: 'https://images.unsplash.com/photo-1598110750624-2b85db4a4fd0?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'm8', name: 'Turkish Tea Set', price: 45, category: 'Drinks',
      description: 'Authentic cay served in traditional tulip glasses',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
  ],
  r3: [
    {
      id: 'm1', name: 'Hummus Beiruti', price: 45, category: 'Starters',
      description: 'Classic creamy hummus with olive oil and pine nuts',
      image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=400&q=80',
      popular: true, vegetarian: true,
    },
    {
      id: 'm2', name: 'Mixed Grill', price: 220, category: 'Grills',
      description: 'Assorted Lebanese grilled meats with pita',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm3', name: 'Fattoush Salad', price: 38, category: 'Salads',
      description: 'Fresh vegetables with crispy bread and sumac dressing',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
    {
      id: 'm4', name: 'Lamb Chops', price: 185, category: 'Grills',
      description: 'Marinated lamb chops, garlic sauce, fresh herbs',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'm5', name: 'Knafeh', price: 55, category: 'Desserts',
      description: 'Traditional cheese pastry soaked in sweet syrup',
      image: 'https://images.unsplash.com/photo-1598110750624-2b85db4a4fd0?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
  ],
  r4: [
    {
      id: 'm1', name: 'Black Cod Miso', price: 285, category: 'Signature',
      description: 'Nobu signature miso-marinated black cod',
      image: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=400&q=80',
      popular: true,
    },
    {
      id: 'm2', name: 'Yellowtail Jalap', price: 145, category: 'Sashimi',
      description: 'Thinly sliced yellowtail with jalapeño ponzu',
      image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=400&q=80',
      popular: true, spicy: true,
    },
    {
      id: 'm3', name: 'Wagyu Anticucho', price: 320, category: 'Signature',
      description: 'A5 wagyu skewers with Peruvian anticucho sauce',
      image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=400&q=80',
      isNew: true,
    },
    {
      id: 'm4', name: 'Rock Shrimp Tempura', price: 175, category: 'Hot',
      description: 'Crispy rock shrimp, creamy spicy sauce',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80',
      popular: true, spicy: true,
    },
    {
      id: 'm5', name: 'Edamame', price: 45, category: 'Starters',
      description: 'Steamed edamame with sea salt',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      vegetarian: true,
    },
  ],
};

const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'd1', name: "Chef's Special", price: 150, category: 'Signature',
    description: 'Daily rotating signature dish by head chef',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'd2', name: 'Mixed Grill Platter', price: 220, category: 'Grills',
    description: 'Selection of premium grilled meats',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: 'd3', name: 'Mezze Selection', price: 80, category: 'Starters',
    description: 'Traditional Middle Eastern appetizers',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80',
    vegetarian: true,
  },
  {
    id: 'd4', name: 'Fresh Salad', price: 45, category: 'Salads',
    description: 'Garden fresh with house dressing',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    vegetarian: true,
  },
  {
    id: 'd5', name: 'Signature Dessert', price: 60, category: 'Desserts',
    description: 'House special dessert of the day',
    image: 'https://images.unsplash.com/photo-1598110750624-2b85db4a4fd0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'd6', name: 'Premium Juice', price: 25, category: 'Drinks',
    description: 'Fresh pressed seasonal fruits',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
    vegetarian: true,
  },
];

const INFO_TABS = ['MENU', 'INFO', 'REVIEWS'];

export default function RestaurantDetailScreen({ restaurant, guests, onBack, onReserve }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('MENU');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('');
  const [specialReq, setSpecialReq] = useState('');

  const menuItems = MENU_ITEMS[restaurant.id] || DEFAULT_MENU;
  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];
  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter((m) => m.category === activeCategory);

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const addToCart = (id: string) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) =>
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });

  const handleReserve = () => {
    const ref = 'LXR-RST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setShowReserveModal(false);
    onReserve(ref);
  };

  const TIMES = ['12:00', '13:00', '14:00', '19:00', '20:00', '20:30', '21:00', '21:30', '22:00'];
  const DATES = ['Today', 'Tomorrow', 'Wed 30', 'Thu 31', 'Fri 1', 'Sat 2'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Hero — restaurant image full bleed */}
      <View style={styles.hero}>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        {/* Corner brackets over image */}
        <View style={[styles.heroBracket, styles.heroBracketTL]} />
        <View style={[styles.heroBracket, styles.heroBracketTR, { borderLeftWidth: 0, borderRightWidth: 1 }]} />
        <View style={[styles.heroBracket, styles.heroBracketBL, { borderTopWidth: 0, borderBottomWidth: 1 }]} />
        <View style={[styles.heroBracket, styles.heroBracketBR, { borderTopWidth: 0, borderBottomWidth: 1, borderLeftWidth: 0, borderRightWidth: 1 }]} />

        <TouchableOpacity onPress={onBack} style={styles.heroBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        {restaurant.tag && (
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>{restaurant.tag}</Text>
          </View>
        )}
        {restaurant.discount && (
          <View style={styles.heroDiscount}>
            <Text style={styles.heroDiscountText}>{restaurant.discount}</Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.restName}>{restaurant.name}</Text>
            <Text style={styles.restCuisine}>{restaurant.cuisine}  ·  {restaurant.area}, {restaurant.city}</Text>
          </View>
          <View style={[styles.openBadge, !restaurant.isOpen && styles.closedBadgeStyle]}>
            <View style={[styles.openDot, !restaurant.isOpen && styles.closedDot]} />
            <Text style={[styles.openText, !restaurant.isOpen && styles.closedText]}>
              {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>★ {restaurant.rating}</Text>
            <Text style={styles.statLabel}>{restaurant.reviews.toLocaleString()} reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{restaurant.priceRange}</Text>
            <Text style={styles.statLabel}>Price Range</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{restaurant.distance}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{guests}</Text>
            <Text style={styles.statLabel}>Guests</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {INFO_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* MENU TAB */}
        {activeTab === 'MENU' && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                >
                  <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredMenu.map((item) => (
              <View key={item.id} style={styles.menuCard}>
                <View style={styles.menuImageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.menuImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.menuInfo}>
                  <View style={styles.menuTopRow}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <View style={styles.menuBadges}>
                      {item.popular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>BEST</Text>
                        </View>
                      )}
                      {item.spicy && (
                        <View style={styles.spicyBadge}>
                          <Text style={styles.spicyBadgeText}>SPICY</Text>
                        </View>
                      )}
                      {item.vegetarian && (
                        <View style={styles.vegBadge}>
                          <Text style={styles.vegBadgeText}>VEG</Text>
                        </View>
                      )}
                      {item.isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.menuDesc}>{item.description}</Text>
                  <View style={styles.menuBottomRow}>
                    <Text style={styles.menuPrice}>SAR {item.price}</Text>
                    <View style={styles.qtyControl}>
                      {cart[item.id] > 0 ? (
                        <>
                          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyNum}>{cart[item.id]}</Text>
                        </>
                      ) : null}
                      <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.addBtn}>
                        <Text style={styles.addBtnText}>{cart[item.id] > 0 ? '+' : 'ADD'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 120 }} />
          </View>
        )}

        {/* INFO TAB */}
        {activeTab === 'INFO' && (
          <View style={styles.infoTabContent}>
            {[
              { label: 'ADDRESS', value: `${restaurant.area}, ${restaurant.city}, Saudi Arabia` },
              { label: 'CUISINE TYPE', value: restaurant.cuisine },
              { label: 'PRICE RANGE', value: restaurant.priceRange + ' (per person)' },
              { label: 'DELIVERY TIME', value: restaurant.deliveryTime },
              { label: 'DISTANCE', value: restaurant.distance },
              { label: 'STATUS', value: restaurant.isOpen ? 'Open Now' : 'Currently Closed' },
            ].map((info) => (
              <View key={info.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{info.label}</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            ))}

            <Text style={styles.infoSectionTitle}>OPENING HOURS</Text>
            {[
              { day: 'Monday – Thursday', hours: '12:00 PM – 11:00 PM' },
              { day: 'Friday', hours: '1:00 PM – 12:00 AM' },
              { day: 'Saturday – Sunday', hours: '12:00 PM – 12:00 AM' },
            ].map((h) => (
              <View key={h.day} style={styles.hourRow}>
                <Text style={styles.hourDay}>{h.day}</Text>
                <Text style={styles.hourTime}>{h.hours}</Text>
              </View>
            ))}

            <Text style={styles.infoSectionTitle}>AMENITIES</Text>
            <View style={styles.amenitiesGrid}>
              {['Valet Parking', 'Private Dining', 'Live Music', 'Outdoor Seating', 'Kids Menu', 'Halal Certified', 'WiFi', 'Reservations'].map((a) => (
                <View key={a} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>✦ {a}</Text>
                </View>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </View>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'REVIEWS' && (
          <View style={styles.reviewsTabContent}>
            <View style={styles.ratingOverview}>
              <Text style={styles.bigRating}>{restaurant.rating}</Text>
              <Text style={styles.ratingStars}>{'★'.repeat(Math.floor(restaurant.rating))}{'☆'.repeat(5 - Math.floor(restaurant.rating))}</Text>
              <Text style={styles.totalReviews}>{restaurant.reviews.toLocaleString()} Reviews</Text>
            </View>

            {[
              { name: 'Ahmed Al-Rashid', rating: 5, date: '2 days ago', comment: 'Absolutely phenomenal experience. The food quality is unmatched and the ambiance is perfect for a special evening.' },
              { name: 'Sarah Johnson', rating: 5, date: '1 week ago', comment: 'Came here for my anniversary dinner. Everything was perfect from service to dessert. Highly recommend!' },
              { name: 'Mohammed K.', rating: 4, date: '2 weeks ago', comment: 'Great food and excellent service. The signature dish is a must-try. Only minor wait time issue.' },
              { name: 'Priya Sharma', rating: 5, date: '3 weeks ago', comment: 'Best dining experience in Riyadh. Luxurious setting, impeccable service, and food that exceeds expectations.' },
            ].map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewRating}>{'★'.repeat(r.rating)}</Text>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <View style={[styles.cartBar, { bottom: insets.bottom + 16 }]}>
          <View style={styles.cartInfo}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartLabel}>ITEMS SELECTED</Text>
          </View>
          <Text style={styles.cartTotal}>SAR {cartTotal}</Text>
        </View>
      )}

      {/* Reserve Button */}
      <View style={[styles.reserveBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() => setShowReserveModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.reserveBtnText}>✦  RESERVE A TABLE</Text>
          <Text style={styles.reserveBtnSub}>{guests} Guests  ·  {restaurant.city}</Text>
        </TouchableOpacity>
      </View>

      {/* Reservation Modal */}
      <Modal visible={showReserveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>TABLE RESERVATION</Text>
            <Text style={styles.modalSub}>{restaurant.name}  ·  {guests} Guests</Text>

            <Text style={styles.modalLabel}>SELECT DATE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {DATES.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setReserveDate(d)}
                  style={[styles.modalDateChip, reserveDate === d && styles.modalDateChipActive]}
                >
                  <Text style={[styles.modalDateText, reserveDate === d && styles.modalDateTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>SELECT TIME</Text>
            <View style={styles.timeGrid}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setReserveTime(t)}
                  style={[styles.timeChip, reserveTime === t && styles.timeChipActive]}
                >
                  <Text style={[styles.timeText, reserveTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>SPECIAL REQUESTS (OPTIONAL)</Text>
            <TextInput
              style={styles.specialInput}
              placeholder="Allergies, celebrations, seating preferences..."
              placeholderTextColor="#55556A"
              value={specialReq}
              onChangeText={setSpecialReq}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={[styles.confirmBtn, (!reserveDate || !reserveTime) && styles.confirmBtnDisabled]}
              onPress={handleReserve}
              disabled={!reserveDate || !reserveTime}
            >
              <Text style={styles.confirmBtnText}>CONFIRM RESERVATION</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowReserveModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  // Hero
  hero: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F55',
  },
  heroBracket: {
    position: 'absolute',
    width: 20, height: 20,
    borderColor: '#C9A84C60',
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  heroBracketTL: { top: 16, left: 16 },
  heroBracketTR: { top: 16, right: 16 },
  heroBracketBL: { bottom: 16, left: 16 },
  heroBracketBR: { bottom: 16, right: 16 },
  heroBack: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0A0A0F80', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#C9A84C', fontSize: 20 },
  heroTag: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: '#C9A84C',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  heroTagText: { color: '#0A0A0F', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroDiscount: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: '#1A2A1A', borderWidth: 1, borderColor: '#4CAF50',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  heroDiscountText: { color: '#4CAF50', fontSize: 11, fontWeight: '700' },

  // Info Card
  infoCard: {
    backgroundColor: '#0E0E15', marginHorizontal: 16, marginTop: -24,
    borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#C9A84C20',
  },
  infoTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  restName: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  restCuisine: { color: '#55556A', fontSize: 12 },
  openBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1A2A1A', borderWidth: 1, borderColor: '#4CAF5040',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  closedBadgeStyle: { backgroundColor: '#2A1A1A', borderColor: '#FF444440' },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  closedDot: { backgroundColor: '#FF4444' },
  openText: { color: '#4CAF50', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  closedText: { color: '#FF4444' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#C9A84C', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  statLabel: { color: '#55556A', fontSize: 9, letterSpacing: 0.5, textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: '#55556A20' },

  // Tabs
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#0E0E15', borderRadius: 12,
    borderWidth: 1, borderColor: '#C9A84C14', overflow: 'hidden',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#C9A84C14', borderBottomWidth: 2, borderBottomColor: '#C9A84C' },
  tabText: { color: '#55556A', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  tabTextActive: { color: '#C9A84C' },

  // Category
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#0E0E15', borderWidth: 1, borderColor: '#55556A30', marginRight: 8,
  },
  catChipActive: { backgroundColor: '#C9A84C14', borderColor: '#C9A84C' },
  catText: { color: '#55556A', fontSize: 12 },
  catTextActive: { color: '#C9A84C', fontWeight: '600' },

  // Menu Card
  menuCard: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#0E0E15', borderRadius: 16,
    borderWidth: 1, borderColor: '#C9A84C14', padding: 12,
  },
  menuImageWrapper: {
    width: 80, height: 80, borderRadius: 12,
    overflow: 'hidden', marginRight: 14,
  },
  menuImage: { width: '100%', height: '100%' },
  menuInfo: { flex: 1 },
  menuTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  menuName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', flex: 1, letterSpacing: 0.3 },
  menuBadges: { flexDirection: 'row', gap: 4 },
  popularBadge: { backgroundColor: '#C9A84C', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  popularBadgeText: { color: '#0A0A0F', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  spicyBadge: { backgroundColor: '#FF4D0014', borderWidth: 1, borderColor: '#FF4D0040', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  spicyBadgeText: { color: '#FF4D00', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  vegBadge: { backgroundColor: '#4CAF5014', borderWidth: 1, borderColor: '#4CAF5040', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  vegBadgeText: { color: '#4CAF50', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  newBadge: { backgroundColor: '#C9A84C', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  newBadgeText: { color: '#0A0A0F', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  menuDesc: { color: '#55556A', fontSize: 10, lineHeight: 15, marginBottom: 10 },
  menuBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuPrice: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: '#C9A84C', fontSize: 16 },
  qtyNum: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  addBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#0A0A0F', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // Info Tab
  infoTabContent: { paddingHorizontal: 20, paddingTop: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#C9A84C10',
  },
  infoLabel: { color: '#55556A', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  infoValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  infoSectionTitle: { color: '#C9A84C', fontSize: 10, fontWeight: '700', letterSpacing: 3, marginTop: 24, marginBottom: 12 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  hourDay: { color: '#FFFFFF', fontSize: 13 },
  hourTime: { color: '#C9A84C', fontSize: 13 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  amenityChip: {
    backgroundColor: '#C9A84C08', borderWidth: 1, borderColor: '#C9A84C20',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  amenityText: { color: '#C9A84C', fontSize: 11 },

  // Reviews
  reviewsTabContent: { paddingHorizontal: 20, paddingTop: 16 },
  ratingOverview: {
    alignItems: 'center', paddingVertical: 24,
    borderBottomWidth: 1, borderBottomColor: '#C9A84C14', marginBottom: 20,
  },
  bigRating: { color: '#F0C040', fontSize: 64, fontWeight: '200', letterSpacing: -2 },
  ratingStars: { color: '#F0C040', fontSize: 20, marginBottom: 4 },
  totalReviews: { color: '#55556A', fontSize: 12 },
  reviewCard: {
    backgroundColor: '#0E0E15', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#C9A84C14',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#C9A84C20', borderWidth: 1, borderColor: '#C9A84C40',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  reviewAvatarText: { color: '#C9A84C', fontSize: 16, fontWeight: '700' },
  reviewName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  reviewDate: { color: '#55556A', fontSize: 10 },
  reviewRating: { color: '#F0C040', fontSize: 14 },
  reviewComment: { color: '#FFFFFFB0', fontSize: 12, lineHeight: 18 },

  // Cart
  cartBar: {
    position: 'absolute', left: 20, right: 20,
    backgroundColor: '#13131A', borderRadius: 14,
    borderWidth: 1, borderColor: '#C9A84C40',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCountBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
  },
  cartCountText: { color: '#0A0A0F', fontSize: 13, fontWeight: '800' },
  cartLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  cartTotal: { color: '#C9A84C', fontSize: 16, fontWeight: '800' },

  // Reserve
  reserveBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: '#0A0A0F', borderTopWidth: 1, borderTopColor: '#C9A84C14',
  },
  reserveBtn: { backgroundColor: '#C9A84C', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  reserveBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  reserveBtnSub: { color: '#0A0A0F80', fontSize: 11, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#0A0A0F90', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0E0E15', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: '#C9A84C20', padding: 24,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#C9A84C40', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#C9A84C', fontSize: 16, fontWeight: '800', letterSpacing: 4, textAlign: 'center', marginBottom: 4 },
  modalSub: { color: '#55556A', fontSize: 12, textAlign: 'center', marginBottom: 24 },
  modalLabel: { color: '#55556A', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  modalDateChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#55556A30', marginRight: 10,
  },
  modalDateChipActive: { backgroundColor: '#C9A84C14', borderColor: '#C9A84C' },
  modalDateText: { color: '#55556A', fontSize: 13 },
  modalDateTextActive: { color: '#C9A84C', fontWeight: '700' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#55556A30',
  },
  timeChipActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  timeText: { color: '#55556A', fontSize: 13 },
  timeTextActive: { color: '#0A0A0F', fontWeight: '700' },
  specialInput: {
    backgroundColor: '#13131A', borderWidth: 1, borderColor: '#55556A30',
    borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 13,
    marginBottom: 20, minHeight: 70,
  },
  confirmBtn: { backgroundColor: '#C9A84C', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelBtnText: { color: '#55556A', fontSize: 13 },
});