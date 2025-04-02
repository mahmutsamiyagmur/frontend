export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Transportation {
  id: string;
  name: string;
  type: 'bus' | 'train' | 'plane';
  capacity: number;
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  transportation: Transportation;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface User {
  id: string;
  role: 'admin' | 'user';
}