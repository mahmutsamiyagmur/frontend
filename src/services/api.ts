import { Location, Transportation, Route, User } from '../types';
import ApiClient from './apiClient';

// Locations API
export const getLocations = async (): Promise<Location[]> => {
  return ApiClient.get<Location[]>('/api/locations');
};

export const getLocationById = async (id: number): Promise<Location> => {
  return ApiClient.get<Location>(`/api/locations/${id}`);
};

export const getLocationByCode = async (code: string): Promise<Location> => {
  return ApiClient.get<Location>(`/api/locations/code/${code}`);
};

export const createLocation = async (location: Omit<Location, 'id'>): Promise<Location> => {
  return ApiClient.post<Location>('/api/locations', location);
};

export const updateLocation = async (id: number, location: Omit<Location, 'id'>): Promise<Location> => {
  return ApiClient.put<Location>(`/api/locations/${id}`, location);
};

export const deleteLocation = async (id: number): Promise<void> => {
  return ApiClient.delete<void>(`/api/locations/${id}`);
};

// Transportations API
export const getTransportations = async (): Promise<Transportation[]> => {
  return ApiClient.get<Transportation[]>('/api/transportations');
};

export const getTransportationById = async (id: number): Promise<Transportation> => {
  return ApiClient.get<Transportation>(`/api/transportations/${id}`);
};

export const searchTransportations = async (originCode: string, destinationCode: string): Promise<Transportation[]> => {
  return ApiClient.get<Transportation[]>('/api/transportations/search', { 
    originCode,
    destinationCode
  });
};

export const getTransportationsByOriginAndDate = async (originCode: string, date: string): Promise<Transportation[]> => {
  return ApiClient.get<Transportation[]>('/api/transportations/origin', {
    originCode,
    date
  });
};

export const createTransportation = async (transportation: Omit<Transportation, 'id'>): Promise<Transportation> => {
  return ApiClient.post<Transportation>('/api/transportations', transportation);
};

export const updateTransportation = async (id: number, transportation: Omit<Transportation, 'id'>): Promise<Transportation> => {
  return ApiClient.put<Transportation>(`/api/transportations/${id}`, transportation);
};

export const deleteTransportation = async (id: number): Promise<void> => {
  return ApiClient.delete<void>(`/api/transportations/${id}`);
};

// Routes API

// Legacy routes method - keeping for backward compatibility
export const getRoutes = async (params?: { originId?: number; destinationId?: number; date?: string }): Promise<Route[]> => {
  const queryParams: Record<string, string> = {};
  
  if (params?.originId) {
    queryParams['originId'] = params.originId.toString();
  }
  
  if (params?.destinationId) {
    queryParams['destinationId'] = params.destinationId.toString();
  }
  
  if (params?.date) {
    queryParams['date'] = params.date;
  }
  
  return ApiClient.get<Route[]>('/api/routes', queryParams);
};

// Search routes method with GET (using query parameters)
export const searchRoutes = async (originLocationCode: string, destinationLocationCode: string, travelDate: string): Promise<Route[]> => {
  // Using originCode and destinationCode as per the actual endpoint URL
  return ApiClient.get<Route[]>('/api/routes/search', {
    originCode: originLocationCode,
    destinationCode: destinationLocationCode,
    travelDate
  });
};

// Search routes method with POST (using request body)
export const searchRoutesPost = async (params: {
  originLocationCode: string;
  destinationLocationCode: string;
  travelDate: string;
}): Promise<Route[]> => {
  // Ensure parameters exactly match the backend RouteRequestDto
  return ApiClient.post<Route[]>('/api/routes/search', params);
};

export const getRouteById = async (id: number): Promise<Route> => {
  return ApiClient.get<Route>(`/api/routes/${id}`);
};

// Authentication API
export const getCurrentUser = async (): Promise<User> => {
  // Check if we have a user stored in localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser) as User;
  }
  
  // If no stored user, throw an error
  throw new Error('Not authenticated');
};

// Auth API
export const login = async (credentials: { username: string; password: string }): Promise<User> => {
  return ApiClient.post<User>('/api/login', credentials);
};

// Special helper methods for agency users who can't access location endpoints directly

/**
 * Get all unique locations from routes data for agency users
 * Since agencies can't access location endpoints directly, this extracts locations from routes
 */
export const getLocationsFromRoutes = async (): Promise<Location[]> => {
  try {
    // Fetch all routes first
    const routes = await getRoutes();
    
    // If no routes, return empty array
    if (routes.length === 0) {
      return [];
    }
    
    // Create a map to track unique locations by ID
    const locationMap = new Map<number, Location>();
    
    // Extract origin and destination locations from each route
    let originCount = 0;
    let destinationCount = 0;
    
    routes.forEach((route) => {
      // Check if origin exists and has expected structure
      if (route.origin && typeof route.origin === 'object' && 'id' in route.origin) {
        if (!locationMap.has(route.origin.id)) {
          locationMap.set(route.origin.id, route.origin);
          originCount++;
        }
      }
      
      // Check if destination exists and has expected structure
      if (route.destination && typeof route.destination === 'object' && 'id' in route.destination) {
        if (!locationMap.has(route.destination.id)) {
          locationMap.set(route.destination.id, route.destination);
          destinationCount++;
        }
      }
    });
    
    // Convert the map values to an array
    return Array.from(locationMap.values());
  } catch (error) {
    throw new Error(`Failed to get locations from routes: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get a specific location by ID for agency users by searching through routes
 * This is a fallback when agencies can't access location endpoints directly
 */
export const getLocationByIdForAgency = async (id: number): Promise<Location | null> => {
  const locations = await getLocationsFromRoutes();
  return locations.find(location => location.id === id) || null;
};

/**
 * Get a specific location by code for agency users by searching through routes
 * This is a fallback when agencies can't access location endpoints directly
 */
export const getLocationByCodeForAgency = async (code: string): Promise<Location | null> => {
  const locations = await getLocationsFromRoutes();
  return locations.find(location => location.locationCode === code) || null;
};
