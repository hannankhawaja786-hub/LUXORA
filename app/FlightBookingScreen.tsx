import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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

interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  logo: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  stopInfo?: string;
  price: number;
  originalPrice?: number;
  cabin: string;
  seatsLeft?: number;
  amenities: string[];
  baggage: string;
  refundable: boolean;
  tag?: string;
}

interface FlightSearchParams {
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: string;
  tripType: 'roundTrip' | 'oneWay';
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  passport: string;
  nationality: string;
  dob: string;
  gender: 'Male' | 'Female' | '';
}

interface Props {
  flight: FlightResult;
  searchParams: FlightSearchParams;
  onBack: () => void;
  onConfirm: (bookingRef: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0A0A0F',
  card: '#0E0E15',
  gold: '#C9A84C',
  goldLight: '#F0C040',
  goldDim: '#C9A84C14',
  goldDim2: '#C9A84C22',
  white: '#FFFFFF',
  grey: '#55556A',
  border: '#1A1A2E',
  success: '#2ECC71',
  danger: '#E74C3C',
  cardBorder: '#1C1C2E',
};

const STEPS = ['PASSENGER', 'SEAT', 'PAYMENT', 'CONFIRM'];

const SEATS = [
  ['1A','1B','1C','','1D','1E','1F'],
  ['2A','2B','2C','','2D','2E','2F'],
  ['3A','3B','3C','','3D','3E','3F'],
  ['4A','4B','4C','','4D','4E','4F'],
  ['5A','5B','5C','','5D','5E','5F'],
  ['6A','6B','6C','','6D','6E','6F'],
  ['7A','7B','7C','','7D','7E','7F'],
  ['8A','8B','8C','','8D','8E','8F'],
];

const OCCUPIED_SEATS = ['1A','1C','2B','2F','3A','3D','4C','4E','5B','6A','6F','7D','8B','8E'];

const NATIONALITIES = ['Pakistani', 'Saudi Arabian', 'American', 'British', 'Indian', 'Emirati', 'Other'];

const PAYMENT_METHODS = [
  { id: 'card', icon: '💳', label: 'Credit / Debit Card' },
  { id: 'apple', icon: '🍎', label: 'Apple Pay' },
  { id: 'google', icon: 'G', label: 'Google Pay' },
  { id: 'bank', icon: '🏦', label: 'Bank Transfer' },
];

const generateBookingRef = () =>
  'LX' + Math.random().toString(36).substring(2, 8).toUpperCase();

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlightBookingScreen({ flight, searchParams, onBack, onConfirm }: Props) {
  const [step, setStep] = useState(0);
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    Array(searchParams.passengers).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      passport: '',
      nationality: 'Pakistani',
      dob: '',
      gender: '',
    }))
  );
  const [activePassenger, setActivePassenger] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [showNationalityModal, setShowNationalityModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bookingRef] = useState(generateBookingRef());

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tickAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step / (STEPS.length - 1)) * 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const goNext = () => {
    if (step === 0 && !validatePassenger()) return;
    if (step === 1 && !selectedSeat) {
      Alert.alert('Select Seat', 'Please select a seat to continue.');
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setStep(s => s + 1);
  };

  const validatePassenger = () => {
    const p = passengers[activePassenger];
    if (!p.firstName || !p.lastName || !p.passport || !p.gender) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return false;
    }
    return true;
  };

  const handlePayment = () => {
    if (selectedPayment === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCVV)) {
      Alert.alert('Card Details', 'Please fill all card details.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(3);
      Animated.parallel([
        Animated.spring(tickAnim, { toValue: 1, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    }, 2200);
  };

  const updatePassenger = (field: keyof PassengerInfo, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[activePassenger] = { ...updated[activePassenger], [field]: value };
      return updated;
    });
  };

  const totalPrice = flight.price * searchParams.passengers;
  const taxes = Math.round(totalPrice * 0.12);
  const grandTotal = totalPrice + taxes;

  // ─── Step Indicator ─────────────────────────────────────────────────────────

  const renderStepBar = () => (
    <View style={styles.stepBar}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              i < step && styles.stepDone,
              i === step && styles.stepActive,
            ]}>
              {i < step
                ? <Text style={styles.stepDoneIcon}>✓</Text>
                : <Text style={[styles.stepNum, i === step && { color: COLORS.bg }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, i === step && { color: COLORS.gold }]}>{s}</Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // ─── Step 0: Passenger Info ─────────────────────────────────────────────────

  const renderPassengerStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Flight Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryAirline}>
          <Text style={styles.summaryLogo}>{flight.logo}</Text>
          <View>
            <Text style={styles.summaryAirlineName}>{flight.airline}</Text>
            <Text style={styles.summaryFlight}>{flight.flightNumber} · {flight.cabin}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.summaryPriceTag}>
            <Text style={styles.summaryPrice}>USD {flight.price}</Text>
            <Text style={styles.summaryPerPax}>/ pax</Text>
          </View>
        </View>

        <View style={styles.summaryRoute}>
          <View style={styles.summaryTimeBlock}>
            <Text style={styles.summaryTime}>{flight.departure}</Text>
            <Text style={styles.summaryCode}>{searchParams.fromCode}</Text>
            <Text style={styles.summaryCitySmall}>{searchParams.from}</Text>
          </View>
          <View style={styles.summaryMid}>
            <Text style={styles.summaryDuration}>{flight.duration}</Text>
            <View style={styles.summaryLine}>
              <View style={styles.summaryDot} />
              <View style={styles.summaryBar} />
              <Text style={styles.summaryPlane}>✈</Text>
              <View style={styles.summaryBar} />
              <View style={styles.summaryDot} />
            </View>
            <Text style={styles.summaryStops}>
              {flight.stops === 0 ? 'NON-STOP' : `${flight.stops} STOP`}
            </Text>
          </View>
          <View style={[styles.summaryTimeBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.summaryTime}>{flight.arrival}</Text>
            <Text style={styles.summaryCode}>{searchParams.toCode}</Text>
            <Text style={styles.summaryCitySmall}>{searchParams.to}</Text>
          </View>
        </View>

        <View style={styles.summaryMeta}>
          <Text style={styles.summaryMetaText}>📅 {searchParams.departDate}</Text>
          <Text style={styles.summaryMetaText}>👥 {searchParams.passengers} PAX</Text>
          <Text style={styles.summaryMetaText}>🧳 {flight.baggage}</Text>
          {flight.refundable && <Text style={[styles.summaryMetaText, { color: COLORS.success }]}>✓ Refundable</Text>}
        </View>
      </View>

      {/* Passenger Tabs */}
      {searchParams.passengers > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.passengerTabs}>
          {passengers.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.passengerTab, activePassenger === i && styles.passengerTabActive]}
              onPress={() => setActivePassenger(i)}
            >
              <Text style={[styles.passengerTabText, activePassenger === i && { color: COLORS.bg }]}>
                PAX {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>PASSENGER {activePassenger + 1} DETAILS</Text>

        {/* Gender */}
        <Text style={styles.fieldLabel}>GENDER *</Text>
        <TouchableOpacity
          style={styles.selectField}
          onPress={() => setShowGenderModal(true)}
        >
          <Text style={[styles.selectFieldText, !passengers[activePassenger].gender && { color: COLORS.grey }]}>
            {passengers[activePassenger].gender || 'Select Gender'}
          </Text>
          <Text style={styles.selectArrow}>▾</Text>
        </TouchableOpacity>

        {/* Name Row */}
        <View style={styles.fieldRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.fieldLabel}>FIRST NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={COLORS.grey}
              value={passengers[activePassenger].firstName}
              onChangeText={v => updatePassenger('firstName', v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>LAST NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={COLORS.grey}
              value={passengers[activePassenger].lastName}
              onChangeText={v => updatePassenger('lastName', v)}
            />
          </View>
        </View>

        {/* Passport */}
        <Text style={styles.fieldLabel}>PASSPORT NUMBER *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. AK1234567"
          placeholderTextColor={COLORS.grey}
          value={passengers[activePassenger].passport}
          onChangeText={v => updatePassenger('passport', v.toUpperCase())}
          autoCapitalize="characters"
        />

        {/* DOB */}
        <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={COLORS.grey}
          value={passengers[activePassenger].dob}
          onChangeText={v => updatePassenger('dob', v)}
          keyboardType="numeric"
        />

        {/* Nationality */}
        <Text style={styles.fieldLabel}>NATIONALITY</Text>
        <TouchableOpacity
          style={styles.selectField}
          onPress={() => setShowNationalityModal(true)}
        >
          <Text style={styles.selectFieldText}>
            {passengers[activePassenger].nationality}
          </Text>
          <Text style={styles.selectArrow}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceCard}>
        <Text style={styles.priceCardTitle}>FARE SUMMARY</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Base Fare × {searchParams.passengers}</Text>
          <Text style={styles.priceValue}>USD {totalPrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Taxes & Fees (12%)</Text>
          <Text style={styles.priceValue}>USD {taxes}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceTotalLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.priceTotalValue}>USD {grandTotal}</Text>
        </View>
      </View>
    </ScrollView>
  );

  // ─── Step 1: Seat Selection ─────────────────────────────────────────────────

  const renderSeatStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.seatLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.border }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.grey + '44' }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>

      {/* Cabin Visual */}
      <View style={styles.planeNose}>
        <Text style={styles.planeNoseText}>✈ FRONT OF CABIN</Text>
      </View>

      <View style={styles.seatMap}>
        {/* Column Labels */}
        <View style={styles.seatRow}>
          {['A','B','C','','D','E','F'].map((col, i) => (
            <View key={i} style={styles.seatCell}>
              <Text style={styles.colLabel}>{col}</Text>
            </View>
          ))}
        </View>

        {SEATS.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.seatRow}>
            {row.map((seat, colIdx) => {
              if (seat === '') {
                return (
                  <View key={colIdx} style={styles.seatAisle}>
                    <Text style={styles.aisleNum}>{rowIdx + 1}</Text>
                  </View>
                );
              }
              const isOccupied = OCCUPIED_SEATS.includes(seat);
              const isSelected = selectedSeat === seat;
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.seat,
                    isOccupied && styles.seatOccupied,
                    isSelected && styles.seatSelected,
                  ]}
                  onPress={() => !isOccupied && setSelectedSeat(seat)}
                  disabled={isOccupied}
                >
                  <Text style={[
                    styles.seatText,
                    isOccupied && { color: COLORS.grey + '66' },
                    isSelected && { color: COLORS.bg, fontWeight: '800' },
                  ]}>
                    {isSelected ? '✓' : seat.replace(/\d/g, '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {selectedSeat && (
        <View style={styles.selectedSeatInfo}>
          <Text style={styles.selectedSeatLabel}>SELECTED SEAT</Text>
          <Text style={styles.selectedSeatValue}>{selectedSeat}</Text>
          <Text style={styles.selectedSeatCabin}>{flight.cabin.toUpperCase()}</Text>
        </View>
      )}
    </ScrollView>
  );

  // ─── Step 2: Payment ────────────────────────────────────────────────────────

  const renderPaymentStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* Payment Methods */}
      <View style={styles.paymentMethods}>
        {PAYMENT_METHODS.map(pm => (
          <TouchableOpacity
            key={pm.id}
            style={[styles.paymentMethod, selectedPayment === pm.id && styles.paymentMethodActive]}
            onPress={() => setSelectedPayment(pm.id)}
          >
            <Text style={styles.paymentIcon}>{pm.icon}</Text>
            <Text style={[styles.paymentLabel, selectedPayment === pm.id && { color: COLORS.gold }]}>
              {pm.label}
            </Text>
            <View style={[styles.radioOuter, selectedPayment === pm.id && styles.radioOuterActive]}>
              {selectedPayment === pm.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Form */}
      {selectedPayment === 'card' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>CARD DETAILS</Text>

          <Text style={styles.fieldLabel}>CARD NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="1234  5678  9012  3456"
            placeholderTextColor={COLORS.grey}
            value={cardNumber}
            onChangeText={v => setCardNumber(v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
            keyboardType="numeric"
            maxLength={19}
          />

          <Text style={styles.fieldLabel}>CARDHOLDER NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="As on card"
            placeholderTextColor={COLORS.grey}
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="words"
          />

          <View style={styles.fieldRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>EXPIRY</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={COLORS.grey}
                value={cardExpiry}
                onChangeText={v => {
                  const cleaned = v.replace(/\D/g, '');
                  if (cleaned.length <= 4) {
                    setCardExpiry(cleaned.length > 2 ? cleaned.slice(0,2) + '/' + cleaned.slice(2) : cleaned);
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="•••"
                placeholderTextColor={COLORS.grey}
                value={cardCVV}
                onChangeText={v => setCardCVV(v.replace(/\D/g, ''))}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}

      {/* Non-card payment info */}
      {selectedPayment !== 'card' && (
        <View style={styles.altPayCard}>
          <Text style={styles.altPayIcon}>
            {PAYMENT_METHODS.find(p => p.id === selectedPayment)?.icon}
          </Text>
          <Text style={styles.altPayText}>
            You will be redirected to complete payment securely.
          </Text>
        </View>
      )}

      {/* Order Summary */}
      <View style={styles.priceCard}>
        <Text style={styles.priceCardTitle}>ORDER SUMMARY</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{flight.airline} {flight.flightNumber}</Text>
          <Text style={styles.priceValue}>{searchParams.fromCode} → {searchParams.toCode}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Seat</Text>
          <Text style={styles.priceValue}>{selectedSeat} · {flight.cabin}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Passengers</Text>
          <Text style={styles.priceValue}>{searchParams.passengers} × USD {flight.price}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Taxes</Text>
          <Text style={styles.priceValue}>USD {taxes}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceTotalLabel}>TOTAL</Text>
          <Text style={styles.priceTotalValue}>USD {grandTotal}</Text>
        </View>
      </View>

      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <Text style={styles.securityText}>🔒 256-BIT SSL ENCRYPTED · PCI DSS COMPLIANT</Text>
      </View>
    </ScrollView>
  );

  // ─── Step 3: E-Ticket ───────────────────────────────────────────────────────

  const renderETicket = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Success Animation */}
      <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.Text style={[styles.successTick, {
          opacity: tickAnim,
          transform: [{ scale: tickAnim }],
        }]}>✓</Animated.Text>
      </Animated.View>
      <Text style={styles.successTitle}>BOOKING CONFIRMED!</Text>
      <Text style={styles.successSub}>Your e-ticket is ready</Text>

      {/* E-Ticket Card */}
      <View style={styles.ticketCard}>
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.ticketLuxora}>LUXORA</Text>
            <Text style={styles.ticketBy}>by Hannan Khawaja</Text>
          </View>
          <View style={styles.ticketRefBlock}>
            <Text style={styles.ticketRefLabel}>BOOKING REF</Text>
            <Text style={styles.ticketRef}>{bookingRef}</Text>
          </View>
        </View>

        {/* Gold Divider with Plane */}
        <View style={styles.ticketDividerRow}>
          <View style={styles.ticketNotch} />
          <View style={styles.ticketDashedLine} />
          <Text style={styles.ticketPlane}>✈</Text>
          <View style={styles.ticketDashedLine} />
          <View style={styles.ticketNotch} />
        </View>

        {/* Route */}
        <View style={styles.ticketRoute}>
          <View style={styles.ticketRouteBlock}>
            <Text style={styles.ticketCode}>{searchParams.fromCode}</Text>
            <Text style={styles.ticketCity}>{searchParams.from}</Text>
            <Text style={styles.ticketTime}>{flight.departure}</Text>
          </View>
          <View style={styles.ticketRouteMid}>
            <Text style={styles.ticketDuration}>{flight.duration}</Text>
            <View style={styles.ticketArrow}>
              <View style={styles.ticketArrowLine} />
              <Text style={styles.ticketArrowHead}>▶</Text>
            </View>
            <Text style={styles.ticketStops}>
              {flight.stops === 0 ? 'NON STOP' : `${flight.stops} STOP`}
            </Text>
          </View>
          <View style={[styles.ticketRouteBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.ticketCode}>{searchParams.toCode}</Text>
            <Text style={styles.ticketCity}>{searchParams.to}</Text>
            <Text style={styles.ticketTime}>{flight.arrival}</Text>
          </View>
        </View>

        {/* Ticket Details Grid */}
        <View style={styles.ticketGrid}>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>DATE</Text>
            <Text style={styles.ticketGridValue}>{searchParams.departDate}</Text>
          </View>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>FLIGHT</Text>
            <Text style={styles.ticketGridValue}>{flight.flightNumber}</Text>
          </View>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>SEAT</Text>
            <Text style={styles.ticketGridValue}>{selectedSeat}</Text>
          </View>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>CLASS</Text>
            <Text style={styles.ticketGridValue}>{flight.cabin.toUpperCase()}</Text>
          </View>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>PASSENGER</Text>
            <Text style={styles.ticketGridValue}>
              {passengers[0].firstName} {passengers[0].lastName}
            </Text>
          </View>
          <View style={styles.ticketGridItem}>
            <Text style={styles.ticketGridLabel}>BAGGAGE</Text>
            <Text style={styles.ticketGridValue}>{flight.baggage}</Text>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.ticketDividerRow}>
          <View style={styles.ticketNotch} />
          <View style={styles.ticketDashedLine} />
          <View style={styles.ticketNotch} />
        </View>

        <View style={styles.barcodeSection}>
          {/* Fake Barcode */}
          <View style={styles.barcode}>
            {Array(38).fill(0).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.barcodeLine,
                  {
                    width: Math.random() > 0.5 ? 2 : 1,
                    height: i % 7 === 0 ? 44 : 32,
                    backgroundColor: COLORS.white,
                    marginHorizontal: 0.8,
                  }
                ]}
              />
            ))}
          </View>
          <Text style={styles.barcodeRef}>{bookingRef} · {flight.flightNumber}</Text>
        </View>

        <Text style={styles.ticketFooter}>
          LUXORA TRAVEL · PREMIUM EXPERIENCE · HANNAN KHAWAJA
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.downloadBtn}>
        <Text style={styles.downloadBtnText}>⬇ DOWNLOAD E-TICKET</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareBtnText}>↗ SHARE TICKET</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeBtn} onPress={() => onConfirm(bookingRef)}>
        <Text style={styles.homeBtnText}>GO TO HOME</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Processing Overlay ─────────────────────────────────────────────────────

  const renderProcessing = () => (
    <View style={styles.processingOverlay}>
      <View style={styles.processingCard}>
        <Animated.Text style={[styles.processingIcon, {
          transform: [{
            rotate: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0deg', '360deg'] })
          }]
        }]}>⟳</Animated.Text>
        <Text style={styles.processingTitle}>PROCESSING PAYMENT</Text>
        <Text style={styles.processingSubtitle}>Please wait...</Text>
        <Text style={styles.processingAmount}>USD {grandTotal}</Text>
      </View>
    </View>
  );

  // ─── Bottom CTA ─────────────────────────────────────────────────────────────

  const renderBottomCTA = () => {
    if (step === 3) return null;
    if (step === 2) {
      return (
        <View style={styles.bottomCTA}>
          <View style={styles.ctaPrice}>
            <Text style={styles.ctaPriceLabel}>TOTAL</Text>
            <Text style={styles.ctaPriceValue}>USD {grandTotal}</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={handlePayment}>
            <Text style={styles.ctaBtnText}>PAY NOW</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.bottomCTA}>
        <View style={styles.ctaPrice}>
          <Text style={styles.ctaPriceLabel}>TOTAL</Text>
          <Text style={styles.ctaPriceValue}>USD {grandTotal}</Text>
        </View>
        <TouchableOpacity style={styles.ctaBtn} onPress={goNext}>
          <Text style={styles.ctaBtnText}>
            {step === 0 ? 'SELECT SEAT →' : 'PAYMENT →'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Gender Modal ───────────────────────────────────────────────────────────

  const GenderModal = () => (
    <Modal visible={showGenderModal} transparent animationType="slide" onRequestClose={() => setShowGenderModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>SELECT GENDER</Text>
          {(['Male', 'Female'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.sheetOption, passengers[activePassenger].gender === g && styles.sheetOptionActive]}
              onPress={() => { updatePassenger('gender', g); setShowGenderModal(false); }}
            >
              <Text style={[styles.sheetOptionText, passengers[activePassenger].gender === g && { color: COLORS.gold }]}>{g}</Text>
              {passengers[activePassenger].gender === g && <Text style={{ color: COLORS.gold }}>✦</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Nationality Modal ──────────────────────────────────────────────────────

  const NationalityModal = () => (
    <Modal visible={showNationalityModal} transparent animationType="slide" onRequestClose={() => setShowNationalityModal(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNationalityModal(false)}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>SELECT NATIONALITY</Text>
          {NATIONALITIES.map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.sheetOption, passengers[activePassenger].nationality === n && styles.sheetOptionActive]}
              onPress={() => { updatePassenger('nationality', n); setShowNationalityModal(false); }}
            >
              <Text style={[styles.sheetOptionText, passengers[activePassenger].nationality === n && { color: COLORS.gold }]}>{n}</Text>
              {passengers[activePassenger].nationality === n && <Text style={{ color: COLORS.gold }}>✦</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        {step < 3 && (
          <TouchableOpacity onPress={step === 0 ? onBack : () => setStep(s => s - 1)} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {step === 3 ? 'E-TICKET' : 'BOOK FLIGHT'}
          </Text>
          <Text style={styles.headerSub}>
            {step < 3 ? `STEP ${step + 1} OF ${STEPS.length}` : `REF: ${bookingRef}`}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Step Bar */}
      {renderStepBar()}

      {/* Content */}
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          {step === 0 && renderPassengerStep()}
          {step === 1 && renderSeatStep()}
          {step === 2 && renderPaymentStep()}
          {step === 3 && renderETicket()}
        </View>
      </Animated.View>

      {/* Bottom CTA */}
      {renderBottomCTA()}

      {/* Processing Overlay */}
      {processing && renderProcessing()}

      {/* Modals */}
      <GenderModal />
      <NationalityModal />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.goldDim, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  backIcon: { color: COLORS.gold, fontSize: 18, fontWeight: '300' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.white, fontSize: 16,
    fontWeight: '800', letterSpacing: 3,
  },
  headerSub: { color: COLORS.grey, fontSize: 10, letterSpacing: 1.5, marginTop: 2 },

  // Step Bar
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.grey,
  },
  stepActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  stepDone: { backgroundColor: COLORS.gold + '33', borderColor: COLORS.gold },
  stepDoneIcon: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  stepNum: { color: COLORS.grey, fontSize: 11, fontWeight: '700' },
  stepLabel: {
    color: COLORS.grey, fontSize: 8,
    letterSpacing: 1, marginTop: 4, fontWeight: '600',
  },
  stepLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: COLORS.gold + '55' },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.gold + '33',
  },
  summaryAirline: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  summaryLogo: { fontSize: 24, marginRight: 10 },
  summaryAirlineName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  summaryFlight: { color: COLORS.grey, fontSize: 10, letterSpacing: 1 },
  summaryPriceTag: { alignItems: 'flex-end' },
  summaryPrice: { color: COLORS.goldLight, fontSize: 16, fontWeight: '800' },
  summaryPerPax: { color: COLORS.grey, fontSize: 9 },
  summaryRoute: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryTimeBlock: { alignItems: 'flex-start' },
  summaryTime: { color: COLORS.white, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  summaryCode: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  summaryCitySmall: { color: COLORS.grey, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  summaryMid: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  summaryDuration: { color: COLORS.grey, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  summaryLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  summaryDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.gold },
  summaryBar: { flex: 1, height: 1, backgroundColor: COLORS.gold + '44' },
  summaryPlane: { fontSize: 14, marginHorizontal: 4 },
  summaryStops: { color: COLORS.grey, fontSize: 9, letterSpacing: 1.5, marginTop: 4 },
  summaryMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryMetaText: { color: COLORS.grey, fontSize: 10, letterSpacing: 0.5 },

  // Passenger Tabs
  passengerTabs: { marginBottom: 12 },
  passengerTab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.gold + '44',
    backgroundColor: COLORS.goldDim,
    marginRight: 8,
  },
  passengerTabActive: { backgroundColor: COLORS.gold },
  passengerTabText: { color: COLORS.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  // Form
  formCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  formTitle: {
    color: COLORS.gold, fontSize: 11,
    fontWeight: '800', letterSpacing: 2.5, marginBottom: 16,
  },
  fieldLabel: {
    color: COLORS.grey, fontSize: 9,
    fontWeight: '700', letterSpacing: 1.5, marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.white, fontSize: 13,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    letterSpacing: 0.5,
  },
  fieldRow: { flexDirection: 'row' },
  selectField: {
    backgroundColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  selectFieldText: { flex: 1, color: COLORS.white, fontSize: 13, letterSpacing: 0.5 },
  selectArrow: { color: COLORS.gold, fontSize: 14 },

  // Price Card
  priceCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.gold + '22',
  },
  priceCardTitle: {
    color: COLORS.gold, fontSize: 11,
    fontWeight: '800', letterSpacing: 2, marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: { color: COLORS.grey, fontSize: 12, letterSpacing: 0.3 },
  priceValue: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  priceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  priceTotalLabel: { color: COLORS.white, fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  priceTotalValue: { color: COLORS.goldLight, fontSize: 18, fontWeight: '800' },

  // Seat Map
  seatLegend: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 20, marginBottom: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 14, height: 14, borderRadius: 3, marginRight: 6 },
  legendText: { color: COLORS.grey, fontSize: 10, letterSpacing: 0.5 },
  planeNose: {
    alignItems: 'center', marginBottom: 12,
    paddingVertical: 8, borderRadius: 8,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1, borderColor: COLORS.gold + '33',
  },
  planeNoseText: { color: COLORS.gold, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  seatMap: { alignItems: 'center', marginBottom: 16 },
  seatRow: { flexDirection: 'row', marginBottom: 6 },
  seatCell: { width: 36, height: 20, alignItems: 'center', justifyContent: 'center' },
  colLabel: { color: COLORS.grey, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  seat: {
    width: 34, height: 34, borderRadius: 6, margin: 1,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  seatOccupied: { backgroundColor: COLORS.grey + '22', borderColor: COLORS.grey + '33' },
  seatSelected: { backgroundColor: COLORS.gold, borderColor: COLORS.goldLight },
  seatText: { color: COLORS.white, fontSize: 9, fontWeight: '600' },
  seatAisle: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' },
  aisleNum: { color: COLORS.grey + '66', fontSize: 9 },
  selectedSeatInfo: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 16, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  selectedSeatLabel: { color: COLORS.grey, fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  selectedSeatValue: { color: COLORS.goldLight, fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  selectedSeatCabin: { color: COLORS.grey, fontSize: 10, letterSpacing: 1.5, marginTop: 4 },

  // Payment
  paymentMethods: { marginBottom: 16 },
  paymentMethod: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  paymentMethodActive: { borderColor: COLORS.gold + '55', backgroundColor: COLORS.goldDim },
  paymentIcon: { fontSize: 20, marginRight: 12 },
  paymentLabel: { flex: 1, color: COLORS.white, fontSize: 13, letterSpacing: 0.3 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.grey,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: COLORS.gold },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold },
  altPayCard: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 24, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  altPayIcon: { fontSize: 36, marginBottom: 12 },
  altPayText: { color: COLORS.grey, fontSize: 12, textAlign: 'center', lineHeight: 20 },
  securityBadge: {
    alignItems: 'center', paddingVertical: 12,
    marginBottom: 16,
  },
  securityText: { color: COLORS.grey + '88', fontSize: 9, letterSpacing: 1.5 },

  // Bottom CTA
  bottomCTA: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaPrice: { flex: 1 },
  ctaPriceLabel: { color: COLORS.grey, fontSize: 9, letterSpacing: 1.5 },
  ctaPriceValue: { color: COLORS.goldLight, fontSize: 20, fontWeight: '800' },
  ctaBtn: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12, backgroundColor: COLORS.gold,
  },
  ctaBtnText: { color: COLORS.bg, fontSize: 13, fontWeight: '800', letterSpacing: 2 },

  // Processing
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  processingCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.gold + '44',
    minWidth: 220,
  },
  processingIcon: { fontSize: 40, color: COLORS.gold, marginBottom: 16 },
  processingTitle: {
    color: COLORS.white, fontSize: 14,
    fontWeight: '800', letterSpacing: 2, marginBottom: 8,
  },
  processingSubtitle: { color: COLORS.grey, fontSize: 12, marginBottom: 16 },
  processingAmount: { color: COLORS.goldLight, fontSize: 24, fontWeight: '800' },

  // E-Ticket
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.gold + '22',
    borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 8, marginBottom: 12,
  },
  successTick: { color: COLORS.gold, fontSize: 36, fontWeight: '800' },
  successTitle: {
    color: COLORS.white, fontSize: 20,
    fontWeight: '800', letterSpacing: 3,
    textAlign: 'center', marginBottom: 6,
  },
  successSub: {
    color: COLORS.grey, fontSize: 12,
    letterSpacing: 1.5, textAlign: 'center', marginBottom: 24,
  },
  ticketCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.gold + '55',
  },
  ticketHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 20,
    backgroundColor: COLORS.goldDim2,
  },
  ticketLuxora: {
    color: COLORS.gold, fontSize: 18,
    fontWeight: '800', letterSpacing: 4,
  },
  ticketBy: { color: COLORS.grey, fontSize: 9, letterSpacing: 1 },
  ticketRefBlock: { alignItems: 'flex-end' },
  ticketRefLabel: { color: COLORS.grey, fontSize: 8, letterSpacing: 1.5 },
  ticketRef: {
    color: COLORS.goldLight, fontSize: 16,
    fontWeight: '800', letterSpacing: 2,
  },
  ticketDividerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 0,
  },
  ticketNotch: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.bg,
    marginHorizontal: -9,
    zIndex: 1,
  },
  ticketDashedLine: {
    flex: 1, height: 1,
    borderStyle: 'dashed', borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  ticketPlane: { color: COLORS.gold, fontSize: 16, marginHorizontal: 8 },
  ticketRoute: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20,
  },
  ticketRouteBlock: { alignItems: 'flex-start' },
  ticketCode: {
    color: COLORS.white, fontSize: 28,
    fontWeight: '800', letterSpacing: 2,
  },
  ticketCity: { color: COLORS.grey, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  ticketTime: { color: COLORS.gold, fontSize: 16, fontWeight: '700', marginTop: 4 },
  ticketRouteMid: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  ticketDuration: { color: COLORS.grey, fontSize: 9, letterSpacing: 1, marginBottom: 6 },
  ticketArrow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  ticketArrowLine: { flex: 1, height: 1, backgroundColor: COLORS.gold + '55' },
  ticketArrowHead: { color: COLORS.gold, fontSize: 10 },
  ticketStops: { color: COLORS.grey, fontSize: 8, letterSpacing: 1.5, marginTop: 4 },
  ticketGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  ticketGridItem: { width: '33.3%', marginBottom: 14 },
  ticketGridLabel: { color: COLORS.grey, fontSize: 8, letterSpacing: 1.5, marginBottom: 4 },
  ticketGridValue: { color: COLORS.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  barcodeSection: { alignItems: 'center', padding: 20 },
  barcode: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barcodeLine: {},
  barcodeRef: { color: COLORS.grey, fontSize: 8, letterSpacing: 2 },
  ticketFooter: {
    color: COLORS.grey + '66', fontSize: 7,
    letterSpacing: 1.5, textAlign: 'center',
    paddingBottom: 14,
  },
  downloadBtn: {
    marginHorizontal: 16, marginBottom: 10,
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1, borderColor: COLORS.gold + '55',
    alignItems: 'center',
  },
  downloadBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  shareBtn: {
    marginHorizontal: 16, marginBottom: 10,
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1, borderColor: COLORS.gold + '33',
    alignItems: 'center',
  },
  shareBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  homeBtn: {
    marginHorizontal: 16, marginBottom: 10,
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.gold, alignItems: 'center',
  },
  homeBtnText: { color: COLORS.bg, fontSize: 13, fontWeight: '800', letterSpacing: 3 },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: COLORS.gold + '33',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: COLORS.grey,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: {
    color: COLORS.gold, fontSize: 12,
    fontWeight: '800', letterSpacing: 3, marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sheetOptionActive: {
    backgroundColor: COLORS.goldDim, borderRadius: 8, paddingHorizontal: 12,
  },
  sheetOptionText: { color: COLORS.white, fontSize: 13, letterSpacing: 0.5 },
});