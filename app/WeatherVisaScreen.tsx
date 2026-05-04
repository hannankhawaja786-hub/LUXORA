// WeatherVisaScreen.tsx

import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const BG = '#0A0A0F';
const GOLD = '#C9A84C';
const CARD_BG = '#0E0E15';
const WHITE = '#FFFFFF';
const GREY = '#55556A';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ForecastDay { day: string; high: number; low: number; condition: string }
interface WeatherData {
  city: string; country: string; temp: number; feelsLike: number;
  condition: string; humidity: number; windSpeed: number; uvIndex: number;
  visibility: number; airQuality: string; sunrise: string; sunset: string;
  forecast: ForecastDay[]; bestTimeToVisit: string; currency: string; timezone: string;
}
interface VisaData {
  required: boolean; type: string; duration: string; cost: string;
  processingTime: string; entryType: string; requirements: string[]; notes: string; applyUrl: string;
}
interface DestinationInfo { weather: WeatherData; visa: VisaData }

// ─── Forecast Helper ────────────────────────────────────────────────────────

const mkFC = (data: [number, number, string][]): ForecastDay[] =>
  ['MON','TUE','WED','THU','FRI','SAT','SUN'].map((day, i) => ({
    day, high: data[i][0], low: data[i][1], condition: data[i][2],
  }));

// ─── Destination Database ────────────────────────────────────────────────────

const DB: Record<string, DestinationInfo> = {
  riyadh: {
    weather: {
      city: 'Riyadh', country: 'Saudi Arabia', temp: 36, feelsLike: 39,
      condition: 'Sunny & Hot', humidity: 14, windSpeed: 22, uvIndex: 11,
      visibility: 10, airQuality: 'Moderate', sunrise: '05:45', sunset: '18:52',
      forecast: mkFC([[37,23,'Sunny'],[36,22,'Clear'],[38,25,'Sunny'],[35,22,'Hazy'],[34,21,'Clear'],[36,23,'Sunny'],[37,24,'Clear']]),
      bestTimeToVisit: 'October to February', currency: 'SAR · Saudi Riyal', timezone: 'UTC+3 · AST',
    },
    visa: {
      required: true, type: 'eVisa', duration: '30–90 Days', cost: 'SAR 300 (~$80)',
      processingTime: '3–5 Business Days', entryType: 'Single / Multiple Entry',
      requirements: ['Valid Passport (6+ months validity)', 'Recent passport-size photograph', 'Confirmed hotel booking', 'Return air ticket', 'Bank statement (last 3 months)', 'Travel insurance'],
      notes: 'Saudi eVisa is available through the official MOFA portal. Pakistani nationals are eligible. Multiple-entry options available for longer durations. Dress modestly and respect all local customs.',
      applyUrl: 'https://visa.mofa.gov.sa',
    },
  },
  dubai: {
    weather: {
      city: 'Dubai', country: 'United Arab Emirates', temp: 34, feelsLike: 38,
      condition: 'Clear & Sunny', humidity: 46, windSpeed: 18, uvIndex: 10,
      visibility: 10, airQuality: 'Good', sunrise: '05:58', sunset: '18:44',
      forecast: mkFC([[35,25,'Sunny'],[34,24,'Clear'],[36,26,'Sunny'],[35,25,'Clear'],[33,24,'Partly Cloudy'],[34,24,'Sunny'],[35,25,'Clear']]),
      bestTimeToVisit: 'November to April', currency: 'AED · Dirham', timezone: 'UTC+4 · GST',
    },
    visa: {
      required: true, type: 'UAE Visit Visa', duration: '30 Days (extendable)', cost: 'AED 350 (~$95)',
      processingTime: '2–4 Business Days', entryType: 'Single / Multiple Entry',
      requirements: ['Valid Passport (6+ months)', 'Coloured passport photograph', 'Confirmed hotel reservation', 'Return flight ticket', 'Bank statement (3 months)', 'Sponsor letter (if applicable)'],
      notes: 'UAE Visit Visa for Pakistani passport holders must be applied through a licensed travel agency. Dubai-based sponsors can also sponsor your visa directly. Overstaying is penalised heavily.',
      applyUrl: 'https://icp.gov.ae',
    },
  },
  london: {
    weather: {
      city: 'London', country: 'United Kingdom', temp: 14, feelsLike: 11,
      condition: 'Partly Cloudy', humidity: 73, windSpeed: 24, uvIndex: 3,
      visibility: 9, airQuality: 'Good', sunrise: '05:52', sunset: '20:25',
      forecast: mkFC([[15,9,'Cloudy'],[13,8,'Light Rain'],[14,9,'Overcast'],[16,10,'Partly Cloudy'],[17,11,'Sunny'],[14,9,'Drizzle'],[13,8,'Cloudy']]),
      bestTimeToVisit: 'June to August', currency: 'GBP · Pound Sterling', timezone: 'UTC+1 · BST',
    },
    visa: {
      required: true, type: 'UK Standard Visitor Visa', duration: 'Up to 6 Months', cost: '£115 (~$145)',
      processingTime: '3 Weeks (standard)', entryType: 'Multiple Entry',
      requirements: ['Valid passport', 'Completed UK visa application online', 'Biometric appointment at VFS Global', 'Bank statements (6 months)', 'Proof of employment or business', 'Return flight and hotel booking', 'Travel insurance', 'Sponsor letter (if hosted)'],
      notes: 'UK visa for Pakistani nationals is a thorough process. Ensure all financial documents show regular consistent income. Appointments are booked via VFS Global. Decision is typically issued within 3 weeks.',
      applyUrl: 'https://www.gov.uk/apply-uk-visa',
    },
  },
  istanbul: {
    weather: {
      city: 'Istanbul', country: 'Turkey', temp: 17, feelsLike: 15,
      condition: 'Mild & Breezy', humidity: 66, windSpeed: 20, uvIndex: 4,
      visibility: 10, airQuality: 'Good', sunrise: '06:08', sunset: '19:52',
      forecast: mkFC([[18,11,'Partly Cloudy'],[17,10,'Sunny'],[16,10,'Light Rain'],[18,12,'Clear'],[19,12,'Sunny'],[17,10,'Overcast'],[18,11,'Partly Cloudy']]),
      bestTimeToVisit: 'April to June · September to November', currency: 'TRY · Turkish Lira', timezone: 'UTC+3 · TRT',
    },
    visa: {
      required: true, type: 'eVisa', duration: '30 Days', cost: '$50 USD',
      processingTime: '24–72 Hours', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'Credit or debit card for payment', 'Active email address', 'Return flight details'],
      notes: 'Turkey eVisa is quick and simple — completed entirely online. Pakistani nationals are eligible. Print or save digital copy. For longer stays, apply for a residence permit upon arrival at the local authority.',
      applyUrl: 'https://www.evisa.gov.tr',
    },
  },
  paris: {
    weather: {
      city: 'Paris', country: 'France', temp: 16, feelsLike: 13,
      condition: 'Overcast with Showers', humidity: 72, windSpeed: 15, uvIndex: 3,
      visibility: 8, airQuality: 'Moderate', sunrise: '06:41', sunset: '20:52',
      forecast: mkFC([[16,9,'Rainy'],[14,8,'Overcast'],[17,10,'Partly Cloudy'],[18,11,'Sunny'],[15,9,'Drizzle'],[14,8,'Light Rain'],[16,10,'Partly Cloudy']]),
      bestTimeToVisit: 'April to June · September to October', currency: 'EUR · Euro', timezone: 'UTC+2 · CEST',
    },
    visa: {
      required: true, type: 'Schengen Visa — Type C', duration: 'Up to 90 Days', cost: '€80 (~$87)',
      processingTime: '4–6 Weeks', entryType: 'Single / Multiple Entry',
      requirements: ['Valid passport', 'Schengen application form', 'Two passport photographs', 'Travel insurance (€30,000 min coverage)', 'Bank statements (6 months)', 'Employment NOC or business proof', 'Hotel reservations', 'Return flight tickets'],
      notes: 'A Schengen Visa grants access to all 27 Schengen countries. Apply at VFS Global (France). Book biometric appointment early during peak seasons. Financial proof is closely scrutinised.',
      applyUrl: 'https://france-visas.gouv.fr',
    },
  },
  maldives: {
    weather: {
      city: 'Male', country: 'Maldives', temp: 30, feelsLike: 35,
      condition: 'Tropical & Sunny', humidity: 82, windSpeed: 13, uvIndex: 11,
      visibility: 15, airQuality: 'Good', sunrise: '06:02', sunset: '18:15',
      forecast: mkFC([[30,27,'Sunny'],[31,27,'Partly Cloudy'],[29,26,'Tropical Showers'],[30,27,'Clear'],[31,27,'Sunny'],[30,26,'Cloudy'],[30,27,'Sunny']]),
      bestTimeToVisit: 'November to April (Dry Season)', currency: 'MVR · Maldivian Rufiyaa', timezone: 'UTC+5 · MVT',
    },
    visa: {
      required: false, type: 'Visa on Arrival — Free', duration: '30 Days (extendable)', cost: 'Free of Charge',
      processingTime: 'Immediate on Arrival', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'Return air ticket', 'Confirmed hotel or resort booking', 'Proof of sufficient funds ($100/day)'],
      notes: 'Pakistani passport holders receive a free 30-day visa on arrival in the Maldives. Extensions up to 90 days are possible at local immigration. Maldives is a Muslim-majority nation — highly recommended for Pakistani travelers.',
      applyUrl: 'https://immigration.gov.mv',
    },
  },
  bangkok: {
    weather: {
      city: 'Bangkok', country: 'Thailand', temp: 35, feelsLike: 42,
      condition: 'Hot & Humid', humidity: 78, windSpeed: 10, uvIndex: 11,
      visibility: 7, airQuality: 'Moderate', sunrise: '06:04', sunset: '18:27',
      forecast: mkFC([[36,27,'Sunny & Hot'],[35,27,'Hazy'],[36,28,'Thunderstorm'],[34,26,'Partly Cloudy'],[35,27,'Sunny'],[36,27,'Hot'],[35,26,'Partly Cloudy']]),
      bestTimeToVisit: 'November to February (Cool Season)', currency: 'THB · Thai Baht', timezone: 'UTC+7 · ICT',
    },
    visa: {
      required: true, type: 'Tourist Visa on Arrival', duration: '30 Days', cost: 'THB 2,000 (~$55)',
      processingTime: 'On Arrival (30–60 min queue)', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'Completed arrival card', 'Return flight ticket', 'Hotel reservation', 'THB 10,000 cash equivalent', 'Passport-size photograph'],
      notes: 'Visa on Arrival is available for Pakistani nationals at Suvarnabhumi Airport. Apply ahead via Thai e-Visa portal to skip arrival queues. April is peak hot season — pack light and stay hydrated.',
      applyUrl: 'https://www.thaievisa.go.th',
    },
  },
  singapore: {
    weather: {
      city: 'Singapore', country: 'Singapore', temp: 31, feelsLike: 37,
      condition: 'Tropical with Showers', humidity: 84, windSpeed: 12, uvIndex: 8,
      visibility: 10, airQuality: 'Good', sunrise: '07:00', sunset: '19:13',
      forecast: mkFC([[31,25,'Partly Cloudy'],[30,25,'Afternoon Showers'],[31,26,'Sunny'],[32,26,'Thunderstorm'],[30,25,'Overcast'],[31,25,'Sunny'],[30,25,'Showers']]),
      bestTimeToVisit: 'February to April', currency: 'SGD · Singapore Dollar', timezone: 'UTC+8 · SGT',
    },
    visa: {
      required: true, type: 'Singapore Visitor Visa', duration: '30 Days', cost: 'SGD 30 (~$22)',
      processingTime: '3–5 Business Days', entryType: 'Single Entry',
      requirements: ['Valid passport', 'Online visa application via ICA', 'Passport-size photographs', 'Bank statements (3 months)', 'Employment letter / NOC', 'Hotel confirmation', 'Return ticket'],
      notes: 'Pakistani nationals must apply in advance via the ICA portal. Singapore is a zero-tolerance country — no littering, no jaywalking, no gum. Changi Airport consistently ranks as the world\'s best airport.',
      applyUrl: 'https://visa.ica.gov.sg',
    },
  },
  'new york': {
    weather: {
      city: 'New York', country: 'United States', temp: 16, feelsLike: 13,
      condition: 'Partly Cloudy', humidity: 56, windSpeed: 22, uvIndex: 4,
      visibility: 16, airQuality: 'Good', sunrise: '06:08', sunset: '19:47',
      forecast: mkFC([[17,9,'Sunny'],[14,8,'Rainy'],[16,9,'Partly Cloudy'],[18,10,'Clear'],[15,9,'Cloudy'],[14,8,'Drizzle'],[17,10,'Sunny']]),
      bestTimeToVisit: 'April to June · September to November', currency: 'USD · US Dollar', timezone: 'UTC−4 · EDT',
    },
    visa: {
      required: true, type: 'B-1/B-2 Visitor Visa', duration: 'Up to 6 Months', cost: '$185 USD',
      processingTime: '4–8 Weeks (interview required)', entryType: 'Multiple Entry (10 years)',
      requirements: ['Valid passport', 'DS-160 application form (online)', 'US visa fee payment receipt', 'Consulate interview appointment', 'Bank statements (6 months)', 'Proof of strong ties to Pakistan', 'Employment or business documents', 'Travel itinerary'],
      notes: 'US visa requires an in-person interview at the US Consulate in Islamabad, Lahore, or Karachi. Demonstrating strong ties to Pakistan (property, job, family) is absolutely essential. Prepare thoroughly — refusals are common.',
      applyUrl: 'https://ceac.state.gov/genniv',
    },
  },
  tokyo: {
    weather: {
      city: 'Tokyo', country: 'Japan', temp: 18, feelsLike: 15,
      condition: 'Mild & Pleasant', humidity: 62, windSpeed: 16, uvIndex: 5,
      visibility: 12, airQuality: 'Good', sunrise: '05:12', sunset: '18:32',
      forecast: mkFC([[19,12,'Sunny'],[17,11,'Partly Cloudy'],[18,12,'Clear'],[20,13,'Sunny'],[19,12,'Light Rain'],[17,10,'Cloudy'],[18,11,'Partly Cloudy']]),
      bestTimeToVisit: 'March to May · October to November', currency: 'JPY · Japanese Yen', timezone: 'UTC+9 · JST',
    },
    visa: {
      required: true, type: 'Short-Stay Tourist Visa', duration: '15–30 Days', cost: 'No Visa Fee',
      processingTime: '5–7 Business Days', entryType: 'Single Entry',
      requirements: ['Valid passport', 'Japan visa application form', 'Passport photo (4.5 x 4.5 cm)', 'Round-trip flight itinerary', 'Accommodation proof', 'Bank statements (3 months, 500k PKR+)', 'Employer NOC or business proof', 'Detailed daily itinerary'],
      notes: 'Japan is highly detail-oriented with visa applications — provide a thorough day-by-day itinerary. No visa fee applies. Apply at the Embassy of Japan in Islamabad. One of the safest travel destinations globally.',
      applyUrl: 'https://www.pk.emb-japan.go.jp',
    },
  },
  baku: {
    weather: {
      city: 'Baku', country: 'Azerbaijan', temp: 15, feelsLike: 12,
      condition: 'Mild & Breezy', humidity: 68, windSpeed: 30, uvIndex: 4,
      visibility: 10, airQuality: 'Good', sunrise: '06:21', sunset: '19:58',
      forecast: mkFC([[15,9,'Sunny'],[17,10,'Partly Cloudy'],[14,9,'Windy'],[16,10,'Clear'],[18,11,'Sunny'],[15,9,'Partly Cloudy'],[14,8,'Windy']]),
      bestTimeToVisit: 'April to June · September to October', currency: 'AZN · Azerbaijani Manat', timezone: 'UTC+4 · AZT',
    },
    visa: {
      required: true, type: 'ASAN eVisa', duration: '30 Days', cost: '$26 USD',
      processingTime: '3–5 Business Days', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'Digital passport photo', 'Credit or debit card for payment', 'Valid email address for confirmation'],
      notes: "Azerbaijan's ASAN eVisa is one of the simplest eVisas globally — fully online in minutes. Baku is rapidly modernising and is a highly popular destination for Pakistani tourists due to its ease of access and beauty.",
      applyUrl: 'https://evisa.gov.az',
    },
  },
  cairo: {
    weather: {
      city: 'Cairo', country: 'Egypt', temp: 26, feelsLike: 28,
      condition: 'Sunny & Dry', humidity: 30, windSpeed: 16, uvIndex: 8,
      visibility: 10, airQuality: 'Moderate', sunrise: '05:56', sunset: '18:52',
      forecast: mkFC([[27,16,'Sunny'],[26,15,'Clear'],[28,17,'Sunny'],[27,16,'Partly Cloudy'],[26,15,'Sunny'],[25,14,'Clear'],[27,16,'Sunny']]),
      bestTimeToVisit: 'October to April', currency: 'EGP · Egyptian Pound', timezone: 'UTC+2 · EET',
    },
    visa: {
      required: true, type: 'Visa on Arrival', duration: '30 Days', cost: '$25 USD',
      processingTime: 'Immediate on Arrival', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'USD 25 in cash (exact)', 'Return flight ticket', 'Hotel reservation'],
      notes: 'Egyptian Visa on Arrival is straightforward for Pakistani passport holders. Pay at the bank counter before immigration. Egypt is a Muslim-majority country. The Pyramids, Nile River, and Red Sea are world-class destinations.',
      applyUrl: 'https://www.visa2egypt.gov.eg',
    },
  },
  muscat: {
    weather: {
      city: 'Muscat', country: 'Oman', temp: 35, feelsLike: 38,
      condition: 'Hot & Clear', humidity: 38, windSpeed: 15, uvIndex: 10,
      visibility: 10, airQuality: 'Good', sunrise: '05:48', sunset: '18:43',
      forecast: mkFC([[36,25,'Sunny'],[35,24,'Clear'],[37,26,'Hot & Sunny'],[36,25,'Clear'],[35,24,'Partly Hazy'],[34,24,'Sunny'],[35,25,'Clear']]),
      bestTimeToVisit: 'October to March', currency: 'OMR · Omani Rial', timezone: 'UTC+4 · GST',
    },
    visa: {
      required: true, type: 'eVisa', duration: '30 Days', cost: 'OMR 20 (~$52)',
      processingTime: '3–5 Business Days', entryType: 'Single Entry',
      requirements: ['Valid passport (6+ months)', 'Digital photograph', 'Return ticket', 'Hotel confirmation', 'Bank statement'],
      notes: 'Oman eVisa is fully online and valid for Pakistani nationals. Oman is one of the safest Arab countries with stunning wadis, mountains, and desert landscapes. A hidden gem of the Arabian Peninsula.',
      applyUrl: 'https://evisa.rop.gov.om',
    },
  },
  rome: {
    weather: {
      city: 'Rome', country: 'Italy', temp: 18, feelsLike: 16,
      condition: 'Warm & Sunny', humidity: 60, windSpeed: 14, uvIndex: 5,
      visibility: 12, airQuality: 'Good', sunrise: '06:23', sunset: '20:09',
      forecast: mkFC([[19,11,'Sunny'],[18,10,'Partly Cloudy'],[20,12,'Clear'],[17,10,'Light Rain'],[19,11,'Sunny'],[20,12,'Clear'],[18,10,'Partly Cloudy']]),
      bestTimeToVisit: 'April to June · September to October', currency: 'EUR · Euro', timezone: 'UTC+2 · CEST',
    },
    visa: {
      required: true, type: 'Schengen Visa — Type C', duration: 'Up to 90 Days', cost: '€80 (~$87)',
      processingTime: '4–6 Weeks', entryType: 'Multiple Entry',
      requirements: ['Valid passport', 'Schengen application form', 'Two passport photographs', 'Travel insurance (€30,000 min)', 'Bank statements (6 months)', 'Hotel reservations', 'Return flight ticket', 'Employment NOC or business proof'],
      notes: 'Italian Schengen Visa covers all 27 Schengen countries. Apply via VFS Global (Italy). Plan well ahead especially for summer months as appointment slots fill quickly. Rome, Florence, and Venice are unmissable.',
      applyUrl: 'https://vfsglobal.com/en/citizens/pakistan/italy',
    },
  },
  'kuala lumpur': {
    weather: {
      city: 'Kuala Lumpur', country: 'Malaysia', temp: 32, feelsLike: 38,
      condition: 'Tropical with Showers', humidity: 85, windSpeed: 11, uvIndex: 9,
      visibility: 7, airQuality: 'Moderate', sunrise: '07:06', sunset: '19:19',
      forecast: mkFC([[32,25,'Thunderstorm'],[31,24,'Partly Cloudy'],[33,26,'Sunny'],[32,25,'Afternoon Rain'],[31,25,'Overcast'],[32,25,'Sunny'],[31,24,'Showers']]),
      bestTimeToVisit: 'May to July · December to February', currency: 'MYR · Malaysian Ringgit', timezone: 'UTC+8 · MYT',
    },
    visa: {
      required: true, type: 'eVisa / eNTRI', duration: '15–30 Days', cost: 'MYR 150 (~$33)',
      processingTime: '1–3 Business Days', entryType: 'Single Entry',
      requirements: ['Valid passport', 'eVisa online application', 'Passport-size photo', 'Return flight', 'Hotel booking', 'Bank statement'],
      notes: 'Pakistani nationals can apply for Malaysia eVisa fully online in under 10 minutes. eNTRI allows a 15-day tourism stay. Malaysia is a Muslim-majority country with halal food widely available everywhere.',
      applyUrl: 'https://enotis.imi.gov.my',
    },
  },
};

// ─── Aliases ───────────────────────────────────────────────────────────────

const ALIASES: Record<string, string> = {
  'saudi': 'riyadh', 'saudi arabia': 'riyadh', 'ksa': 'riyadh',
  'jeddah': 'riyadh', 'mecca': 'riyadh', 'medina': 'riyadh',
  'uae': 'dubai', 'emirates': 'dubai', 'abu dhabi': 'dubai', 'sharjah': 'dubai',
  'uk': 'london', 'england': 'london', 'britain': 'london', 'united kingdom': 'london',
  'turkey': 'istanbul', 'türkiye': 'istanbul',
  'france': 'paris',
  'thailand': 'bangkok', 'phuket': 'bangkok', 'pattaya': 'bangkok',
  'usa': 'new york', 'america': 'new york', 'united states': 'new york', 'us': 'new york',
  'japan': 'tokyo', 'osaka': 'tokyo', 'kyoto': 'tokyo',
  'azerbaijan': 'baku',
  'egypt': 'cairo', 'giza': 'cairo',
  'italy': 'rome', 'milan': 'rome', 'venice': 'rome', 'florence': 'rome',
  'oman': 'muscat',
  'malaysia': 'kuala lumpur', 'kl': 'kuala lumpur',
  'sg': 'singapore',
};

const POPULAR_CHIPS = [
  { label: 'Riyadh', key: 'riyadh' }, { label: 'Dubai', key: 'dubai' },
  { label: 'London', key: 'london' }, { label: 'Istanbul', key: 'istanbul' },
  { label: 'Maldives', key: 'maldives' }, { label: 'Baku', key: 'baku' },
  { label: 'Bangkok', key: 'bangkok' }, { label: 'Tokyo', key: 'tokyo' },
];

function findDestination(query: string): DestinationInfo | null {
  const q = query.toLowerCase().trim();
  if (DB[q]) return DB[q];
  if (ALIASES[q]) return DB[ALIASES[q]];
  for (const key of Object.keys(DB)) {
    if (q.includes(key) || key.includes(q)) return DB[key];
  }
  for (const [alias, key] of Object.entries(ALIASES)) {
    if (q.includes(alias) || alias.includes(q)) return DB[key];
  }
  return null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function aqiColor(aqi: string) {
  const l = aqi.toLowerCase();
  if (l.includes('good')) return '#4CAF50';
  if (l.includes('moderate')) return GOLD;
  return '#FF5722';
}
function uvLabel(uv: number) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={sc.statWrap}>
      <View style={sc.statBar} />
      <Text style={sc.statLabel}>{label}</Text>
      <Text style={[sc.statValue, accent && { color: GOLD }]}>{value}</Text>
    </View>
  );
}

function TipRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={sc.tipRow}>
      <View style={sc.tipDot} />
      <Text style={sc.tipLabel}>{label}</Text>
      <Text style={sc.tipValue}>{value}</Text>
    </View>
  );
}

function VisaCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={sc.visaCard}>
      <Text style={sc.visaCardLabel}>{label}</Text>
      <Text style={sc.visaCardValue}>{value}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  statWrap: { flex: 1, paddingVertical: 13, paddingHorizontal: 12 },
  statBar: { width: 14, height: 1, backgroundColor: GOLD, marginBottom: 8, opacity: 0.6 },
  statLabel: { fontSize: 8, letterSpacing: 2.5, color: GREY, fontWeight: '700', marginBottom: 5 },
  statValue: { fontSize: 12, color: WHITE, fontWeight: '600', letterSpacing: 0.3 },
  tipRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#C9A84C0D' },
  tipDot: { width: 4, height: 4, backgroundColor: GOLD, marginRight: 12 },
  tipLabel: { flex: 1, fontSize: 9, letterSpacing: 2, color: GREY, fontWeight: '700' },
  tipValue: { fontSize: 12, color: WHITE, letterSpacing: 0.4, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  visaCard: { width: (width - 60) / 2, backgroundColor: CARD_BG, padding: 16, borderWidth: 1, borderColor: '#C9A84C1A' },
  visaCardLabel: { fontSize: 8, letterSpacing: 2.5, color: GREY, fontWeight: '700', marginBottom: 8 },
  visaCardValue: { fontSize: 13, color: WHITE, fontWeight: '700', letterSpacing: 0.4 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function WeatherVisaScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DestinationInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'weather' | 'visa'>('weather');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, { toValue: 1, duration: 1300, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const revealResult = () => {
    fadeAnim.setValue(0); slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const handleSearch = (dest?: string) => {
    const target = (dest ?? query).trim();
    if (!target) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setActiveTab('weather');
    setTimeout(() => {
      const info = findDestination(target);
      if (info) { setResult(info); revealResult(); }
      else setNotFound(true);
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => { setResult(null); setNotFound(false); setQuery(''); };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>WEATHER & VISA</Text>
          <Text style={s.headerSub}>TRAVEL INTELLIGENCE</Text>
        </View>
        <View style={s.headerAccentWrap}>
          <View style={s.headerAccentLine} />
          <View style={[s.headerAccentLine, { width: 10, marginTop: 5, opacity: 0.3 }]} />
        </View>
      </Animated.View>
      <View style={s.goldLineHard} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }} keyboardShouldPersistTaps="handled">

          {/* Search Bar */}
          <Animated.View style={[s.searchWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.searchBox}>
              <View style={s.searchPulse} />
              <TextInput
                style={s.searchInput}
                placeholder="Enter city or country..."
                placeholderTextColor={GREY}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => handleSearch()}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
                  <Text style={s.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[s.searchBtn, loading && { opacity: 0.5 }]}
              onPress={() => handleSearch()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={s.searchBtnText}>SEARCH</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Popular Chips */}
          {!result && !loading && !notFound && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={s.sectionTag}>— POPULAR DESTINATIONS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
                {POPULAR_CHIPS.map((d, i) => (
                  <TouchableOpacity key={i} style={s.chip} onPress={() => { setQuery(d.label); handleSearch(d.label); }} activeOpacity={0.75}>
                    <Text style={s.chipCity}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Intro Panel */}
              <View style={s.introPanel}>
                <View style={s.introPanelTopBar} />
                <Text style={s.introEyebrow}>— KNOW BEFORE YOU GO</Text>
                <Text style={s.introTitle}>Travel Intelligence{'\n'}At Your Fingertips</Text>
                <Text style={s.introBody}>
                  AI-powered weather forecasts and visa requirements for Pakistani passport holders — covering every destination worldwide.
                </Text>
                <View style={s.introFeatureGrid}>
                  {['7-Day Forecast', 'Visa Requirements', 'Processing Time', 'Best Season'].map((f, i) => (
                    <View key={i} style={s.introFeature}>
                      <View style={s.introFeatureDot} />
                      <Text style={s.introFeatureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Loading Shimmer */}
          {loading && (
            <View style={s.loadingWrap}>
              {/* Progress Bar */}
              <View style={s.progressTrack}>
                <Animated.View style={[s.progressFill, { width: progressWidth }]} />
              </View>
              <Text style={s.loadingLabel}>ANALYSING DESTINATION</Text>
              {/* Shimmer Blocks */}
              <Animated.View style={[s.shimmerMain, { opacity: pulseAnim }]}>
                <View style={s.shimmerLine} />
                <View style={[s.shimmerLine, { width: '55%', marginTop: 10 }]} />
              </Animated.View>
              <View style={s.shimmerGrid}>
                {[0,1,2,3].map(k => (
                  <Animated.View key={k} style={[s.shimmerCard, { opacity: pulseAnim }]} />
                ))}
              </View>
              <Animated.View style={[s.shimmerRow, { opacity: pulseAnim }]}>
                {[0,1,2,3,4,5,6].map(k => (
                  <View key={k} style={s.shimmerFcCard} />
                ))}
              </Animated.View>
            </View>
          )}

          {/* Not Found */}
          {notFound && !loading && (
            <View style={s.notFoundPanel}>
              <View style={s.notFoundAccent} />
              <Text style={s.notFoundTitle}>DESTINATION NOT FOUND</Text>
              <Text style={s.notFoundBody}>
                We could not locate data for this destination. Try one of our supported cities below.
              </Text>
              <View style={s.notFoundChips}>
                {POPULAR_CHIPS.slice(0, 4).map((d, i) => (
                  <TouchableOpacity key={i} style={s.notFoundChip} onPress={() => { setQuery(d.label); handleSearch(d.label); setNotFound(false); }} activeOpacity={0.75}>
                    <Text style={s.notFoundChipText}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={s.retryBtn} onPress={handleReset} activeOpacity={0.8}>
                <Text style={s.retryText}>CLEAR & SEARCH AGAIN →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results */}
          {result && !loading && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

              {/* Destination Banner */}
              <View style={s.destBanner}>
                <View>
                  <Text style={s.destCity}>{result.weather.city}</Text>
                  <Text style={s.destCountry}>{result.weather.country.toUpperCase()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.destTZ}>{result.weather.timezone}</Text>
                  <Text style={s.destCur}>{result.weather.currency}</Text>
                </View>
              </View>
              <View style={s.goldLineDim} />

              {/* Tabs */}
              <View style={s.tabBar}>
                {(['weather', 'visa'] as const).map(tab => (
                  <TouchableOpacity key={tab} style={s.tabItem} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
                    <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
                      {tab === 'weather' ? 'WEATHER' : 'VISA INFO'}
                    </Text>
                    {activeTab === tab && <View style={s.tabUnderline} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── WEATHER ── */}
              {activeTab === 'weather' && (
                <View style={s.tabContent}>

                  {/* Temp Hero */}
                  <View style={s.tempHero}>
                    <View style={s.tempLeft}>
                      <Text style={s.tempVal}>{result.weather.temp}°</Text>
                      <Text style={s.tempUnit}>CELSIUS</Text>
                      <View style={s.tempDivider} />
                      <Text style={s.tempCond}>{result.weather.condition}</Text>
                      <Text style={s.tempFeels}>Feels like {result.weather.feelsLike}°C</Text>
                    </View>
                    <View style={s.tempRight}>
                      <StatBlock label="HUMIDITY" value={`${result.weather.humidity}%`} />
                      <View style={s.statDivLine} />
                      <StatBlock label="WIND SPEED" value={`${result.weather.windSpeed} km/h`} />
                      <View style={s.statDivLine} />
                      <StatBlock label="UV INDEX" value={`${result.weather.uvIndex} · ${uvLabel(result.weather.uvIndex)}`} accent />
                      <View style={s.statDivLine} />
                      <StatBlock label="VISIBILITY" value={`${result.weather.visibility} km`} />
                    </View>
                  </View>

                  {/* AQI + Sun */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={[s.miniCard, { flex: 1 }]}>
                      <Text style={s.miniCardLabel}>AIR QUALITY</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[s.aqiDot, { backgroundColor: aqiColor(result.weather.airQuality) }]} />
                        <Text style={[s.aqiVal, { color: aqiColor(result.weather.airQuality) }]}>{result.weather.airQuality}</Text>
                      </View>
                    </View>
                    <View style={[s.miniCard, { flex: 1 }]}>
                      <Text style={s.miniCardLabel}>SUN SCHEDULE</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={s.sunLabel}>RISE</Text>
                          <Text style={s.sunTime}>{result.weather.sunrise}</Text>
                        </View>
                        <View style={{ width: 1, height: 28, backgroundColor: '#C9A84C14' }} />
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={s.sunLabel}>SET</Text>
                          <Text style={s.sunTime}>{result.weather.sunset}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 7-Day Forecast */}
                  <Text style={s.sectionTag}>— 7-DAY FORECAST</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                    {result.weather.forecast.map((f, i) => (
                      <View key={i} style={[s.fcCard, i === 0 && s.fcCardActive]}>
                        {i === 0 && <View style={s.fcActiveBar} />}
                        <Text style={[s.fcDay, i === 0 && { color: GOLD }]}>{f.day}</Text>
                        <Text style={[s.fcHigh, i === 0 && { color: GOLD }]}>{f.high}°</Text>
                        <Text style={s.fcLow}>{f.low}°</Text>
                        <Text style={s.fcCond} numberOfLines={2}>{f.condition}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Travel Info */}
                  <Text style={s.sectionTag}>— TRAVEL ESSENTIALS</Text>
                  <View style={s.travelCard}>
                    <TipRow label="BEST TIME TO VISIT" value={result.weather.bestTimeToVisit} />
                    <TipRow label="LOCAL CURRENCY" value={result.weather.currency} />
                    <TipRow label="TIME ZONE" value={result.weather.timezone} />
                  </View>
                </View>
              )}

              {/* ── VISA ── */}
              {activeTab === 'visa' && (
                <View style={s.tabContent}>

                  {/* Visa Status */}
                  <View style={[s.visaStatus, { borderColor: result.visa.required ? GOLD : '#4CAF50' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <View style={[s.visaStatusDot, { backgroundColor: result.visa.required ? GOLD : '#4CAF50' }]} />
                      <View>
                        <Text style={s.visaStatusTitle}>
                          {result.visa.required ? 'VISA REQUIRED' : 'VISA-FREE ACCESS'}
                        </Text>
                        <Text style={s.visaStatusSub}>Pakistani Passport Holders</Text>
                      </View>
                    </View>
                    <View style={[s.visaTypePill, { borderColor: result.visa.required ? GOLD : '#4CAF50' }]}>
                      <Text style={[s.visaTypePillText, { color: result.visa.required ? GOLD : '#4CAF50' }]}>
                        {result.visa.type}
                      </Text>
                    </View>
                  </View>

                  {/* Visa Stats Grid */}
                  <View style={s.visaGrid}>
                    <VisaCard label="DURATION" value={result.visa.duration} />
                    <VisaCard label="COST" value={result.visa.cost} />
                    <VisaCard label="PROCESSING TIME" value={result.visa.processingTime} />
                    <VisaCard label="ENTRY TYPE" value={result.visa.entryType} />
                  </View>

                  {/* Requirements */}
                  <Text style={s.sectionTag}>— REQUIRED DOCUMENTS</Text>
                  <View style={s.reqCard}>
                    {result.visa.requirements.map((req, i) => (
                      <View key={i} style={s.reqRow}>
                        <Text style={s.reqIndex}>{String(i + 1).padStart(2, '0')}</Text>
                        <Text style={s.reqText}>{req}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Notes */}
                  <View style={s.notesCard}>
                    <Text style={s.notesTag}>— IMPORTANT NOTES</Text>
                    <Text style={s.notesBody}>{result.visa.notes}</Text>
                  </View>

                  {/* Apply */}
                  {result.visa.required && (
                    <View style={s.applyCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.applyLabel}>OFFICIAL APPLICATION PORTAL</Text>
                        <Text style={s.applyUrl} numberOfLines={1}>{result.visa.applyUrl}</Text>
                      </View>
                      <Text style={s.applyArrow}>→</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Reset */}
              <TouchableOpacity style={s.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                <Text style={s.resetText}>← SEARCH ANOTHER DESTINATION</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 24, paddingBottom: 18 },
  backBtn: { width: 38, height: 38, borderWidth: 1, borderColor: '#C9A84C33', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  backArrow: { color: GOLD, fontSize: 18 },
  headerTitle: { color: WHITE, fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  headerSub: { color: GOLD, fontSize: 8, letterSpacing: 4, marginTop: 3 },
  headerAccentWrap: { alignItems: 'flex-end' },
  headerAccentLine: { width: 20, height: 1, backgroundColor: GOLD, opacity: 0.5 },
  goldLineHard: { height: 1, backgroundColor: GOLD, marginHorizontal: 24, opacity: 0.4 },
  goldLineDim: { height: 1, backgroundColor: GOLD, marginHorizontal: 24, opacity: 0.1 },

  searchWrap: { paddingHorizontal: 24, paddingTop: 22, flexDirection: 'row', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C33', backgroundColor: CARD_BG, paddingHorizontal: 14 },
  searchPulse: { width: 4, height: 14, backgroundColor: GOLD, marginRight: 12, opacity: 0.7 },
  searchInput: { flex: 1, color: WHITE, fontSize: 13, paddingVertical: 14, letterSpacing: 0.5 },
  clearBtn: { padding: 6 },
  clearText: { color: GREY, fontSize: 11 },
  searchBtn: { backgroundColor: GOLD, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: BG, fontSize: 9, fontWeight: '800', letterSpacing: 2 },

  sectionTag: { fontSize: 9, letterSpacing: 4, color: GOLD, paddingHorizontal: 24, marginTop: 24, marginBottom: 14 },

  chipsRow: { paddingHorizontal: 24, gap: 8 },
  chip: { borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, paddingHorizontal: 16, paddingVertical: 11 },
  chipCity: { color: WHITE, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },

  introPanel: { marginHorizontal: 24, marginTop: 24, borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 24 },
  introPanelTopBar: { width: 28, height: 2, backgroundColor: GOLD, marginBottom: 18 },
  introEyebrow: { fontSize: 8, letterSpacing: 4, color: GOLD, marginBottom: 10 },
  introTitle: { fontSize: 22, fontWeight: '200', color: WHITE, lineHeight: 32, marginBottom: 14 },
  introBody: { fontSize: 11, color: GREY, lineHeight: 19, letterSpacing: 0.3, marginBottom: 22 },
  introFeatureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  introFeature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  introFeatureDot: { width: 4, height: 4, backgroundColor: GOLD },
  introFeatureText: { color: GREY, fontSize: 9, letterSpacing: 1.5 },

  // Loading
  loadingWrap: { padding: 24 },
  progressTrack: { height: 2, backgroundColor: '#C9A84C14', marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: 2, backgroundColor: GOLD },
  loadingLabel: { color: GOLD, fontSize: 9, letterSpacing: 4, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  shimmerMain: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: '#C9A84C14', padding: 24, marginBottom: 10 },
  shimmerLine: { height: 10, backgroundColor: '#1A1A2E', borderRadius: 2, width: '75%' },
  shimmerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  shimmerCard: { width: (width - 64) / 2, height: 70, backgroundColor: CARD_BG, borderWidth: 1, borderColor: '#C9A84C14' },
  shimmerRow: { flexDirection: 'row', gap: 8 },
  shimmerFcCard: { width: 70, height: 100, backgroundColor: CARD_BG, borderWidth: 1, borderColor: '#C9A84C14' },

  // Not Found
  notFoundPanel: { margin: 24, borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, padding: 24 },
  notFoundAccent: { width: 24, height: 2, backgroundColor: GOLD, marginBottom: 16 },
  notFoundTitle: { color: GOLD, fontSize: 11, letterSpacing: 3, fontWeight: '700', marginBottom: 10 },
  notFoundBody: { color: GREY, fontSize: 12, lineHeight: 20, marginBottom: 20 },
  notFoundChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  notFoundChip: { borderWidth: 1, borderColor: '#C9A84C33', paddingHorizontal: 14, paddingVertical: 9 },
  notFoundChipText: { color: WHITE, fontSize: 11, letterSpacing: 1.5 },
  retryBtn: { borderWidth: 1, borderColor: GOLD, paddingVertical: 13, alignItems: 'center' },
  retryText: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3 },

  // Results
  destBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 22, paddingBottom: 18 },
  destCity: { fontSize: 30, fontWeight: '200', color: WHITE, letterSpacing: 1 },
  destCountry: { fontSize: 9, letterSpacing: 3, color: GOLD, marginTop: 4 },
  destTZ: { color: WHITE, fontSize: 11, letterSpacing: 0.5, fontWeight: '500', textAlign: 'right' },
  destCur: { color: GREY, fontSize: 9, letterSpacing: 1, marginTop: 4 },

  tabBar: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#C9A84C14' },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: 'center', position: 'relative' },
  tabLabel: { fontSize: 10, letterSpacing: 3, color: GREY, fontWeight: '700' },
  tabLabelActive: { color: WHITE },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: GOLD },

  tabContent: { paddingHorizontal: 24, paddingTop: 20 },

  // Temp Hero
  tempHero: { flexDirection: 'row', borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, marginBottom: 8 },
  tempLeft: { flex: 1, padding: 20, borderRightWidth: 1, borderRightColor: '#C9A84C0D', justifyContent: 'center' },
  tempVal: { fontSize: 66, fontWeight: '100', color: WHITE, letterSpacing: -3, lineHeight: 72 },
  tempUnit: { fontSize: 8, letterSpacing: 3, color: GOLD, marginTop: 4 },
  tempDivider: { width: 24, height: 1, backgroundColor: GOLD, opacity: 0.4, marginVertical: 14 },
  tempCond: { fontSize: 12, color: WHITE, letterSpacing: 1, fontWeight: '500', marginBottom: 4 },
  tempFeels: { fontSize: 10, color: GREY, letterSpacing: 0.5 },
  tempRight: { flex: 1 },
  statDivLine: { height: 1, backgroundColor: '#C9A84C0D', marginHorizontal: 12 },

  miniCard: { borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, padding: 16 },
  miniCardLabel: { fontSize: 8, letterSpacing: 3, color: GREY, fontWeight: '700', marginBottom: 12 },
  aqiDot: { width: 8, height: 8 },
  aqiVal: { fontSize: 13, fontWeight: '700' },
  sunLabel: { fontSize: 8, letterSpacing: 2, color: GREY, fontWeight: '700', marginBottom: 6 },
  sunTime: { fontSize: 15, color: WHITE, fontWeight: '500', letterSpacing: 1 },

  fcCard: { width: 76, borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 12, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  fcCardActive: { borderColor: GOLD },
  fcActiveBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  fcDay: { fontSize: 8, letterSpacing: 2, color: GREY, fontWeight: '700', marginBottom: 10 },
  fcHigh: { fontSize: 16, color: WHITE, fontWeight: '600', textAlign: 'center' },
  fcLow: { fontSize: 11, color: GREY, textAlign: 'center', marginTop: 2, marginBottom: 6 },
  fcCond: { fontSize: 8, color: GREY, textAlign: 'center', lineHeight: 12 },

  travelCard: { borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, paddingHorizontal: 16, paddingTop: 4 },

  // Visa
  visaStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, backgroundColor: CARD_BG, padding: 18, marginBottom: 10 },
  visaStatusDot: { width: 10, height: 10 },
  visaStatusTitle: { color: WHITE, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  visaStatusSub: { color: GREY, fontSize: 9, letterSpacing: 1.5, marginTop: 3 },
  visaTypePill: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  visaTypePillText: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  visaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },

  reqCard: { borderWidth: 1, borderColor: '#C9A84C1A', backgroundColor: CARD_BG, padding: 16, marginBottom: 10 },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#C9A84C0A' },
  reqIndex: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1, opacity: 0.7, width: 28, marginRight: 12 },
  reqText: { flex: 1, color: WHITE, fontSize: 12, letterSpacing: 0.3, lineHeight: 20 },

  notesCard: { borderWidth: 1, borderColor: '#C9A84C22', borderLeftWidth: 3, borderLeftColor: GOLD, backgroundColor: CARD_BG, padding: 18, marginBottom: 10 },
  notesTag: { fontSize: 8, letterSpacing: 4, color: GOLD, marginBottom: 10 },
  notesBody: { color: WHITE, fontSize: 12, lineHeight: 22, letterSpacing: 0.3 },

  applyCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C22', backgroundColor: CARD_BG, padding: 16, marginBottom: 10 },
  applyLabel: { fontSize: 8, letterSpacing: 2, color: GREY, marginBottom: 4 },
  applyUrl: { color: GOLD, fontSize: 11, letterSpacing: 0.3 },
  applyArrow: { color: GOLD, fontSize: 18, marginLeft: 12 },

  resetBtn: { marginHorizontal: 24, marginTop: 24, paddingVertical: 14, borderWidth: 1, borderColor: '#C9A84C22', alignItems: 'center' },
  resetText: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
});