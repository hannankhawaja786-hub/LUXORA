import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../lib/store/authStore';
import { useCartStore } from '../../lib/store/cartStore';
import { useProductsStore } from '../../lib/store/productsStore';
import { useWishlistStore } from '../../lib/store/wishlistStore';
import type { Category, Product } from '../../lib/types/database.types';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
 
const COLORS = {
  background: '#0A0A0F',
  cardBg:     '#0E0E15',
  gold:       '#C9A84C',
  goldLight:  '#F0C040',
  goldDim:    'rgba(201, 168, 76, 0.08)',
  goldBorder: 'rgba(201, 168, 76, 0.2)',
  white:      '#FFFFFF',
  grey:       '#55556A',
  greyLight:  '#8888A0',
  surface:    '#12121A',
  error:      '#FF4444',
};
 
export default function ProductsScreen() {
  const router = useRouter();
 
  const {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    fetchCategories,
  } = useProductsStore();
 
  const { totalItems, fetchCart } = useCartStore();
  const {
    items: wishlistItems,
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    fetchWishlist,
  } = useWishlistStore();
  const { user } = useAuthStore();
 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [wishlistTogglingId, setWishlistTogglingId] = useState<string | null>(null);
 
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (user?.id) {
      fetchCart(user.id);
      fetchWishlist(user.id);
    }
  }, [user?.id]);
 
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories(),
      selectedCategory
        ? fetchProductsByCategory(selectedCategory)
        : fetchProducts(),
    ]);
    setRefreshing(false);
  }, [selectedCategory]);
 
  const handleCategoryPress = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      fetchProductsByCategory(slug);
    } else {
      fetchProducts();
    }
  };
 
  const handleWishlistToggle = async (productId: string) => {
    if (!user) {
      router.push('/(auth)/login' as any);
      return;
    }
    if (wishlistTogglingId) return;
    setWishlistTogglingId(productId);
    try {
      if (isWishlisted(productId)) {
        await removeFromWishlist(user.id, productId);
      } else {
        await addToWishlist(user.id, productId);
      }
    } catch {
      // silent — store handles
    } finally {
      setWishlistTogglingId(null);
    }
  };
 
  const filteredAndSortedProducts = (): Product[] => {
    let result = [...products];
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }
    return result;
  };
 
  const formatPrice = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
  };
 
  const sortLabel = () => {
    switch (sortBy) {
      case 'price_asc': return 'PRICE: LOW TO HIGH';
      case 'price_desc': return 'PRICE: HIGH TO LOW';
      default: return 'NEWEST FIRST';
    }
  };
 
  const renderProductCard = ({ item, index }: { item: Product; index: number }) => {
    const isLeftCard = index % 2 === 0;
    const wishlisted = isWishlisted(item.id);
    const isToggling = wishlistTogglingId === item.id;
 
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          { marginLeft: isLeftCard ? 16 : 8, marginRight: isLeftCard ? 8 : 16 },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
      >
        <View style={styles.productImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImageIcon}>◈</Text>
            </View>
          )}
 
          {/* Stock Badges */}
          {item.stock_quantity === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
          {item.stock_quantity > 0 && item.stock_quantity <= 5 && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>ONLY {item.stock_quantity} LEFT</Text>
            </View>
          )}
 
          {/* Wishlist Heart — top right corner of image */}
          <TouchableOpacity
            style={[styles.wishlistBtn, wishlisted && styles.wishlistBtnActive]}
            onPress={() => handleWishlistToggle(item.id)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {isToggling ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <Text style={[styles.wishlistBtnIcon, wishlisted && styles.wishlistBtnIconActive]}>
                {wishlisted ? '♥' : '♡'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
 
        <View style={styles.productInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category_id ? 'LUXURY ITEM' : 'UNCATEGORIZED'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            <TouchableOpacity
              style={styles.addToCartBtn}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
            >
              <Text style={styles.addToCartIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
 
  const renderCategoryPill = (category: Category) => {
    const isSelected = selectedCategory === category.slug;
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
        onPress={() => handleCategoryPress(category.slug)}
        activeOpacity={0.75}
      >
        <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
          {category.name.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };
 
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>◇</Text>
      <Text style={styles.emptyTitle}>NO PRODUCTS FOUND</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.length > 0
          ? 'Try a different search term'
          : 'No products available in this category'}
      </Text>
    </View>
  );
 
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>!</Text>
      <Text style={styles.emptyTitle}>FAILED TO LOAD</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts()}>
        <Text style={styles.retryBtnText}>RETRY</Text>
      </TouchableOpacity>
    </View>
  );
 
  const displayedProducts = filteredAndSortedProducts();
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
 
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
 
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>COLLECTION</Text>
          <Text style={styles.headerTitle}>Our Products</Text>
        </View>
 
        {/* Right — Wishlist + Cart */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/wishlist' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>♡</Text>
            {wishlistItems.length > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>
                  {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/cart' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>⊡</Text>
            {totalItems > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
 
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>○</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={COLORS.gold}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
            <Text style={styles.searchClearText}>X</Text>
          </TouchableOpacity>
        )}
      </View>
 
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[styles.categoryPill, selectedCategory === null && styles.categoryPillActive]}
            onPress={() => handleCategoryPress(null)}
            activeOpacity={0.75}
          >
            <Text style={[styles.categoryPillText, selectedCategory === null && styles.categoryPillTextActive]}>
              ALL
            </Text>
          </TouchableOpacity>
          {categories.map(renderCategoryPill)}
        </ScrollView>
      </View>
 
      <View style={styles.sortBar}>
        <Text style={styles.sortResultCount}>
          {displayedProducts.length} ITEM{displayedProducts.length !== 1 ? 'S' : ''}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
          activeOpacity={0.75}
        >
          <Text style={styles.sortButtonText}>{sortLabel()}</Text>
          <Text style={styles.sortChevron}>{showSortMenu ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
 
      {showSortMenu && (
        <View style={styles.sortDropdown}>
          {(['newest', 'price_asc', 'price_desc'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
              onPress={() => { setSortBy(option); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                {option === 'newest' ? 'NEWEST FIRST' : option === 'price_asc' ? 'PRICE: LOW TO HIGH' : 'PRICE: HIGH TO LOW'}
              </Text>
              {sortBy === option && <Text style={styles.sortOptionCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
 
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>LOADING PRODUCTS...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsGrid}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
 
  // ─── HEADER ────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 56,
    paddingBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '300',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnText: {
    color: COLORS.gold,
    fontSize: 16,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.gold,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  iconBadgeText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
 
  // ─── SEARCH ─────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    color: COLORS.grey,
    fontSize: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  searchClearBtn: { padding: 4 },
  searchClearText: {
    color: COLORS.grey,
    fontSize: 11,
    fontWeight: '700',
  },
 
  // ─── CATEGORIES ─────────────────────────────
  categoriesSection: {
    marginBottom: 12,
    height: 40,
    justifyContent: 'center',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  categoryPillActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  categoryPillText: {
    color: COLORS.greyLight,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  categoryPillTextActive: {
    color: COLORS.background,
  },
 
  // ─── SORT BAR ───────────────────────────────
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sortResultCount: {
    color: COLORS.grey,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortButtonText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  sortChevron: { color: COLORS.gold, fontSize: 8 },
  sortDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 200 : 208,
    right: 16,
    zIndex: 999,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
  },
  sortOptionActive: { backgroundColor: COLORS.goldDim },
  sortOptionText: {
    color: COLORS.greyLight,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  sortOptionTextActive: { color: COLORS.gold },
  sortOptionCheck: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
 
  // ─── PRODUCTS GRID ──────────────────────────
  productsGrid: { paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
  },
  productImageIcon: { color: COLORS.goldBorder, fontSize: 36 },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,68,68,0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outOfStockText: { color: COLORS.white, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(201, 168, 76, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lowStockText: { color: COLORS.background, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
 
  // ─── WISHLIST HEART on card ──────────────────
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10,10,15,0.75)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderColor: COLORS.gold,
  },
  wishlistBtnIcon: { color: COLORS.greyLight, fontSize: 14 },
  wishlistBtnIconActive: { color: COLORS.goldLight },
 
  productInfo: { padding: 12 },
  productCategory: { color: COLORS.gold, fontSize: 8, fontWeight: '600', letterSpacing: 2, marginBottom: 4 },
  productName: { color: COLORS.white, fontSize: 13, fontWeight: '300', letterSpacing: 0.3, lineHeight: 18, marginBottom: 10 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: COLORS.goldLight, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  addToCartBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center' },
  addToCartIcon: { color: COLORS.background, fontSize: 18, fontWeight: '300', lineHeight: 20 },
 
  // ─── LOADING / EMPTY / ERROR ─────────────────
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: COLORS.grey, fontSize: 11, fontWeight: '600', letterSpacing: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { color: COLORS.goldBorder, fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: COLORS.white, fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  emptySubtitle: { color: COLORS.grey, fontSize: 12, fontWeight: '300', letterSpacing: 0.5, textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { marginTop: 8, borderWidth: 1, borderColor: COLORS.goldBorder, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '600', letterSpacing: 2 },
});
 