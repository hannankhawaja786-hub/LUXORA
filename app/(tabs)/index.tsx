import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import AiTripPlannerScreen from '../AiTripPlannerScreen';
import CabBookingScreen from '../CabBookingScreen';
import CorporateDashboardScreen from '../CorporateDashboardScreen';
import FlightBookingScreen from '../FlightBookingScreen';
import FlightResultsScreen from '../FlightResultsScreen';
import FlightSearchScreen from '../FlightSearchScreen';
import GroupTripPlannerScreen from '../GroupTripPlannerScreen';
import HKRewardsScreen from '../HKRewardsScreen';
import HomeScreen from '../HomeScreen';
import HotelDetailScreen from '../HotelDetailScreen';
import HotelResultsScreen from '../HotelResultsScreen';
import HotelSearchScreen from '../HotelSearchScreen';
import MyProfileScreen from '../MyProfileScreen';
import RestaurantBrowseScreen from '../RestaurantBrowseScreen';
import RestaurantDetailScreen from '../RestaurantDetailScreen';
import SOSEmergencyScreen from '../SOSEmergencyScreen';
import TableReservationScreen from '../TableReservationScreen';
import ToursExperiencesScreen from '../ToursExperiencesScreen';
import WeatherVisaScreen from '../WeatherVisaScreen';
 
type ScreenType =
  | 'home'
  | 'flightSearch' | 'flightResults' | 'flightBooking'
  | 'hotelSearch' | 'hotelResults' | 'hotelDetail'
  | 'restaurantBrowse' | 'restaurantDetail' | 'tableReservation'
  | 'cabBooking' | 'tours' | 'aiPlanner' | 'weatherVisa'
  | 'sos' | 'corporate' | 'groupPlanner' | 'rewards' | 'profile';
 
export default function Index() {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenType>('home');
  const [flightParams, setFlightParams] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [hotelParams, setHotelParams] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
 
  const { signOut, user } = useAuthStore();
 
  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };
 
  if (screen === 'home')
    return (
      <HomeScreen
        onNavigate={(dest: string) => {
          if (dest === 'flights') setScreen('flightSearch');
          else if (dest === 'hotels') setScreen('hotelSearch');
          else if (dest === 'dining') setScreen('restaurantBrowse');
          else if (dest === 'transport') setScreen('cabBooking');
          else if (dest === 'tours') setScreen('tours');
          else if (dest === 'aiPlanner') setScreen('aiPlanner');
          else if (dest === 'weatherVisa') setScreen('weatherVisa');
          else if (dest === 'sos') setScreen('sos');
          else if (dest === 'corporate') setScreen('corporate');
          else if (dest === 'groupPlanner') setScreen('groupPlanner');
          else if (dest === 'rewards') setScreen('rewards');
          else if (dest === 'profile') setScreen('profile');
          // ─── PRODUCTS — Expo Router file-based navigation ───
          else if (dest === 'products') router.push('/(tabs)/products');
        }}
        userName={user?.full_name || user?.email || ''}
      />
    );
 
  if (screen === 'flightSearch')
    return (
      <FlightSearchScreen
        onBack={() => setScreen('home')}
        onSearch={(params: any) => { setFlightParams(params); setScreen('flightResults'); }}
      />
    );
 
  if (screen === 'flightResults')
    return (
      <FlightResultsScreen
        searchParams={flightParams}
        onBack={() => setScreen('flightSearch')}
        onBook={(flight: any) => { setSelectedFlight(flight); setScreen('flightBooking'); }}
      />
    );
 
  if (screen === 'flightBooking')
    return (
      <FlightBookingScreen
        flight={selectedFlight}
        searchParams={flightParams}
        onBack={() => setScreen('flightResults')}
        onConfirm={() => setScreen('home')}
      />
    );
 
  if (screen === 'hotelSearch')
    return (
      <HotelSearchScreen
        onBack={() => setScreen('home')}
        onSearch={(params: any) => { setHotelParams(params); setScreen('hotelResults'); }}
      />
    );
 
  if (screen === 'hotelResults')
    return (
      <HotelResultsScreen
        searchParams={hotelParams}
        onBack={() => setScreen('hotelSearch')}
        onSelect={(hotel: any) => { setSelectedHotel(hotel); setScreen('hotelDetail'); }}
      />
    );
 
  if (screen === 'hotelDetail')
    return (
      <HotelDetailScreen
        hotel={selectedHotel}
        searchParams={hotelParams}
        onBack={() => setScreen('hotelResults')}
        onBook={() => setScreen('home')}
      />
    );
 
  if (screen === 'restaurantBrowse')
    return (
      <RestaurantBrowseScreen
        onBack={() => setScreen('home')}
        onSelect={(r: any) => { setSelectedRestaurant(r); setScreen('restaurantDetail'); }}
      />
    );
 
  if (screen === 'restaurantDetail')
    return (
      <RestaurantDetailScreen
        restaurant={selectedRestaurant}
        guests={1}
        onBack={() => setScreen('restaurantBrowse')}
        onReserve={() => setScreen('tableReservation')}
      />
    );
 
  if (screen === 'tableReservation')
    return (
      <TableReservationScreen
        restaurant={selectedRestaurant}
        guests={1}
        onBack={() => setScreen('restaurantDetail')}
        onConfirm={(_ref: string) => setScreen('home')}
      />
    );
 
  if (screen === 'cabBooking')
    return (
      <CabBookingScreen
        onBack={() => setScreen('home')}
        onConfirm={(_ref: string) => setScreen('home')}
      />
    );
 
  if (screen === 'tours')
    return (
      <ToursExperiencesScreen
        onBack={() => setScreen('home')}
        onBook={() => setScreen('home')}
      />
    );
 
  if (screen === 'aiPlanner')
    return <AiTripPlannerScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'weatherVisa')
    return <WeatherVisaScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'sos')
    return <SOSEmergencyScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'corporate')
    return <CorporateDashboardScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'groupPlanner')
    return <GroupTripPlannerScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'rewards')
    return <HKRewardsScreen onBack={() => setScreen('home')} />;
 
  if (screen === 'profile')
    return (
      <MyProfileScreen
        onBack={() => setScreen('home')}
        onLogout={handleLogout}
        user={user ? { fullName: user.full_name || '', email: user.email || '', phone: '' } : null}
      />
    );
 
  return null;
}
