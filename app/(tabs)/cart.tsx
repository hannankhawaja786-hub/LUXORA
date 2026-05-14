// ============================================================
// LUXORA — app/(tabs)/cart.tsx
// ============================================================

import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CartItemWithProduct } from '../../lib/types/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  errorDim:   'rgba(255, 68, 68, 0.1)',
  success:    '#22C55E',
};

// ─── Cart Item Row ────────────────────────────────────────────
interface CartItemRowProps {
  item:             CartItemWithProduct;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove:         (id: string) => void;
  onPress:          (productId: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove, onPress }: CartItemRowProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const product   = item.products;
  const imageUri  = product.images && product.images.length > 0 ? product.images[0] : null;
  const subtotal  = product.price * item.quantity;

  const handleRemove = () => {
    Alert.alert(
      'REMOVE ITEM',
      `Remove "${product.name}" from your cart?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text:  'REMOVE',
          style: 'destructive',
          onPress: () => {
            Animated.timing(slideAnim, {
              toValue:         -SCREEN_WIDTH,
              duration:        280,
              useNativeDriver: false,
            }).start(() => onRemove(item.id));
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  return (
    <Animated.View style={[styles.cartItemWrapper, { transform: [{ translateX: slideAnim }] }]}>
      <TouchableOpacity
        style={styles.cartItem}
        onPress={() => onPress(product.id)}
        activeOpacity={0.85}
      >
        {/* Product Image */}
        <View style={styles.itemImageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Text style={styles.itemImageIcon}>◈</Text>
            </View>
          )}
          {product.stock_quantity === 0 && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockOverlayText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        {/* Item Info */}
        <View style={styles.itemInfo}>
          {product.brand && (
            <Text style={styles.itemBrand} numberOfLines={1}>
              {product.brand.toUpperCase()}
            </Text>
          )}
          <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>

          <View style={styles.itemFooter}>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDim]}
                onPress={() => item.quantity > 1 && onUpdateQuantity(item.id, item.quantity - 1)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
              </View>
              <TouchableOpacity
                style={[styles.qtyBtn, item.quantity >= product.stock_quantity && styles.qtyBtnDim]}
                onPress={() =>
                  item.quantity < product.stock_quantity &&
                  onUpdateQuantity(item.id, item.quantity + 1)
                }
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemSubtotal}>{formatPrice(subtotal)}</Text>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={handleRemove}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.itemDivider} />
    </Animated.View>
  );
}

// ─── Main Cart Screen ─────────────────────────────────────────
export default function CartScreen() {
  const router    = useRouter();
  const { user }  = useAuthStore();
  const cartStore = useCartStore();

  const items: CartItemWithProduct[]                   = cartStore.items ?? [];
  const isLoading: boolean                             = cartStore.isLoading ?? false;
  const error: string | null                           = (cartStore as any).error ?? null;
  const totalItems: number                             = cartStore.totalItems ?? 0;
  const totalPrice: number                             = cartStore.totalPrice ?? 0;
  const fetchCart                                      = cartStore.fetchCart;
  const updateQuantity                                 = cartStore.updateQuantity;
  const removeItem                                     = cartStore.removeItem;
  const clearAll: ((uid: string) => void) | undefined = (cartStore as any).clearAll;
  const clearError: (() => void) | undefined          = (cartStore as any).clearError;

  const totalPriceFormatted: string =
    (cartStore as any).totalPriceFormatted ??
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice);

  const [refreshing, setRefreshing] = useState(false);

  const contentSlide   = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const hasAnimated    = useRef(false);

  const runEntryAnimation = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    contentSlide.setValue(20);
    Animated.timing(contentSlide, {
      toValue:         0,
      duration:        350,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id).then(() => runEntryAnimation());
    } else {
      runEntryAnimation();
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchCart(user.id);
    setRefreshing(false);
  }, [user?.id]);

  const handleUpdateQuantity = (cartItemId: string, quantity: number) =>
    updateQuantity(cartItemId, quantity);

  const handleRemoveItem = (cartItemId: string) => removeItem(cartItemId);

  const handleClearCart = () => {
    if (!user?.id || !clearAll) return;
    Alert.alert('CLEAR CART', 'Remove all items from your cart?', [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'CLEAR ALL', style: 'destructive', onPress: () => clearAll(user.id) },
    ]);
  };

  // ─── Navigate to Checkout Screen ─────────────────────────
  const handleCheckout = () => {
    router.push('/checkout' as any);
  };

  const handleProductPress = (productId: string) =>
    router.push({ pathname: '/product/[id]', params: { id: productId } });

  const handleContinueShopping = () => router.push('/(tabs)/products' as any);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const shippingFee         = totalPrice >= 500 ? 0 : 25;
  const taxAmount           = totalPrice * 0.05;
  const orderTotal          = totalPrice + shippingFee + taxAmount;
  const orderTotalFormatted = formatPrice(orderTotal);

  // ─── Loading ───────────────────────────────────────────────
  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>LOADING CART...</Text>
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
        <Text style={styles.emptySubtitle}>Please sign in to view your cart</Text>
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

  // ─── Empty Cart ────────────────────────────────────────────
  if (!isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>YOUR CART</Text>
            <Text style={styles.headerTitle}>Shopping Bag</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContainerInner}>
          <Text style={styles.emptyIcon}>◇</Text>
          <Text style={styles.emptyTitle}>CART IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Discover our exclusive luxury collection and add items to your cart
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleContinueShopping} activeOpacity={0.8}>
            <Text style={styles.emptyBtnText}>EXPLORE COLLECTION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Main Cart View ────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>YOUR CART</Text>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{totalItems}</Text>
          </View>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => clearError && clearError()}
          activeOpacity={0.8}
        >
          <Text style={styles.errorBannerText}>{error}</Text>
          <Text style={styles.errorBannerDismiss}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.contentWrapper,
          { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>
              {totalItems} ITEM{totalItems !== 1 ? 'S' : ''}
            </Text>
            {clearAll && (
              <TouchableOpacity onPress={handleClearCart} activeOpacity={0.75}>
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Items */}
          <View style={styles.itemsContainer}>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onPress={handleProductPress}
              />
            ))}
          </View>

          {/* Continue Shopping */}
          <TouchableOpacity
            style={styles.continueShoppingBtn}
            onPress={handleContinueShopping}
            activeOpacity={0.75}
          >
            <Text style={styles.continueShoppingText}>+ CONTINUE SHOPPING</Text>
          </TouchableOpacity>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <View style={styles.summaryGoldLine} />
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>SUBTOTAL ({totalItems} items)</Text>
              <Text style={styles.summaryValue}>{totalPriceFormatted}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>SHIPPING</Text>
              <Text style={[styles.summaryValue, shippingFee === 0 && styles.summaryFree]}>
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
              </Text>
            </View>
            {shippingFee > 0 && (
              <View style={styles.freeShippingNote}>
                <Text style={styles.freeShippingNoteText}>
                  Add {formatPrice(500 - totalPrice)} more for FREE shipping
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>VAT (5%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalKey}>TOTAL</Text>
              <Text style={styles.summaryTotalValue}>{orderTotalFormatted}</Text>
            </View>
            <View style={styles.promoNote}>
              <Text style={styles.promoNoteText}>
                ◆ LUXORA MEMBERS EARN 2X LOYALTY POINTS
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Sticky Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutPriceCol}>
          <Text style={styles.checkoutPriceLabel}>ORDER TOTAL</Text>
          <Text style={styles.checkoutPrice}>{orderTotalFormatted}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, items.length === 0 && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={items.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex:              1,
    backgroundColor:   COLORS.background,
    justifyContent:    'center',
    alignItems:        'center',
    gap:               14,
    paddingHorizontal: 32,
  },
  centerContainerInner: {
    flex:              1,
    justifyContent:    'center',
    alignItems:        'center',
    gap:               14,
    paddingHorizontal: 32,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        Platform.OS === 'android' ? 50 : 56,
    paddingBottom:     16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
    backgroundColor:   COLORS.background,
  },
  backBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: COLORS.surface,
    borderWidth:     1,
    borderColor:     COLORS.goldBorder,
    justifyContent:  'center',
    alignItems:      'center',
  },
  backBtnText: {
    color:      COLORS.gold,
    fontSize:   18,
    fontWeight: '300',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    color:         COLORS.gold,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 3,
    marginBottom:  3,
  },
  headerTitle: {
    color:         COLORS.white,
    fontSize:      20,
    fontWeight:    '300',
    letterSpacing: 1,
  },
  headerRight: {
    width:      38,
    alignItems: 'flex-end',
  },
  itemCountBadge: {
    backgroundColor:   COLORS.gold,
    borderRadius:      12,
    minWidth:          24,
    height:            24,
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 6,
  },
  itemCountText: {
    color:         COLORS.background,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   COLORS.errorDim,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,68,68,0.3)',
    paddingHorizontal: 20,
    paddingVertical:   10,
  },
  errorBannerText: {
    color:         COLORS.error,
    fontSize:      11,
    fontWeight:    '500',
    letterSpacing: 0.3,
    flex:          1,
  },
  errorBannerDismiss: {
    color:      COLORS.error,
    fontSize:   12,
    fontWeight: '700',
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   16,
  },
  sectionLabel: {
    color:         COLORS.grey,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  clearAllText: {
    color:         COLORS.error,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  itemsContainer: {
    marginHorizontal: 16,
    backgroundColor:  COLORS.cardBg,
    borderWidth:      1,
    borderColor:      COLORS.goldBorder,
    borderRadius:     16,
    overflow:         'hidden',
  },
  cartItemWrapper: {
    backgroundColor: COLORS.cardBg,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       14,
    gap:           12,
  },
  itemImageBox: {
    width:           80,
    height:          90,
    borderRadius:    10,
    overflow:        'hidden',
    backgroundColor: COLORS.surface,
    borderWidth:     1,
    borderColor:     COLORS.goldBorder,
    flexShrink:      0,
  },
  itemImage: {
    width:  '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.goldDim,
  },
  itemImageIcon: {
    color:    COLORS.goldBorder,
    fontSize: 24,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.75)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  outOfStockOverlayText: {
    color:         COLORS.error,
    fontSize:      7,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  itemInfo: {
    flex: 1,
    gap:  3,
  },
  itemBrand: {
    color:         COLORS.gold,
    fontSize:      8,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  itemName: {
    color:         COLORS.white,
    fontSize:      13,
    fontWeight:    '300',
    letterSpacing: 0.3,
    lineHeight:    18,
  },
  itemPrice: {
    color:         COLORS.greyLight,
    fontSize:      11,
    fontWeight:    '400',
    letterSpacing: 0.5,
    marginTop:     2,
  },
  itemFooter: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      8,
  },
  qtyRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             0,
    backgroundColor: COLORS.surface,
    borderWidth:     1,
    borderColor:     COLORS.goldBorder,
    borderRadius:    8,
    overflow:        'hidden',
  },
  qtyBtn: {
    width:          30,
    height:         28,
    justifyContent: 'center',
    alignItems:     'center',
  },
  qtyBtnDim: {
    opacity: 0.3,
  },
  qtyBtnText: {
    color:      COLORS.gold,
    fontSize:   16,
    fontWeight: '300',
    lineHeight: 20,
  },
  qtyDisplay: {
    width:            28,
    height:           28,
    justifyContent:   'center',
    alignItems:       'center',
    borderLeftWidth:  1,
    borderRightWidth: 1,
    borderColor:      COLORS.goldBorder,
  },
  qtyValue: {
    color:         COLORS.white,
    fontSize:      12,
    fontWeight:    '500',
    letterSpacing: 0.5,
  },
  itemSubtotal: {
    color:         COLORS.goldLight,
    fontSize:      14,
    fontWeight:    '600',
    letterSpacing: 0.5,
  },
  removeBtn: {
    width:          28,
    height:         28,
    justifyContent: 'center',
    alignItems:     'center',
    flexShrink:     0,
  },
  removeBtnText: {
    color:      COLORS.grey,
    fontSize:   11,
    fontWeight: '600',
  },
  itemDivider: {
    height:           1,
    backgroundColor:  COLORS.goldBorder,
    marginHorizontal: 14,
  },
  continueShoppingBtn: {
    marginHorizontal: 16,
    marginTop:        12,
    borderWidth:      1,
    borderColor:      COLORS.goldBorder,
    borderRadius:     10,
    paddingVertical:  12,
    alignItems:       'center',
    backgroundColor:  COLORS.goldDim,
  },
  continueShoppingText: {
    color:         COLORS.gold,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop:        16,
    backgroundColor:  COLORS.cardBg,
    borderWidth:      1,
    borderColor:      COLORS.goldBorder,
    borderRadius:     16,
    padding:          20,
    gap:              14,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  4,
  },
  summaryGoldLine: {
    width:           20,
    height:          1,
    backgroundColor: COLORS.gold,
  },
  summaryTitle: {
    color:         COLORS.gold,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 3,
  },
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  summaryKey: {
    color:         COLORS.grey,
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 1.5,
  },
  summaryValue: {
    color:         COLORS.white,
    fontSize:      13,
    fontWeight:    '400',
    letterSpacing: 0.5,
  },
  summaryFree: {
    color:      COLORS.success,
    fontWeight: '700',
  },
  freeShippingNote: {
    backgroundColor:   'rgba(201,168,76,0.06)',
    borderWidth:       1,
    borderColor:       COLORS.goldBorder,
    borderRadius:      8,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  freeShippingNoteText: {
    color:         COLORS.gold,
    fontSize:      9,
    fontWeight:    '600',
    letterSpacing: 1,
    textAlign:     'center',
  },
  summaryDivider: {
    height:          1,
    backgroundColor: COLORS.goldBorder,
  },
  summaryTotalRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  summaryTotalKey: {
    color:         COLORS.white,
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  summaryTotalValue: {
    color:         COLORS.goldLight,
    fontSize:      22,
    fontWeight:    '600',
    letterSpacing: 0.5,
  },
  promoNote: {
    borderTopWidth: 1,
    borderTopColor: COLORS.goldBorder,
    paddingTop:     12,
    alignItems:     'center',
  },
  promoNoteText: {
    color:         COLORS.gold,
    fontSize:      8,
    fontWeight:    '600',
    letterSpacing: 1.5,
    opacity:       0.8,
  },
  checkoutBar: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    backgroundColor:   COLORS.cardBg,
    borderTopWidth:    1,
    borderTopColor:    COLORS.goldBorder,
    paddingHorizontal: 20,
    paddingVertical:   16,
    paddingBottom:     Platform.OS === 'android' ? 16 : 32,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               16,
  },
  checkoutPriceCol: {
    flexShrink: 0,
  },
  checkoutPriceLabel: {
    color:         COLORS.grey,
    fontSize:      8,
    fontWeight:    '600',
    letterSpacing: 2,
    marginBottom:  2,
  },
  checkoutPrice: {
    color:         COLORS.goldLight,
    fontSize:      17,
    fontWeight:    '600',
    letterSpacing: 0.5,
  },
  checkoutBtn: {
    flex:            1,
    backgroundColor: COLORS.gold,
    borderRadius:    12,
    paddingVertical: 16,
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkoutBtnDisabled: {
    opacity:         0.45,
    backgroundColor: COLORS.grey,
  },
  checkoutBtnText: {
    color:         COLORS.background,
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  loadingText: {
    color:         COLORS.grey,
    fontSize:      11,
    fontWeight:    '600',
    letterSpacing: 2,
    marginTop:     12,
  },
  emptyIcon: {
    color:        COLORS.goldBorder,
    fontSize:     52,
    marginBottom: 8,
  },
  emptyTitle: {
    color:         COLORS.white,
    fontSize:      14,
    fontWeight:    '600',
    letterSpacing: 2,
  },
  emptySubtitle: {
    color:         COLORS.grey,
    fontSize:      12,
    fontWeight:    '300',
    letterSpacing: 0.4,
    textAlign:     'center',
    lineHeight:    20,
  },
  emptyBtn: {
    marginTop:         8,
    backgroundColor:   COLORS.gold,
    borderRadius:      10,
    paddingHorizontal: 28,
    paddingVertical:   14,
  },
  emptyBtnText: {
    color:         COLORS.background,
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 2,
  },
});