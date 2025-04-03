export interface Location {
  id: number;
  name: string;
  country: string;
  city: string;
  locationCode: string;
}

export interface Transportation {
  id: number;
  originLocationId: number;
  originLocationCode: string;
  destinationLocationId: number;
  destinationLocationCode: string;
  transportationType: 'UBER' | 'BUS' | 'FLIGHT' | 'SUBWAY';
  operatingDays: number[];
}

export interface Route {
  id: number;
  origin: Location;
  destination: Location;
  transportation: Transportation;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface User {
  id: number;
  role: 'admin' | 'agency' | 'ADMIN' | 'AGENCY'; // Support both case formats
  name?: string;
  username?: string;
  token?: string;
}