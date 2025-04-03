import { useAuthStore } from '../store/useAuthStore';

/**
 * Custom error class for authorization issues
 */
export class ForbiddenError extends Error {
  status: number;
  endpoint: string;
  userRole: string;
  
  constructor(message: string, endpoint: string, userRole: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
    this.endpoint = endpoint;
    this.userRole = userRole;
  }
}

// We'll consistently use /api prefix for all endpoints
const API_URL = '/api';

/**
 * Creates API request headers with Authentication if a user is logged in
 * Supports both JWT Bearer tokens and Basic Auth tokens
 */
export const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Get token from the auth store
  const authStore = useAuthStore.getState();
  const token = authStore.token;
  
  // Add authorization header if token is available
  if (token) {
    // Check if it's a JWT token (they typically have 2 dots for the 3 segments)
    if (token.includes('.') && token.split('.').length === 3) {
      // It's a JWT token, use Bearer format
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Assume it's a Basic Auth token (base64 encoded)
      headers['Authorization'] = `Basic ${token}`;
    }
  }
  
  return headers;
};

/**
 * Generic API client with error handling
 */
class ApiClient {
  /**
   * Checks if the current user is authorized to access a specific endpoint
   * Admins can access everything, agencies can only access route endpoints
   */
  private static checkAuthorization(endpoint: string): boolean {
    const authStore = useAuthStore.getState();
    const user = authStore.user;
    const hasToken = !!authStore.token;
    
    // First check if we have proper authentication
    if (!hasToken || !user) {
      return false;
    }
    
    // Get the user role and normalize it to lowercase for consistent comparison
    const role = user.role?.toLowerCase() || '';
    
    // Admin users can access everything
    if (role === 'admin') {
      return true;
    }
    
    // Agency users can access routes endpoints and have read-only access to locations
    if (role === 'agency') {
      // Check if the endpoint is related to routes (full access)
      if (endpoint.includes('/routes')) {
        return true;
      }
      
      // Agency users always have access to locations (read-only)
      if (endpoint.includes('/locations')) {
        return true;
      }
      
      // Agency users are not allowed to access other endpoints
      return false;
    }
    
    // If we have authentication but role is not recognized, allow minimal access
    if (hasToken) {
      // Allow access to routes and locations for any authenticated user
      if (endpoint.includes('/routes') || endpoint.includes('/locations')) {
        return true;
      }
    }
    
    // No known role or not authenticated, no access
    return false;
  }
  
  static async get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      // Ensure we're only using /api prefix endpoints
      // Remove any leading /api if it's already in the endpoint to avoid duplicates
      const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
      // Make sure the endpoint starts with a slash
      const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
      
      // Check if the current user is authorized to access this endpoint
      if (!this.checkAuthorization(normalizedEndpoint)) {
        const authStore = useAuthStore.getState();
        const userRole = authStore.user?.role?.toLowerCase() || 'unknown';
        
        // Provide a more specific error message for agency users
        if (userRole === 'agency') {
          if (normalizedEndpoint.includes('/locations')) {
            // Agency users have read-only access to locations
            // This case should not occur with our updated permission system
            throw new ForbiddenError(
              `Note: Agency users have read-only access to location data`, 
              normalizedEndpoint,
              userRole
            );
          }
        }
        
        throw new ForbiddenError(
          `Forbidden: ${userRole} users do not have permission to access ${normalizedEndpoint}`, 
          normalizedEndpoint,
          userRole
        );
      }
      // Construct the full URL
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_URL}${normalizedEndpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 403 responses specially
        if (response.status === 403) {
          const authStore = useAuthStore.getState();
          const userRole = authStore.user?.role?.toLowerCase() || 'unknown';
          throw new ForbiddenError(
            `Server rejected access: ${userRole} users are not authorized for this operation`,
            normalizedEndpoint,
            userRole
          );
        }
        
        throw new Error(`API error ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Clone the response for processing
      const responseClone = response.clone();
      const rawText = await responseClone.text();
      
      if (!rawText || rawText.trim() === '') {
        return {} as T; // Return empty object for empty responses
      }
      
      // Try to parse the JSON
      try {
        // Parse to ensure it's valid JSON, but use raw text for newResponse
        JSON.parse(rawText);
        
        // Create a new response from the raw text
        const newResponse = new Response(rawText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        return this.handleResponse<T>(newResponse);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      throw error;
    }
  }
  
  // No longer needed as we've removed console logging
  
  static async post<T>(endpoint: string, data: any): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<T>(response);
  }
  
  static async put<T>(endpoint: string, data: any): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<T>(response);
  }
  
  static async delete<T>(endpoint: string): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  }
  
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(errorText || `API error: ${response.status}`);
      throw error;
    }
    
    // Handle empty responses (like successful deletes that return 204)
    if (response.status === 204) {
      return {} as T;
    }
    
    // Clone the response to ensure we can read it fully
    const clonedResponse = response.clone();
    try {
      const data = await response.json();
      
      // Helper function to determine if an object looks like our expected type
      const hasExpectedStructure = (obj: any): boolean => {
        // Check for common fields in our interfaces
        if (obj && typeof obj === 'object') {
          if ('id' in obj) return true;
          if ('name' in obj) return true;
          if ('locationCode' in obj) return true;
          if ('transportationType' in obj) return true;
        }
        return false;
      };
      
      // If the data is an array, check if it matches our expected format directly
      if (Array.isArray(data)) {
        return data as T;
      }
      
      // Check for common response wrapper patterns
      if (data && typeof data === 'object') {
        // Check if this is a singleton object that matches our type
        if (hasExpectedStructure(data)) {
          // If T is expected to be an array but we got a single item
          if (Array.isArray({} as T)) {
            return [data] as unknown as T;
          }
          return data as T;
        }
        
        // Check various common wrapper patterns
        const wrapperProps = ['data', 'results', 'items', 'locations', 'transportations', 'content'];
        
        for (const prop of wrapperProps) {
          if (prop in data) {
            const unwrappedData = data[prop];
            
            // Validate the unwrapped data
            if (Array.isArray(unwrappedData)) {
              // For empty arrays, return as is
              if (unwrappedData.length === 0) {
                return unwrappedData as T;
              }
              
              // For non-empty arrays, check first item structure
              if (hasExpectedStructure(unwrappedData[0])) {
                return unwrappedData as T;
              }
            } else if (hasExpectedStructure(unwrappedData)) {
              // If we got a single object but expected an array
              if (Array.isArray({} as T)) {
                return [unwrappedData] as unknown as T;
              }
              return unwrappedData as T;
            }
          }
        }
        
        // Check for pagination pattern with 'content' property
        if ('content' in data && Array.isArray(data.content)) {
          return data.content as T;
        }
      }
      
      // If we couldn't find a known structure but we have data, return it as is
      return data as T;
    } catch (error) {
      // If JSON parsing fails, try to get the text response
      try {
        const textResponse = await clonedResponse.text();
        if (textResponse.trim() !== '') {
          try {
            // Try parsing again, just in case
            return JSON.parse(textResponse) as T;
          } catch {
            // Ignore parsing errors here
          }
        }
      } catch (textError) {
      }
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ApiClient;
