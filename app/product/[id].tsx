import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useProductsStore } from '@/lib/store/productsStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
 
const COLORS = {
  background: '#0A0A0F',
  cardBg: '#0E0E15',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  goldDim: 'rgba(201, 168, 76, 0.08)',
  goldBorder: 'rgba(201, 168, 76, 0.2)',
  white: '#FFFFFF',
  grey: '#55556A',
  greyLight: '#8888A0',
  surface: '#12121A',
  error: '#FF4444',
  success: '#22C55E',
};
 
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
 
  const { selectedProduct, isLoadingProduct, error, fetchProductById } = useProductsStore();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isWishlisted, fetchWishlist } = useWishlistStore();
  const { user } = useAuthStore();
 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
 
  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);
 
  useEffect(() => {
    if (user?.id) {
      fetchWishlist(user.id);
    }
  }, [user?.id]);
 
  const wishlisted = selectedProduct ? isWishlisted(selectedProduct.id) : false;
 
  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!selectedProduct || wishlistLoading) return;
 
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(user.id, selectedProduct.id);
      } else {
        await addToWishlist(user.id, selectedProduct.id);
      }
    } catch {
      // silent fail — store handles error
    } finally {
      setWishlistLoading(false);
    }
  };
 
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!selectedProduct) return;
 
    setCartError(null);
    try {
      await addItem(user.id, selectedProduct.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch {
      setCartError('Failed to add to cart. Please try again.');
    }
  };
 
  const formatPrice = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };
 
  if (isLoadingProduct) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>LOADING PRODUCT...</Text>
      </View>
    );
  }
 
  if (error || !selectedProduct) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>PRODUCT NOT FOUND</Text>
        <Text style={styles.errorSubtitle}>{error ?? 'This product does not exist.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  const product = selectedProduct;
  const images = product.images && product.images.length > 0 ? product.images : [];
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
 
      {/* Back Button — Floating */}
      <TouchableOpacity
        style={styles.floatingBackBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingBackIcon}>←</Text>
      </TouchableOpacity>
 
      {/* Right Floating Buttons — Wishlist + Cart */}
      <View style={styles.floatingRightBtns}>
 
        {/* Wishlist Toggle */}
        <TouchableOpacity
          style={[
            styles.floatingIconBtn,
            wishlisted && styles.floatingIconBtnActive,
          ]}
          onPress={handleWishlistToggle}
          activeOpacity={0.8}
          disabled={wishlistLoading}
        >
          {wishlistLoading ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={[
              styles.floatingIconText,
              wishlisted && styles.floatingIconTextActive,
            ]}>
              {wishlisted ? '♥' : '♡'}
            </Text>
          )}
        </TouchableOpacity>
 
        {/* Cart */}
        <TouchableOpacity
          style={styles.floatingIconBtn}
          onPress={() => router.push('/(tabs)/cart' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingIconText}>⊡</Text>
        </TouchableOpacity>
 
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
 
        {/* Image Section */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>◈</Text>
            </View>
          )}
 
          {/* Badges */}
          <View style={styles.badgesRow}>
            {isOutOfStock && (
              <View style={[styles.badge, styles.badgeRed]}>
                <Text style={styles.badgeText}>OUT OF STOCK</Text>
              </View>
            )}
            {isLowStock && (
              <View style={[styles.badge, styles.badgeGold]}>
                <Text style={[styles.badgeText, { color: COLORS.background }]}>
                  ONLY {product.stock_quantity} LEFT
                </Text>
              </View>
            )}
            {hasDiscount && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeText}>{discountPercent}% OFF</Text>
              </View>
            )}
            {product.is_featured && (
              <View style={[styles.badge, styles.badgeFeatured]}>
                <Text style={styles.badgeText}>FEATURED</Text>
              </View>
            )}
          </View>
 
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <View style={styles.thumbnailRow}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
 
        {/* Product Info */}
        <View style={styles.infoSection}>
 
          {/* Brand + Category */}
          <View style={styles.metaRow}>
            {product.brand && (
              <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
            )}
            {product.categories && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {product.categories.name.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
 
          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>
 
          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>{formatPrice(product.price)}</Text>
            {hasDiscount && (
              <Text style={styles.priceCompare}>
                {formatPrice(product.compare_price!)}
              </Text>
            )}
          </View>
 
          {/* Short Description */}
          {product.short_description && (
            <Text style={styles.shortDesc}>{product.short_description}</Text>
          )}
 
          {/* Divider */}
          <View style={styles.divider} />
 
          {/* Full Description */}
          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}
 
          {/* Divider */}
          <View style={styles.divider} />
 
          {/* Details Grid */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionLabel}>DETAILS</Text>
            <View style={styles.detailsGrid}>
              {product.sku && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>SKU</Text>
                  <Text style={styles.detailValue}>{product.sku}</Text>
                </View>
              )}
              {product.brand && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>BRAND</Text>
                  <Text style={styles.detailValue}>{product.brand}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>CURRENCY</Text>
                <Text style={styles.detailValue}>{product.currency}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>AVAILABILITY</Text>
                <Text style={[
                  styles.detailValue,
                  { color: isOutOfStock ? COLORS.error : COLORS.success }
                ]}>
                  {isOutOfStock ? 'OUT OF STOCK' : `${product.stock_quantity} IN STOCK`}
                </Text>
              </View>
            </View>
          </View>
 
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>TAGS</Text>
              <View style={styles.tagsRow}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
 
          {/* Quantity Selector */}
          {!isOutOfStock && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionLabel}>QUANTITY</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  activeOpacity={0.75}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.quantityBtn,
                    quantity >= product.stock_quantity && styles.quantityBtnDisabled,
                  ]}
                  onPress={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  activeOpacity={0.75}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.quantityMax}>
                  MAX {product.stock_quantity}
                </Text>
              </View>
            </View>
          )}
 
          {/* Cart Error */}
          {cartError && (
            <View style={styles.cartErrorBox}>
              <Text style={styles.cartErrorText}>{cartError}</Text>
            </View>
          )}
 
          {/* Bottom padding for sticky button */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
 
      {/* Sticky Bottom — Add to Cart */}
      <View style={styles.stickyBottom}>
        <View style={styles.stickyPriceCol}>
          <Text style={styles.stickyPriceLabel}>TOTAL</Text>
          <Text style={styles.stickyPrice}>
            {formatPrice(Number(product.price) * quantity)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            (isOutOfStock || cartLoading) && styles.addToCartBtnDisabled,
            addedToCart && styles.addToCartBtnSuccess,
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || cartLoading}
          activeOpacity={0.85}
        >
          {cartLoading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.addToCartBtnText}>
              {isOutOfStock
                ? 'OUT OF STOCK'
                : addedToCart
                ? 'ADDED TO CART ✓'
                : 'ADD TO CART'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
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
    paddingHorizontal: 32,
  },
 
  // ─── FLOATING BUTTONS ─────────────────────
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 46 : 56,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,10,15,0.85)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackIcon: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '300',
  },
  floatingRightBtns: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 46 : 56,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    gap: 8,
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,10,15,0.85)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIconBtnActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderColor: COLORS.gold,
  },
  floatingIconText: {
    color: COLORS.gold,
    fontSize: 18,
  },
  floatingIconTextActive: {
    color: COLORS.goldLight,
  },
 
  // ─── IMAGE SECTION ─────────────────────────
  imageSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.1,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
  },
  imagePlaceholderIcon: {
    color: COLORS.goldBorder,
    fontSize: 64,
  },
  badgesRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeRed: {
    backgroundColor: 'rgba(255,68,68,0.9)',
  },
  badgeGold: {
    backgroundColor: 'rgba(201,168,76,0.95)',
  },
  badgeGreen: {
    backgroundColor: 'rgba(34,197,94,0.9)',
  },
  badgeFeatured: {
    backgroundColor: 'rgba(10,10,15,0.85)',
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  thumbnailRow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
 
  // ─── INFO SECTION ──────────────────────────
  infoSection: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
  },
  categoryBadge: {
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  productName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 0.5,
    lineHeight: 32,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  priceMain: {
    color: COLORS.goldLight,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceCompare: {
    color: COLORS.grey,
    fontSize: 16,
    fontWeight: '300',
    textDecorationLine: 'line-through',
  },
  shortDesc: {
    color: COLORS.greyLight,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.3,
    lineHeight: 22,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.goldBorder,
    marginVertical: 20,
  },
  descSection: {
    marginBottom: 4,
  },
  sectionLabel: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },
  descText: {
    color: COLORS.greyLight,
    fontSize: 13,
    fontWeight: '300',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  detailsSection: {
    marginBottom: 4,
  },
  detailsGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.08)',
  },
  detailKey: {
    color: COLORS.grey,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  tagsSection: {
    marginTop: 20,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    color: COLORS.greyLight,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  quantitySection: {
    marginTop: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  quantityBtnDisabled: {
    opacity: 0.35,
  },
  quantityBtnText: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 22,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  quantityValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 1,
  },
  quantityMax: {
    color: COLORS.grey,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  cartErrorBox: {
    marginTop: 16,
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 8,
    padding: 12,
  },
  cartErrorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
 
  // ─── STICKY BOTTOM ─────────────────────────
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.goldBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 16 : 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stickyPriceCol: {
    flex: 0,
  },
  stickyPriceLabel: {
    color: COLORS.grey,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 2,
  },
  stickyPrice: {
    color: COLORS.goldLight,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtnDisabled: {
    backgroundColor: COLORS.grey,
    opacity: 0.5,
  },
  addToCartBtnSuccess: {
    backgroundColor: COLORS.success,
  },
  addToCartBtnText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
 
  // ─── ERROR / LOADING ───────────────────────
  loadingText: {
    color: COLORS.grey,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  errorIcon: {
    color: COLORS.error,
    fontSize: 48,
    marginBottom: 8,
  },
  errorTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  errorSubtitle: {
    color: COLORS.grey,
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backBtnText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
 