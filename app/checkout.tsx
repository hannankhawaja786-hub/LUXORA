// ============================================================
// LUXORA — app/checkout.tsx
// Full Production Checkout Screen
// ============================================================

import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useOrdersStore } from '@/lib/store/ordersStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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
import type { CartItemWithProduct } from '../lib/types/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#0A0A0F',
  cardBg:     '#0E0E15',
  gold:       '#C9A84C',
  goldLight:  '#F0C040',
  goldDim:    'rgba(201, 168, 76, 0.08)',
  goldBorder: 'rgba(201, 168, 76, 0.2)',
  goldBorderActive: 'rgba(201, 168, 76, 0.7)',
  white:      '#FFFFFF',
  grey:       '#55556A',
  greyLight:  '#8888A0',
  surface:    '#12121A',
  error:      '#FF4444',
  errorDim:   'rgba(255, 68, 68, 0.1)',
  success:    '#22C55E',
};

// ─── Success Modal ────────────────────────────────────────────
function SuccessModal({
  visible,
  orderNumber,
  orderTotal,
  onViewOrders,
  onContinue,
}: {
  visible:      boolean;
  orderNumber:  string;
  orderTotal:   string;
  onViewOrders: () => void;
  onContinue:   () => void;
}) {
  const scale   = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1, tension: 80, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={sModal.overlay}>
        <Animated.View style={[sModal.card, { transform: [{ scale }], opacity }]}>
          <View style={sModal.iconRing}>
            <Text style={sModal.iconText}>◆</Text>
          </View>
          <Text style={sModal.tag}>ORDER CONFIRMED</Text>
          <Text style={sModal.title}>Thank You!</Text>
          <Text style={sModal.subtitle}>
            Your luxury order has been received and is being processed by our concierge team.
          </Text>
          <View style={sModal.divider} />
          <View style={sModal.infoRow}>
            <Text style={sModal.infoLabel}>ORDER NUMBER</Text>
            <Text style={sModal.infoValue}>{orderNumber}</Text>
          </View>
          <View style={sModal.infoRow}>
            <Text style={sModal.infoLabel}>ORDER TOTAL</Text>
            <Text style={sModal.infoValueGold}>{orderTotal}</Text>
          </View>
          <View style={sModal.etaBox}>
            <Text style={sModal.etaText}>◇  ESTIMATED DELIVERY: 3–5 BUSINESS DAYS</Text>
          </View>
          <TouchableOpacity style={sModal.primaryBtn} onPress={onContinue} activeOpacity={0.85}>
            <Text style={sModal.primaryBtnText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sModal.secondaryBtn} onPress={onViewOrders} activeOpacity={0.75}>
            <Text style={sModal.secondaryBtnText}>VIEW MY ORDERS</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  iconRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 1, borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  iconText: { color: COLORS.gold, fontSize: 28 },
  tag: { color: COLORS.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  title: { color: COLORS.white, fontSize: 30, fontWeight: '300', letterSpacing: 1 },
  subtitle: {
    color: COLORS.grey, fontSize: 12, fontWeight: '300',
    letterSpacing: 0.3, textAlign: 'center', lineHeight: 20,
  },
  divider: { height: 1, backgroundColor: COLORS.goldBorder, width: '100%' },
  infoRow: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  infoLabel: { color: COLORS.grey, fontSize: 9, fontWeight: '600', letterSpacing: 2 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  infoValueGold: { color: COLORS.goldLight, fontSize: 20, fontWeight: '600', letterSpacing: 0.5 },
  etaBox: {
    backgroundColor: COLORS.goldDim, borderWidth: 1,
    borderColor: COLORS.goldBorder, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, width: '100%',
  },
  etaText: {
    color: COLORS.gold, fontSize: 8, fontWeight: '600',
    letterSpacing: 1.5, textAlign: 'center',
  },
  primaryBtn: {
    width: '100%', backgroundColor: COLORS.gold,
    borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: {
    color: COLORS.background, fontSize: 11, fontWeight: '700', letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%', borderWidth: 1,
    borderColor: COLORS.goldBorder, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  secondaryBtnText: { color: COLORS.gold, fontSize: 10, fontWeight: '600', letterSpacing: 2 },
});

// ─── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <View style={sStep.row}>
      <View style={sStep.stepWrap}>
        <View style={[sStep.circle, current >= 1 && sStep.circleActive]}>
          <Text style={[sStep.circleText, current >= 1 && sStep.circleTextActive]}>1</Text>
        </View>
        <Text style={[sStep.label, current >= 1 && sStep.labelActive]}>DELIVERY</Text>
      </View>
      <View style={[sStep.line, current >= 2 && sStep.lineActive]} />
      <View style={sStep.stepWrap}>
        <View style={[sStep.circle, current >= 2 && sStep.circleActive]}>
          <Text style={[sStep.circleText, current >= 2 && sStep.circleTextActive]}>2</Text>
        </View>
        <Text style={[sStep.label, current >= 2 && sStep.labelActive]}>REVIEW</Text>
      </View>
    </View>
  );
}

const sStep = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 0,
    paddingHorizontal: 40, marginVertical: 20,
  },
  stepWrap: { alignItems: 'center', gap: 6 },
  circle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.grey,
    justifyContent: 'center', alignItems: 'center',
  },
  circleActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  circleText: { color: COLORS.grey, fontSize: 11, fontWeight: '700' },
  circleTextActive: { color: COLORS.gold },
  label: { color: COLORS.grey, fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  labelActive: { color: COLORS.gold },
  line: {
    flex: 1, height: 1,
    backgroundColor: COLORS.grey,
    marginHorizontal: 10, marginBottom: 18,
  },
  lineActive: { backgroundColor: COLORS.gold },
});

// ─── Labelled Input ───────────────────────────────────────────
function LabelledInput({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, error,
}: {
  label:           string;
  value:           string;
  onChangeText:    (v: string) => void;
  placeholder?:    string;
  keyboardType?:   any;
  autoCapitalize?: any;
  error?:          string;
}) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.goldBorder, COLORS.goldBorderActive],
  });

  return (
    <View style={sInput.wrapper}>
      <Text style={[sInput.label, error && sInput.labelError]}>{label}</Text>
      <Animated.View style={[sInput.inputBox, { borderColor }]}>
        <TextInput
          style={sInput.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grey}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'words'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={COLORS.gold}
        />
      </Animated.View>
      {error ? <Text style={sInput.errorText}>{error}</Text> : null}
    </View>
  );
}

const sInput = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: COLORS.grey, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  labelError: { color: COLORS.error },
  inputBox: {
    borderWidth: 1, borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14, paddingVertical: 0,
    height: 48,
  },
  input: {
    flex: 1, color: COLORS.white, fontSize: 14,
    fontWeight: '300', letterSpacing: 0.3, height: 48,
  },
  errorText: { color: COLORS.error, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
});

// ─── Payment Option ───────────────────────────────────────────
function PaymentOption({
  icon, title, subtitle, selected, onPress,
}: {
  icon: string; title: string; subtitle: string;
  selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[sPay.option, selected && sPay.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[sPay.iconBox, selected && sPay.iconBoxSelected]}>
        <Text style={[sPay.icon, selected && sPay.iconSelected]}>{icon}</Text>
      </View>
      <View style={sPay.textCol}>
        <Text style={[sPay.title, selected && sPay.titleSelected]}>{title}</Text>
        <Text style={sPay.subtitle}>{subtitle}</Text>
      </View>
      <View style={[sPay.radio, selected && sPay.radioSelected]}>
        {selected && <View style={sPay.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const sPay = StyleSheet.create({
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.goldBorder,
    borderRadius: 12, padding: 14, gap: 12,
  },
  optionSelected: {
    borderColor: COLORS.gold, backgroundColor: COLORS.goldDim,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  iconBoxSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  icon: { fontSize: 18, color: COLORS.grey },
  iconSelected: { color: COLORS.gold },
  textCol: { flex: 1 },
  title: { color: COLORS.greyLight, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  titleSelected: { color: COLORS.white },
  subtitle: { color: COLORS.grey, fontSize: 10, fontWeight: '400', letterSpacing: 0.3, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.grey,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.gold },
  radioDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold,
  },
});

// ─── Order Item Row (Review Step) ─────────────────────────────
function OrderItemRow({ item }: { item: CartItemWithProduct }) {
  const product  = item.products;
  const imageUri = product.images && product.images.length > 0 ? product.images[0] : null;
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);

  return (
    <View style={sItem.row}>
      <View style={sItem.imgBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={sItem.img} resizeMode="cover" />
        ) : (
          <View style={sItem.imgPlaceholder}>
            <Text style={sItem.imgIcon}>◈</Text>
          </View>
        )}
      </View>
      <View style={sItem.info}>
        {product.brand && (
          <Text style={sItem.brand}>{product.brand.toUpperCase()}</Text>
        )}
        <Text style={sItem.name} numberOfLines={2}>{product.name}</Text>
        <Text style={sItem.qty}>QTY: {item.quantity}</Text>
      </View>
      <Text style={sItem.price}>{formatPrice(product.price * item.quantity)}</Text>
    </View>
  );
}

const sItem = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.goldBorder,
  },
  imgBox: {
    width: 56, height: 64, borderRadius: 8,
    overflow: 'hidden', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: COLORS.goldDim,
  },
  imgIcon: { color: COLORS.goldBorder, fontSize: 18 },
  info: { flex: 1, gap: 2 },
  brand: { color: COLORS.gold, fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  name: { color: COLORS.white, fontSize: 12, fontWeight: '300', letterSpacing: 0.3, lineHeight: 17 },
  qty: { color: COLORS.grey, fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginTop: 2 },
  price: { color: COLORS.goldLight, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
});

// ─── Main Checkout Screen ─────────────────────────────────────
interface AddressForm {
  fullName:     string;
  phone:        string;
  addressLine1: string;
  addressLine2: string;
  city:         string;
  country:      string;
  postalCode:   string;
}

interface FormErrors {
  fullName?:     string;
  phone?:        string;
  addressLine1?: string;
  city?:         string;
  country?:      string;
}

export default function CheckoutScreen() {
  const router      = useRouter();
  const { user }    = useAuthStore();
  const cartStore   = useCartStore();
  const ordersStore = useOrdersStore();

  const items: CartItemWithProduct[] = cartStore.items ?? [];
  const totalPrice: number           = cartStore.totalPrice ?? 0;

  const [step, setStep]                           = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod]         = useState<'card' | 'cod'>('card');
  const [placing, setPlacing]                     = useState(false);
  const [showSuccess, setShowSuccess]             = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  const [form, setForm] = useState<AddressForm>({
    fullName:     '',
    phone:        '',
    addressLine1: '',
    addressLine2: '',
    city:         '',
    country:      'Saudi Arabia',
    postalCode:   '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Slide animation between steps
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideToStep = useCallback((toStep: 1 | 2) => {
    const toValue = toStep === 2 ? -SCREEN_WIDTH : 0;
    Animated.spring(slideAnim, {
      toValue, tension: 80, friction: 12, useNativeDriver: true,
    }).start();
    setStep(toStep);
  }, []);

  // Pricing
  const shippingFee  = totalPrice >= 500 ? 0 : 25;
  const taxAmount    = totalPrice * 0.05;
  const orderTotal   = totalPrice + shippingFee + taxAmount;
  const formatPrice  = (p: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);

  const setField = (key: keyof AddressForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim())     newErrors.fullName     = 'Full name is required';
    if (!form.phone.trim())        newErrors.phone        = 'Phone number is required';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim())         newErrors.city         = 'City is required';
    if (!form.country.trim())      newErrors.country      = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    slideToStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      slideToStep(1);
    } else {
      router.back();
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id || items.length === 0 || placing) return;

    setPlacing(true);
    try {
      const order = await ordersStore.placeOrder({
        userId:    user.id,
        cartItems: items,
        shippingAddress: {
          full_name:     form.fullName,
          phone:         form.phone,
          address_line1: form.addressLine1,
          address_line2: form.addressLine2 || undefined,
          city:          form.city,
          country:       form.country,
          postal_code:   form.postalCode || undefined,
        },
        paymentMethod,
      });

      const clearAll = (cartStore as any).clearAll;
      if (clearAll) clearAll(user.id);

      setPlacedOrderNumber((order as any).order_number ?? '#LUX-ORDER');
      setShowSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Order failed. Please try again.';
      Alert.alert('ORDER FAILED', msg, [{ text: 'OK' }]);
    } finally {
      setPlacing(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    router.push('/(tabs)/products' as any);
  };

  const handleSuccessOrders = () => {
    setShowSuccess(false);
    router.push('/(tabs)/orders' as any);
  };

  if (!user) {
    return (
      <View style={s.center}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={s.emptyIcon}>◈</Text>
        <Text style={s.emptyTitle}>SIGN IN REQUIRED</Text>
        <TouchableOpacity style={s.goldBtn} onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={s.goldBtnText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <SuccessModal
        visible={showSuccess}
        orderNumber={placedOrderNumber}
        orderTotal={formatPrice(orderTotal)}
        onViewOrders={handleSuccessOrders}
        onContinue={handleSuccessContinue}
      />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.8}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerLabel}>SECURE CHECKOUT</Text>
          <Text style={s.headerTitle}>{step === 1 ? 'Delivery' : 'Review Order'}</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={s.secureText}>◆ SSL</Text>
        </View>
      </View>

      {/* ── Step Indicator ── */}
      <StepIndicator current={step} />

      {/* ── Sliding Content ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            s.slideContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* ───── STEP 1: Delivery ───── */}
          <View style={s.stepPage}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Address Card */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.goldLine} />
                  <Text style={s.sectionTitle}>SHIPPING ADDRESS</Text>
                </View>
                <View style={s.formGrid}>
                  <LabelledInput
                    label="FULL NAME"
                    value={form.fullName}
                    onChangeText={setField('fullName')}
                    placeholder="Muhammad Hannan Khawaja"
                    error={errors.fullName}
                  />
                  <LabelledInput
                    label="PHONE NUMBER"
                    value={form.phone}
                    onChangeText={setField('phone')}
                    placeholder="+966 50 000 0000"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    error={errors.phone}
                  />
                  <LabelledInput
                    label="ADDRESS LINE 1"
                    value={form.addressLine1}
                    onChangeText={setField('addressLine1')}
                    placeholder="Street, Building, Apartment"
                    error={errors.addressLine1}
                  />
                  <LabelledInput
                    label="ADDRESS LINE 2 (OPTIONAL)"
                    value={form.addressLine2}
                    onChangeText={setField('addressLine2')}
                    placeholder="Floor, Suite, Additional info"
                  />
                  <View style={s.row2}>
                    <View style={{ flex: 1 }}>
                      <LabelledInput
                        label="CITY"
                        value={form.city}
                        onChangeText={setField('city')}
                        placeholder="Riyadh"
                        error={errors.city}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <LabelledInput
                        label="POSTAL CODE"
                        value={form.postalCode}
                        onChangeText={setField('postalCode')}
                        placeholder="12345"
                        keyboardType="numeric"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <LabelledInput
                    label="COUNTRY"
                    value={form.country}
                    onChangeText={setField('country')}
                    placeholder="Saudi Arabia"
                    error={errors.country}
                  />
                </View>
              </View>

              {/* Payment Method Card */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.goldLine} />
                  <Text style={s.sectionTitle}>PAYMENT METHOD</Text>
                </View>
                <View style={s.paymentOptions}>
                  <PaymentOption
                    icon="◈"
                    title="Credit / Debit Card"
                    subtitle="Visa, Mastercard, AMEX"
                    selected={paymentMethod === 'card'}
                    onPress={() => setPaymentMethod('card')}
                  />
                  <PaymentOption
                    icon="◇"
                    title="Cash on Delivery"
                    subtitle="Pay when your order arrives"
                    selected={paymentMethod === 'cod'}
                    onPress={() => setPaymentMethod('cod')}
                  />
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Next Button */}
            <View style={s.bottomBar}>
              <View style={s.bottomPriceCol}>
                <Text style={s.bottomPriceLabel}>ORDER TOTAL</Text>
                <Text style={s.bottomPrice}>{formatPrice(orderTotal)}</Text>
              </View>
              <TouchableOpacity style={s.goldBtn} onPress={handleNext} activeOpacity={0.85}>
                <Text style={s.goldBtnText}>REVIEW ORDER →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ───── STEP 2: Review ───── */}
          <View style={s.stepPage}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
            >
              {/* Address Summary */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.goldLine} />
                  <Text style={s.sectionTitle}>DELIVERY TO</Text>
                  <TouchableOpacity onPress={() => slideToStep(1)} style={s.editBtn}>
                    <Text style={s.editBtnText}>EDIT</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.addressSummary}>
                  <Text style={s.addrName}>{form.fullName}</Text>
                  <Text style={s.addrLine}>{form.addressLine1}</Text>
                  {form.addressLine2 ? <Text style={s.addrLine}>{form.addressLine2}</Text> : null}
                  <Text style={s.addrLine}>{form.city}{form.postalCode ? `, ${form.postalCode}` : ''}</Text>
                  <Text style={s.addrLine}>{form.country}</Text>
                  <Text style={s.addrPhone}>{form.phone}</Text>
                </View>
              </View>

              {/* Items */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.goldLine} />
                  <Text style={s.sectionTitle}>ORDER ITEMS</Text>
                  <Text style={s.itemCountText}>{items.length} ITEM{items.length !== 1 ? 'S' : ''}</Text>
                </View>
                <View style={s.itemsList}>
                  {items.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </View>
              </View>

              {/* Order Summary */}
              <View style={s.sectionCard}>
                <View style={s.sectionHeader}>
                  <View style={s.goldLine} />
                  <Text style={s.sectionTitle}>ORDER SUMMARY</Text>
                </View>
                <View style={s.summaryRows}>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryKey}>SUBTOTAL</Text>
                    <Text style={s.summaryVal}>{formatPrice(totalPrice)}</Text>
                  </View>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryKey}>SHIPPING</Text>
                    <Text style={[s.summaryVal, shippingFee === 0 && s.freeText]}>
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </Text>
                  </View>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryKey}>VAT (5%)</Text>
                    <Text style={s.summaryVal}>{formatPrice(taxAmount)}</Text>
                  </View>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryKey}>PAYMENT</Text>
                    <Text style={s.summaryVal}>
                      {paymentMethod === 'card' ? 'CREDIT CARD' : 'CASH ON DELIVERY'}
                    </Text>
                  </View>
                  <View style={s.divider} />
                  <View style={s.summaryRow}>
                    <Text style={s.totalKey}>TOTAL</Text>
                    <Text style={s.totalVal}>{formatPrice(orderTotal)}</Text>
                  </View>
                </View>
                <View style={s.loyaltyNote}>
                  <Text style={s.loyaltyText}>◆ LUXORA MEMBERS EARN 2X LOYALTY POINTS ON THIS ORDER</Text>
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={s.bottomBar}>
              <View style={s.bottomPriceCol}>
                <Text style={s.bottomPriceLabel}>TOTAL DUE</Text>
                <Text style={s.bottomPrice}>{formatPrice(orderTotal)}</Text>
              </View>
              <TouchableOpacity
                style={[s.goldBtn, placing && s.goldBtnDisabled]}
                onPress={handlePlaceOrder}
                disabled={placing}
                activeOpacity={0.85}
              >
                {placing ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Text style={s.goldBtnText}>PLACE ORDER →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.goldBorder,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.goldBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { color: COLORS.gold, fontSize: 18, fontWeight: '300' },
  headerCenter: { alignItems: 'center' },
  headerLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 3 },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '300', letterSpacing: 1 },
  headerRight: { width: 38, alignItems: 'flex-end', justifyContent: 'center' },
  secureText: { color: COLORS.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  slideContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
  },
  stepPage: {
    width: SCREEN_WIDTH,
    flex: 1,
    position: 'relative',
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1, borderColor: COLORS.goldBorder,
    borderRadius: 16, padding: 20,
    marginBottom: 12, gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  goldLine: { width: 16, height: 1, backgroundColor: COLORS.gold },
  sectionTitle: { flex: 1, color: COLORS.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  editBtn: {
    borderWidth: 1, borderColor: COLORS.goldBorder,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  editBtnText: { color: COLORS.gold, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  itemCountText: { color: COLORS.grey, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  formGrid: { gap: 14 },
  row2: { flexDirection: 'row', gap: 12 },
  paymentOptions: { gap: 10 },
  addressSummary: { gap: 4 },
  addrName: { color: COLORS.white, fontSize: 15, fontWeight: '400', letterSpacing: 0.3, marginBottom: 4 },
  addrLine: { color: COLORS.greyLight, fontSize: 13, fontWeight: '300', letterSpacing: 0.3, lineHeight: 20 },
  addrPhone: { color: COLORS.gold, fontSize: 12, fontWeight: '500', letterSpacing: 0.5, marginTop: 4 },
  itemsList: { gap: 0 },
  summaryRows: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKey: { color: COLORS.grey, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 },
  summaryVal: { color: COLORS.white, fontSize: 13, fontWeight: '400', letterSpacing: 0.5 },
  freeText: { color: COLORS.success, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.goldBorder },
  totalKey: { color: COLORS.white, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  totalVal: { color: COLORS.goldLight, fontSize: 22, fontWeight: '600', letterSpacing: 0.5 },
  loyaltyNote: { borderTopWidth: 1, borderTopColor: COLORS.goldBorder, paddingTop: 12, alignItems: 'center' },
  loyaltyText: { color: COLORS.gold, fontSize: 8, fontWeight: '600', letterSpacing: 1.5, opacity: 0.8, textAlign: 'center' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1, borderTopColor: COLORS.goldBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 16 : 32,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  bottomPriceCol: { flexShrink: 0 },
  bottomPriceLabel: { color: COLORS.grey, fontSize: 8, fontWeight: '600', letterSpacing: 2, marginBottom: 2 },
  bottomPrice: { color: COLORS.goldLight, fontSize: 17, fontWeight: '600', letterSpacing: 0.5 },
  goldBtn: {
    flex: 1, backgroundColor: COLORS.gold,
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  goldBtnDisabled: { opacity: 0.45, backgroundColor: COLORS.grey },
  goldBtnText: { color: COLORS.background, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  emptyIcon: { color: COLORS.goldBorder, fontSize: 52 },
  emptyTitle: { color: COLORS.white, fontSize: 14, fontWeight: '600', letterSpacing: 2 },
});