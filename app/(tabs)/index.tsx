import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
 
import AiTripPlannerScreen from '../AiTripPlannerScreen';
import CabBookingScreen from '../CabBookingScreen';
import CorporateDashboardScreen from '../CorporateDashboardScreen';
import FlightBookingScreen from '../FlightBookingScreen';
import FlightResultsScreen from '../FlightResultsScreen';
import FlightSearchScreen, { FlightSearchParams } from '../FlightSearchScreen';
import GroupTripPlannerScreen from '../GroupTripPlannerScreen';
import HKRewardsScreen from '../HKRewardsScreen';
import HomeScreen from '../HomeScreen';
import HotelDetailScreen from '../HotelDetailScreen';
import HotelResultsScreen from '../HotelResultsScreen';
import HotelSearchScreen, { HotelSearchParams } from '../HotelSearchScreen';
import LoginScreen from '../LoginScreen';
import MyProfileScreen from '../MyProfileScreen';
import OnboardingScreen from '../OnboardingScreen';
import RestaurantBrowseScreen from '../RestaurantBrowseScreen';
import RestaurantDetailScreen from '../RestaurantDetailScreen';
import SignupScreen from '../SignupScreen';
import SOSEmergencyScreen from '../SOSEmergencyScreen';
import SplashScreen from '../SplashScreen';
import TableReservationScreen from '../TableReservationScreen';
import ToursExperiencesScreen from '../ToursExperiencesScreen';
import WeatherVisaScreen from '../WeatherVisaScreen';
 
type ScreenType =
  | 'splash' | 'onboarding' | 'login' | 'signup' | 'home'
  | 'flightSearch' | 'flightResults' | 'flightBooking'
  | 'hotelSearch' | 'hotelResults' | 'hotelDetail'
  | 'restaurantBrowse' | 'restaurantDetail' | 'tableReservation'
  | 'cabBooking' | 'toursExperiences' | 'aiTripPlanner'
  | 'weatherVisa' | 'sosEmergency' | 'corporateDashboard'
  | 'groupTripPlanner' | 'hkRewards' | 'myProfile';
 
export interface UserData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
 
interface FlightResult {
  id: string; airline: string; airlineCode: string; logo: string;
  flightNumber: string; departure: string; arrival: string; duration: string;
  stops: number; stopInfo?: string; price: number; originalPrice?: number;
  cabin: string; seatsLeft?: number; amenities: string[];
  baggage: string; refundable: boolean; tag?: string;
}
 
interface Hotel {
  id: string; name: string; brand: string; stars: number; category: string;
  area: string; city: string; price: number; originalPrice?: number;
  rating: number; reviews: number; image: string; amenities: string[];
  tag?: string; distanceKm: string; refundable: boolean; breakfastIncluded: boolean;
}
 
interface Restaurant {
  id: string; name: string; cuisine: string; area: string; city: string;
  rating: number; reviews: number; priceRange: string; deliveryTime: string;
  image: string; tag?: string; isOpen: boolean; distance: string;
  discount?: string; featured?: boolean;
}
 
const STORAGE_KEY = 'LUXORA_USER';
 
// Global in-memory store — instant access, no async delay
let globalRegisteredUser: UserData | null = null;
 
export default function Index() {
  const [screen, setScreen] = useState<ScreenType>('splash');
  const [user, setUser] = useState<UserData | null>(null);
  const [flightParams, setFlightParams] = useState<FlightSearchParams | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [hotelParams, setHotelParams] = useState<HotelSearchParams | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantGuests] = useState(2);
 
  // App open — check karo pehle se logged in hai ya nahi
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: UserData = JSON.parse(stored);
          globalRegisteredUser = parsed;
          setUser(parsed);
          // ✅ Pehle se logged in — seedha home
          setTimeout(() => setScreen('home'), 3000);
        } else {
          // ✅ Fresh user — onboarding
          setTimeout(() => setScreen('onboarding'), 3000);
        }
      } catch {
        setTimeout(() => setScreen('onboarding'), 3000);
      }
    };
    init();
  }, []);
 
  // ✅ SIGNUP — save karo aur LOGIN screen pe bhejo
  // Home direct nahi — user ko login karna hoga
  // Isse login flow test bhi hoga aur data bhi confirm hoga
  const handleSignup = async (userData: UserData) => {
    // Pehle global mein save — instant
    globalRegisteredUser = userData;
    // AsyncStorage mein bhi save karo
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch {}
    // ✅ LOGIN screen pe bhejo — home nahi!
    setScreen('login');
  };
 
  // ✅ LOGIN — global + AsyncStorage dono check
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const e = email.toLowerCase().trim();
    const p = password.trim();
 
    // Step 1: Global memory check — fastest
    if (globalRegisteredUser) {
      const em = globalRegisteredUser.email.toLowerCase().trim() === e;
      const pm = globalRegisteredUser.password.trim() === p;
      if (em && pm) {
        setUser(globalRegisteredUser);
        return true;
      }
    }
 
    // Step 2: AsyncStorage fallback
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved: UserData = JSON.parse(stored);
        globalRegisteredUser = saved;
        const em = saved.email.toLowerCase().trim() === e;
        const pm = saved.password.trim() === p;
        if (em && pm) {
          setUser(saved);
          return true;
        }
      }
    } catch {}
 
    return false;
  };
 
  const handleLogout = async () => {
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
    globalRegisteredUser = null;
    setUser(null);
    setScreen('login');
  };
 
  useEffect(() => {
    const backAction = () => {
      if (screen === 'myProfile') { setScreen('home'); return true; }
      if (screen === 'hkRewards') { setScreen('home'); return true; }
      if (screen === 'groupTripPlanner') { setScreen('home'); return true; }
      if (screen === 'corporateDashboard') { setScreen('home'); return true; }
      if (screen === 'sosEmergency') { setScreen('home'); return true; }
      if (screen === 'weatherVisa') { setScreen('home'); return true; }
      if (screen === 'aiTripPlanner') { setScreen('home'); return true; }
      if (screen === 'toursExperiences') { setScreen('home'); return true; }
      if (screen === 'cabBooking') { setScreen('home'); return true; }
      if (screen === 'tableReservation') { setScreen('restaurantDetail'); return true; }
      if (screen === 'restaurantDetail') { setScreen('restaurantBrowse'); return true; }
      if (screen === 'restaurantBrowse') { setScreen('home'); return true; }
      if (screen === 'flightBooking') { setScreen('flightResults'); return true; }
      if (screen === 'flightResults') { setScreen('flightSearch'); return true; }
      if (screen === 'flightSearch') { setScreen('home'); return true; }
      if (screen === 'hotelDetail') { setScreen('hotelResults'); return true; }
      if (screen === 'hotelResults') { setScreen('hotelSearch'); return true; }
      if (screen === 'hotelSearch') { setScreen('home'); return true; }
      if (screen === 'home') return true;
      if (screen === 'signup') { setScreen('login'); return true; }
      if (screen === 'login') { setScreen('onboarding'); return true; }
      if (screen === 'onboarding') { setScreen('splash'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screen]);
 
  if (screen === 'splash') return <SplashScreen />;
 
  if (screen === 'onboarding')
    return <OnboardingScreen onDone={() => setScreen('login')} />;
 
  if (screen === 'login')
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignup={() => setScreen('signup')}
        onSuccess={() => setScreen('home')}
      />
    );
 
  if (screen === 'signup')
    return (
      <SignupScreen
        onDone={handleSignup}
        onLogin={() => setScreen('login')}
      />
    );
 
  if (screen === 'home')
    return (
      <HomeScreen
        onNavigate={(dest) => {
          if (dest === 'flights') setScreen('flightSearch');
          if (dest === 'hotels') setScreen('hotelSearch');
          if (dest === 'dining') setScreen('restaurantBrowse');
          if (dest === 'transport') setScreen('cabBooking');
          if (dest === 'tours') setScreen('toursExperiences');
          if (dest === 'aiPlanner') setScreen('aiTripPlanner');
          if (dest === 'weatherVisa') setScreen('weatherVisa');
          if (dest === 'sos') setScreen('sosEmergency');
          if (dest === 'corporate') setScreen('corporateDashboard');
          if (dest === 'groupPlanner') setScreen('groupTripPlanner');
          if (dest === 'rewards') setScreen('hkRewards');
          if (dest === 'profile') setScreen('myProfile');
        }}
        userName={user?.fullName ?? 'Guest'}
      />
    );
 
  if (screen === 'flightSearch')
    return (
      <FlightSearchScreen
        onBack={() => setScreen('home')}
        onSearch={(params) => { setFlightParams(params); setScreen('flightResults'); }}
      />
    );
 
  if (screen === 'flightResults' && flightParams)
    return (
      <FlightResultsScreen
        searchParams={flightParams}
        onBack={() => setScreen('flightSearch')}
        onBook={(flight) => { setSelectedFlight(flight); setScreen('flightBooking'); }}
      />
    );
 
  if (screen === 'flightBooking' && selectedFlight && flightParams)
    return (
      <FlightBookingScreen
        flight={selectedFlight}
        searchParams={flightParams}
        onBack={() => setScreen('flightResults')}
        onConfirm={(ref) => { console.log('Booking confirmed:', ref); setScreen('home'); }}
      />
    );
 
  if (screen === 'hotelSearch')
    return (
      <HotelSearchScreen
        onBack={() => setScreen('home')}
        onSearch={(params) => { setHotelParams(params); setScreen('hotelResults'); }}
      />
    );
 
  if (screen === 'hotelResults' && hotelParams)
    return (
      <HotelResultsScreen
        searchParams={hotelParams}
        onBack={() => setScreen('hotelSearch')}
        onSelect={(hotel) => { setSelectedHotel(hotel); setScreen('hotelDetail'); }}
      />
    );
 
  if (screen === 'hotelDetail' && selectedHotel && hotelParams)
    return (
      <HotelDetailScreen
        hotel={selectedHotel}
        searchParams={hotelParams}
        onBack={() => setScreen('hotelResults')}
        onBook={(ref) => { console.log('Hotel booked:', ref); setScreen('home'); }}
      />
    );
 
  if (screen === 'restaurantBrowse')
    return (
      <RestaurantBrowseScreen
        onBack={() => setScreen('home')}
        onSelect={(restaurant) => { setSelectedRestaurant(restaurant); setScreen('restaurantDetail'); }}
      />
    );
 
  if (screen === 'restaurantDetail' && selectedRestaurant)
    return (
      <RestaurantDetailScreen
        restaurant={selectedRestaurant}
        guests={restaurantGuests}
        onBack={() => setScreen('restaurantBrowse')}
        onReserve={() => setScreen('tableReservation')}
      />
    );
 
  if (screen === 'tableReservation' && selectedRestaurant)
    return (
      <TableReservationScreen
        restaurant={selectedRestaurant}
        guests={restaurantGuests}
        onBack={() => setScreen('restaurantDetail')}
        onConfirm={(ref) => { console.log('Table reserved:', ref); setScreen('home'); }}
      />
    );
 
  if (screen === 'cabBooking')
    return (
      <CabBookingScreen
        onBack={() => setScreen('home')}
        onConfirm={(ref) => { console.log('Cab booked:', ref); setScreen('home'); }}
      />
    );
 
  if (screen === 'toursExperiences')
    return (
      <ToursExperiencesScreen
        onBack={() => setScreen('home')}
        onBook={(ref) => { console.log('Tour booked:', ref); setScreen('home'); }}
      />
    );
 
  if (screen === 'aiTripPlanner')
    return <AiTripPlannerScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'weatherVisa')
    return <WeatherVisaScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'sosEmergency')
    return <SOSEmergencyScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'corporateDashboard')
    return <CorporateDashboardScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'groupTripPlanner')
    return <GroupTripPlannerScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'hkRewards')
    return <HKRewardsScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'myProfile')
    return (
      <MyProfileScreen
        onBack={() => setScreen('home')}
        onLogout={handleLogout}
        user={user}
      />
    );
 
  return null;
}