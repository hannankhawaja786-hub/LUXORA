// ============================================================
// LUXORA — Orders History Screen
// ============================================================

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../lib/store/authStore';
import { useOrdersStore } from '../../lib/store/ordersStore';
import type {
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
} from '../../lib/types/database.types';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const COLORS = {
  bg:         '#0A0A0F',
  gold:       '#C9A84C',
  goldLight:  '#F0C040',
  cardBg:     '#0E0E15',
  surface:    '#12121A',
  white:      '#FFFFFF',
  grey:       '#55556A',
  goldDim:    'rgba(201,168,76,0.08)',
  goldBorder: 'rgba(201,168,76,0.2)',
  success:    '#4CC97B',
  error:      '#C94C4C',
  info:       '#4C8BC9',
  warning:    '#C97B4C',
  purple:     '#7B4CC9',
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'PENDING',    color: COLORS.gold,    bg: 'rgba(201,168,76,0.15)' },
  confirmed:  { label: 'CONFIRMED',  color: COLORS.info,    bg: 'rgba(76,139,201,0.15)' },
  processing: { label: 'PROCESSING', color: COLORS.warning, bg: 'rgba(201,123,76,0.15)' },
  shipped:    { label: 'SHIPPED',    color: COLORS.purple,  bg: 'rgba(123,76,201,0.15)' },
  delivered:  { label: 'DELIVERED',  color: COLORS.success, bg: 'rgba(76,201,123,0.15)' },
  cancelled:  { label: 'CANCELLED',  color: COLORS.error,   bg: 'rgba(201,76,76,0.15)'  },
  refunded:   { label: 'REFUNDED',   color: COLORS.grey,    bg: 'rgba(85,85,106,0.20)'  },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  unpaid:   { label: 'UNPAID',   color: COLORS.error   },
  paid:     { label: 'PAID',     color: COLORS.success },
  refunded: { label: 'REFUNDED', color: COLORS.grey    },
  failed:   { label: 'FAILED',   color: COLORS.error   },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// ─────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// PaymentBadge
// ─────────────────────────────────────────────

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status];
  return (
    <Text style={[styles.paymentText, { color: cfg.color }]}>{cfg.label}</Text>
  );
}

// ─────────────────────────────────────────────
// OrderItemRow
// ─────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <View style={styles.orderItemRow}>
      <View style={styles.orderItemLeft}>
        <Text style={styles.orderItemName} numberOfLines={1}>
          {item.product_name}
        </Text>
        {item.product_brand ? (
          <Text style={styles.orderItemBrand}>
            {item.product_brand.toUpperCase()}
          </Text>
        ) : null}
      </View>
      <View style={styles.orderItemRight}>
        <Text style={styles.orderItemQty}>x{item.quantity}</Text>
        <Text style={styles.orderItemPrice}>{formatPrice(item.subtotal)}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// OrderCard
// ─────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.order_items ?? [];

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <StatusBadge status={order.status} />
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Summary Row */}
      <View style={styles.cardSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={styles.summaryValue}>
            {formatPrice(order.total_amount, order.currency)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>ITEMS</Text>
          <Text style={styles.summaryValue}>{items.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>PAYMENT</Text>
          <PaymentBadge status={order.payment_status} />
        </View>
        {order.payment_method ? (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>METHOD</Text>
            <Text style={styles.summaryValue}>
              {order.payment_method.toUpperCase()}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Expanded Section */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.divider} />

          {items.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>ORDER ITEMS</Text>
              {items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </>
          ) : (
            <Text style={styles.noItemsText}>No item details available</Text>
          )}

          {order.shipping_address ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
              <Text style={styles.addressText}>
                {order.shipping_address.full_name}
                {'\n'}
                {order.shipping_address.address_line1}
                {order.shipping_address.address_line2
                  ? '\n' + order.shipping_address.address_line2
                  : ''}
                {'\n'}
                {order.shipping_address.city}, {order.shipping_address.country}
                {order.shipping_address.postal_code
                  ? '  ' + order.shipping_address.postal_code
                  : ''}
              </Text>
            </View>
          ) : null}

          {order.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.addressLabel}>NOTES</Text>
              <Text style={styles.addressText}>{order.notes}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyOrders() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>◈</Text>
      <Text style={styles.emptyTitle}>NO ORDERS YET</Text>
      <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/(tabs)/products')}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>BROWSE PRODUCTS</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Not Logged In State
// ─────────────────────────────────────────────

function NotLoggedIn() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>◉</Text>
      <Text style={styles.emptyTitle}>LOGIN REQUIRED</Text>
      <Text style={styles.emptySubtitle}>Please login to view your orders</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const { orders, isLoading, error, fetchOrders, clearError } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchOrders(user.id);
    setRefreshing(false);
  }, [user?.id]);

  const renderContent = () => {
    if (!user) return <NotLoggedIn />;

    if (isLoading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>LOADING ORDERS...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearError();
              fetchOrders(user.id);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={
          orders.length === 0 ? styles.flatListEmpty : styles.flatListContent
        }
        ListEmptyComponent={<EmptyOrders />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY ORDERS</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {renderContent()}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingTop:        56,
    paddingBottom:     16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
  },
  backButton: {
    width:          40,
    height:         40,
    alignItems:     'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color:    COLORS.gold,
  },
  headerTitle: {
    fontSize:      16,
    fontWeight:    '600',
    color:         COLORS.white,
    letterSpacing: 3,
  },
  headerPlaceholder: {
    width: 40,
  },
  centerContainer: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 40,
    gap:               12,
  },
  loadingText: {
    fontSize:      12,
    color:         COLORS.grey,
    letterSpacing: 2,
    marginTop:     8,
  },
  errorText: {
    fontSize:      13,
    color:         COLORS.error,
    textAlign:     'center',
    letterSpacing: 1,
  },
  retryButton: {
    paddingVertical:   10,
    paddingHorizontal: 32,
    borderWidth:       1,
    borderColor:       COLORS.gold,
    borderRadius:      4,
  },
  retryText: {
    fontSize:      12,
    color:         COLORS.gold,
    letterSpacing: 2,
    fontWeight:    '600',
  },
  emptyIcon: {
    fontSize:     48,
    color:        COLORS.goldBorder,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize:      16,
    color:         COLORS.white,
    fontWeight:    '600',
    letterSpacing: 3,
  },
  emptySubtitle: {
    fontSize:      13,
    color:         COLORS.grey,
    textAlign:     'center',
    letterSpacing: 0.5,
    lineHeight:    20,
  },
  actionButton: {
    marginTop:         8,
    paddingVertical:   12,
    paddingHorizontal: 32,
    borderWidth:       1,
    borderColor:       COLORS.gold,
    borderRadius:      4,
    backgroundColor:   COLORS.goldDim,
  },
  actionButtonText: {
    fontSize:      12,
    color:         COLORS.gold,
    fontWeight:    '700',
    letterSpacing: 2,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     40,
  },
  flatListEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.goldBorder,
    overflow:        'hidden',
    marginBottom:    12,
  },
  cardHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
  },
  cardHeaderLeft: {
    gap: 4,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  orderNumber: {
    fontSize:      14,
    fontWeight:    '700',
    color:         COLORS.gold,
    letterSpacing: 1,
  },
  orderDate: {
    fontSize:      11,
    color:         COLORS.grey,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 10,
    color:    COLORS.grey,
  },
  divider: {
    height:          1,
    backgroundColor: COLORS.goldBorder,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      4,
  },
  badgeText: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.5,
  },
  cardSummary: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    flexWrap:          'wrap',
    gap:               8,
  },
  summaryItem: {
    gap: 3,
  },
  summaryLabel: {
    fontSize:      9,
    color:         COLORS.grey,
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontSize:      13,
    color:         COLORS.white,
    fontWeight:    '600',
    letterSpacing: 0.5,
  },
  paymentText: {
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  expandedSection: {
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize:          10,
    color:             COLORS.grey,
    letterSpacing:     2,
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     8,
  },
  noItemsText: {
    fontSize:          12,
    color:             COLORS.grey,
    paddingHorizontal: 16,
    paddingVertical:   12,
    letterSpacing:     0.5,
  },
  orderItemRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.06)',
  },
  orderItemLeft: {
    flex:        1,
    marginRight: 12,
    gap:         2,
  },
  orderItemName: {
    fontSize:      13,
    color:         COLORS.white,
    fontWeight:    '400',
    letterSpacing: 0.3,
  },
  orderItemBrand: {
    fontSize:      10,
    color:         COLORS.grey,
    letterSpacing: 1.5,
  },
  orderItemRight: {
    alignItems: 'flex-end',
    gap:        2,
  },
  orderItemQty: {
    fontSize:      11,
    color:         COLORS.grey,
    letterSpacing: 0.5,
  },
  orderItemPrice: {
    fontSize:   13,
    color:      COLORS.gold,
    fontWeight: '600',
  },
  addressBox: {
    marginHorizontal: 16,
    marginTop:        12,
    marginBottom:     12,
    padding:          12,
    backgroundColor:  COLORS.goldDim,
    borderRadius:     8,
    borderWidth:      1,
    borderColor:      COLORS.goldBorder,
  },
  notesBox: {
    marginHorizontal: 16,
    marginBottom:     12,
    padding:          12,
    backgroundColor:  'rgba(85,85,106,0.1)',
    borderRadius:     8,
    borderWidth:      1,
    borderColor:      'rgba(85,85,106,0.2)',
  },
  addressLabel: {
    fontSize:      9,
    color:         COLORS.grey,
    letterSpacing: 2,
    marginBottom:  6,
  },
  addressText: {
    fontSize:      12,
    color:         COLORS.white,
    lineHeight:    18,
    letterSpacing: 0.3,
    fontWeight:    '300',
  },
});