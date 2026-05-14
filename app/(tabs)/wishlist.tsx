// ============================================================
// LUXORA — app/(tabs)/wishlist.tsx
// Full wishlist screen with luxury dark gold theme
// ============================================================
 
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { WishlistItemWithProduct } from '../../lib/types/database.types';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
 
const COLORS = {
  background:  '#0A0A0F',
  cardBg:      '#0E0E15',
  gold:        '#C9A84C',
  goldLight:   '#F0C040',
  goldDim:     'rgba(201, 168, 76, 0.08)',
  goldBorder:  'rgba(201, 168, 76, 0.2)',
  white:       '#FFFFFF',
  grey:        '#55556A',
  greyLight:   '#8888A0',
  surface:     '#12121A',
  error:       '#FF4444',
  errorDim:    'rgba(255, 68, 68, 0.1)',
  success:     '#22C55E',
  successDim:  'rgba(34, 197, 94, 0.1)',
};
 
// ─── Wishlist Item Card ──────────────────────────────────────
interface WishlistCardProps {
  item: WishlistItemWithProduct;
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onPress: (productId: string) => void;
  addingToCart: string | null;
}
 
function WishlistCard({
  item,
  onRemove,
  onAddToCart,
  onPress,
  addingToCart,
}: WishlistCardProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
 
  const product = item.products;
  const imageUri = product.images && product.images.length > 0 ? product.images[0] : null;
  const isOutOfStock = product.stock_quantity === 0;
  const isAddingThis = addingToCart === product.id;
 
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start();
  }, []);
 
  const handleRemove = () => {
    Alert.alert(
      'REMOVE FROM WISHLIST',
      `Remove "${product.name}" from your wishlist?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'REMOVE',
          style: 'destructive',
          onPress: () => {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.85,
                duration: 250,
                useNativeDriver: false,
              }),
            ]).start(() => onRemove(product.id));
          },
        },
      ]
    );
  };
 
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
 
  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;
 
  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(product.id)}
        style={styles.cardInner}
      >
        {/* Image */}
        <View style={styles.cardImageBox}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImageIcon}>◈</Text>
            </View>
          )}
 
          {/* Discount Badge */}
          {discountPct && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPct}%</Text>
            </View>
          )}
 
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>SOLD OUT</Text>
            </View>
          )}
 
          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={handleRemove}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
 
        {/* Info */}
        <View style={styles.cardBody}>
          {product.brand && (
            <Text style={styles.cardBrand} numberOfLines={1}>
              {product.brand.toUpperCase()}
            </Text>
          )}
          <Text style={styles.cardName} numberOfLines={2}>
            {product.name}
          </Text>
 
          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>{formatPrice(product.price)}</Text>
            {product.compare_price && product.compare_price > product.price && (
              <Text style={styles.cardComparePrice}>
                {formatPrice(product.compare_price)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
 
      {/* Add to Cart Button */}
      <TouchableOpacity
        style={[
          styles.addToCartBtn,
          isOutOfStock && styles.addToCartBtnDisabled,
          isAddingThis && styles.addToCartBtnLoading,
        ]}
        onPress={() => !isOutOfStock && !isAddingThis && onAddToCart(product.id)}
        activeOpacity={0.8}
        disabled={isOutOfStock || isAddingThis}
      >
        {isAddingThis ? (
          <ActivityIndicator size="small" color={COLORS.background} />
        ) : (
          <Text
            style={[
              styles.addToCartBtnText,
              isOutOfStock && styles.addToCartBtnTextDisabled,
            ]}
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
 
// ─── Main Wishlist Screen ────────────────────────────────────
export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
 
  const { items, isLoading, error, fetchWishlist, removeItem, clearError } =
    useWishlistStore();
  const { addItem: addToCart } = useCartStore();
 
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
 
  const contentSlide = useRef(new Animated.Value(24)).current;
  const hasAnimated = useRef(false);
 
  const runEntryAnim = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    Animated.timing(contentSlide, {
      toValue: 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, []);
 
  useEffect(() => {
    if (user?.id) {
      fetchWishlist(user.id).then(runEntryAnim);
    } else {
      runEntryAnim();
    }
  }, [user?.id]);
 
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchWishlist(user.id);
    setRefreshing(false);
  }, [user?.id]);
 
  const handleRemove = useCallback(
    (productId: string) => {
      if (!user?.id) return;
      removeItem(user.id, productId);
    },
    [user?.id]
  );
 
  const handleAddToCart = useCallback(
    async (productId: string) => {
      if (!user?.id) return;
      setAddingToCart(productId);
      try {
        await addToCart(user.id, productId, 1);
        setAddedToCart(productId);
        setTimeout(() => setAddedToCart(null), 2000);
      } catch {
        Alert.alert('Error', 'Could not add item to cart. Please try again.');
      } finally {
        setAddingToCart(null);
      }
    },
    [user?.id]
  );
 
  const handleProductPress = (productId: string) => {
    router.push({ pathname: '/product/[id]', params: { id: productId } });
  };
 
  const handleClearWishlist = () => {
    if (!user?.id || items.length === 0) return;
    Alert.alert(
      'CLEAR WISHLIST',
      'Remove all items from your wishlist?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'CLEAR ALL',
          style: 'destructive',
          onPress: () => {
            items.forEach((item) => removeItem(user.id!, item.product_id));
          },
        },
      ]
    );
  };
 
  // ─── Loading ───────────────────────────────────────────────
  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>LOADING WISHLIST...</Text>
      </View>
    );
  }
 
  // ─── Not Logged In ─────────────────────────────────────────
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.emptyIcon}>◈</Text>
        <Text style={styles.emptyTitle}>SIGN IN REQUIRED</Text>
        <Text style={styles.emptySubtitle}>
          Please sign in to view your wishlist
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/(auth)/login' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyBtnText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  // ─── Empty ─────────────────────────────────────────────────
  if (!isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
 
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>LUXORA</Text>
            <Text style={styles.headerTitle}>WISHLIST</Text>
          </View>
          <View style={styles.backBtn} />
        </View>
 
        <View style={styles.emptyState}>
          <View style={styles.emptyIconRing}>
            <Text style={styles.emptyIconLarge}>◇</Text>
          </View>
          <Text style={styles.emptyTitle}>YOUR WISHLIST IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Save items you love and come back to them anytime
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/(tabs)/products' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyBtnText}>EXPLORE COLLECTION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
 
  // ─── Main View ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
 
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>LUXORA</Text>
          <Text style={styles.headerTitle}>WISHLIST</Text>
        </View>
 
        {/* Clear All */}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearWishlist}
          activeOpacity={0.75}
        >
          <Text style={styles.clearBtnText}>CLEAR</Text>
        </TouchableOpacity>
      </View>
 
      {/* Gold Divider */}
      <View style={styles.headerDivider} />
 
      {/* Item Count */}
      <Animated.View
        style={[styles.countRow, { transform: [{ translateY: contentSlide }] }]}
      >
        <Text style={styles.countText}>
          {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
        </Text>
 
        {/* Added to Cart Toast */}
        {addedToCart && (
          <View style={styles.toastBadge}>
            <Text style={styles.toastBadgeText}>✓ ADDED TO CART</Text>
          </View>
        )}
      </Animated.View>
 
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={clearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.errorBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
 
      {/* Grid */}
      <Animated.View
        style={[styles.gridWrapper, { transform: [{ translateY: contentSlide }] }]}
      >
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
        >
          <View style={styles.gridRow}>
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                onPress={handleProductPress}
                addingToCart={addingToCart}
              />
            ))}
          </View>
 
          {/* Bottom CTA */}
          <View style={styles.bottomCta}>
            <View style={styles.bottomDivider} />
            <TouchableOpacity
              style={styles.shopMoreBtn}
              onPress={() => router.push('/(tabs)/products' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.shopMoreBtnText}>CONTINUE SHOPPING</Text>
            </TouchableOpacity>
          </View>
 
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}
 
// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.grey,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 8,
  },
 
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: COLORS.gold,
    fontSize: 18,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 8,
  },
  clearBtnText: {
    color: COLORS.greyLight,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: COLORS.goldBorder,
    marginHorizontal: 20,
  },
 
  // Count Row
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  countText: {
    color: COLORS.greyLight,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
  },
  toastBadge: {
    backgroundColor: COLORS.successDim,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toastBadgeText: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
 
  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 11,
    flex: 1,
  },
  errorBannerClose: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
  },
 
  // Grid
  gridWrapper: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: 16,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
 
  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
  },
  cardImageBox: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  cardImageIcon: {
    color: COLORS.goldBorder,
    fontSize: 32,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,15,0.75)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  outOfStockText: {
    color: COLORS.greyLight,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(10,10,15,0.75)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: COLORS.greyLight,
    fontSize: 10,
  },
 
  // Card Body
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardBrand: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardPrice: {
    color: COLORS.goldLight,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardComparePrice: {
    color: COLORS.grey,
    fontSize: 11,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
 
  // Add to Cart Button
  addToCartBtn: {
    margin: 12,
    marginTop: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  addToCartBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  addToCartBtnLoading: {
    opacity: 0.7,
  },
  addToCartBtnText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  addToCartBtnTextDisabled: {
    color: COLORS.grey,
  },
 
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.goldDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIconLarge: {
    color: COLORS.gold,
    fontSize: 36,
  },
  emptyIcon: {
    color: COLORS.gold,
    fontSize: 40,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.grey,
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
 
  // Bottom CTA
  bottomCta: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: COLORS.goldBorder,
    width: '100%',
  },
  shopMoreBtn: {
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  shopMoreBtnText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
