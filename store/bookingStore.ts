import { create } from 'zustand';

export interface FlightResult {
  id: string; airline: string; airlineCode: string; logo: string;
  flightNumber: string; departure: string; arrival: string; duration: string;
  stops: number; stopInfo?: string; price: number; originalPrice?: number;
  cabin: string; seatsLeft?: number; amenities: string[];
  baggage: string; refundable: boolean; tag?: string;
}

export interface Hotel {
  id: string; name: string; brand: string; stars: number; category: string;
  area: string; city: string; price: number; originalPrice?: number;
  rating: number; reviews: number; image: string; amenities: string[];
  tag?: string; distanceKm: string; refundable: boolean; breakfastIncluded: boolean;
}

export interface Restaurant {
  id: string; name: string; cuisine: string; area: string; city: string;
  rating: number; reviews: number; priceRange: string; deliveryTime: string;
  image: string; tag?: string; isOpen: boolean; distance: string;
  discount?: string; featured?: boolean;
}

export interface FlightSearchParams {
  from: string; to: string; fromCode: string; toCode: string;
  date: string; returnDate?: string; passengers: number;
  cabin: string; tripType: 'oneWay' | 'roundTrip';
}

export interface HotelSearchParams {
  city: string; checkIn: string; checkOut: string;
  guests: number; rooms: number;
}

interface BookingState {
  flightParams: FlightSearchParams | null;
  selectedFlight: FlightResult | null;
  hotelParams: HotelSearchParams | null;
  selectedHotel: Hotel | null;
  selectedRestaurant: Restaurant | null;
  setFlightParams: (p: FlightSearchParams) => void;
  setSelectedFlight: (f: FlightResult) => void;
  setHotelParams: (p: HotelSearchParams) => void;
  setSelectedHotel: (h: Hotel) => void;
  setSelectedRestaurant: (r: Restaurant) => void;
  clearBookings: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  flightParams: null,
  selectedFlight: null,
  hotelParams: null,
  selectedHotel: null,
  selectedRestaurant: null,
  setFlightParams: (p) => set({ flightParams: p }),
  setSelectedFlight: (f) => set({ selectedFlight: f }),
  setHotelParams: (p) => set({ hotelParams: p }),
  setSelectedHotel: (h) => set({ selectedHotel: h }),
  setSelectedRestaurant: (r) => set({ selectedRestaurant: r }),
  clearBookings: () => set({
    flightParams: null, selectedFlight: null,
    hotelParams: null, selectedHotel: null, selectedRestaurant: null,
  }),
}));
