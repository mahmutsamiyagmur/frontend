import { Location, Transportation, Route } from '../types';

export const mockLocations: Location[] = [
  { id: '1', name: 'New York', address: '123 Broadway, New York, NY 10001' },
  { id: '2', name: 'Los Angeles', address: '456 Hollywood Blvd, Los Angeles, CA 90028' },
  { id: '3', name: 'Chicago', address: '789 Michigan Ave, Chicago, IL 60601' },
  { id: '4', name: 'Miami', address: '321 Ocean Drive, Miami, FL 33139' },
  { id: '5', name: 'Las Vegas', address: '555 Las Vegas Blvd, Las Vegas, NV 89109' }
];

export const mockTransportations: Transportation[] = [
  { id: '1', name: 'Express Bus', type: 'bus', capacity: 50 },
  { id: '2', name: 'Luxury Train', type: 'train', capacity: 200 },
  { id: '3', name: 'Economy Flight', type: 'plane', capacity: 180 },
  { id: '4', name: 'Business Flight', type: 'plane', capacity: 120 },
  { id: '5', name: 'Night Bus', type: 'bus', capacity: 45 }
];

export const mockRoutes: Route[] = [
  {
    id: '1',
    origin: mockLocations[0],
    destination: mockLocations[1],
    transportation: mockTransportations[2],
    departureTime: '2024-02-25T08:00',
    arrivalTime: '2024-02-25T11:30',
    price: 299
  },
  {
    id: '2',
    origin: mockLocations[0],
    destination: mockLocations[2],
    transportation: mockTransportations[1],
    departureTime: '2024-02-25T09:15',
    arrivalTime: '2024-02-25T15:45',
    price: 189
  },
  {
    id: '3',
    origin: mockLocations[1],
    destination: mockLocations[3],
    transportation: mockTransportations[3],
    departureTime: '2024-02-25T14:30',
    arrivalTime: '2024-02-25T22:15',
    price: 459
  },
  {
    id: '4',
    origin: mockLocations[2],
    destination: mockLocations[4],
    transportation: mockTransportations[0],
    departureTime: '2024-02-25T07:00',
    arrivalTime: '2024-02-25T19:30',
    price: 149
  },
  {
    id: '5',
    origin: mockLocations[3],
    destination: mockLocations[0],
    transportation: mockTransportations[4],
    departureTime: '2024-02-25T22:00',
    arrivalTime: '2024-02-26T10:30',
    price: 179
  }
];