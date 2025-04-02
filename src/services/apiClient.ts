import { useAuthStore } from '../store/useAuthStore';

// We'll consistently use /api prefix for all endpoints
const API_URL = '/api';

/**
 * Creates API request headers with authentication if a user is logged in
 */
export const getHeaders = (): HeadersInit => {
  const user = useAuthStore.getState().user;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  if (user?.id) {
    headers['Authorization'] = `Bearer ${user.id}`;
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
    const user = useAuthStore.getState().user;
    
    // Admins can access everything
    if (user?.role === 'admin') {
      return true;
    }
    
    // Agency users can only access route endpoints
    if (user?.role === 'agency') {
      // Check if the endpoint is for routes
      return endpoint.includes('/routes') || endpoint.includes('routes/');
    }
    
    // If there's no user or role is unknown, default to no access
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
        console.error(`Authorization failed: User doesn't have permission to access ${normalizedEndpoint}`);
        throw new Error('Forbidden: You do not have permission to access this resource');
      }
      // Construct the full URL
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_URL}${normalizedEndpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      console.log(`Making GET request to: ${url}`);
      
      // Add timing information for debugging
      const startTime = performance.now();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      const endTime = performance.now();
      console.log(`GET ${url} took ${(endTime - startTime).toFixed(2)}ms - Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Clone the response for logging and further processing
      const responseClone = response.clone();
      const rawText = await responseClone.text();
      
      if (!rawText || rawText.trim() === '') {
        console.log(`Empty response received from ${url}`);
        return {} as T; // Return empty object for empty responses
      }
      
      // Try to parse the JSON
      try {
        console.log(`Raw response from ${url} (first 200 chars):`, 
          rawText.length > 200 ? rawText.substring(0, 200) + '...' : rawText);
        
        const data = JSON.parse(rawText);
        
        // For debugging, log a summarized version of the data
        if (Array.isArray(data)) {
          console.log(`Received array with ${data.length} items from ${url}`);
          if (data.length > 0) {
            console.log('First item sample:', this.summarizeObject(data[0]));
          }
        } else if (data && typeof data === 'object') {
          console.log('Received object response:', this.summarizeObject(data));
        }
        
        // Create a new response from the raw text
        const newResponse = new Response(rawText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        return this.handleResponse<T>(newResponse);
      } catch (parseError) {
        console.error(`JSON parse error from ${url}:`, parseError);
        console.error('Response that failed to parse:', rawText);
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Helper method to create a summarized version of an object for logging
  private static summarizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // For arrays, summarize the length and first item
    if (Array.isArray(obj)) {
      return `Array with ${obj.length} items${obj.length > 0 ? ': ' + JSON.stringify(obj[0]).substring(0, 100) : ''}`;
    }
    
    // For objects, create a summary with keys and truncated values
    const summary: Record<string, any> = {};
    for (const key of Object.keys(obj).slice(0, 5)) { // Limit to first 5 keys
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        summary[key] = Array.isArray(value) ? `Array(${value.length})` : 'Object';
      } else {
        const stringValue = String(value);
        summary[key] = stringValue.length > 40 ? stringValue.substring(0, 40) + '...' : stringValue;
      }
    }
    
    // Indicate if we truncated keys
    if (Object.keys(obj).length > 5) {
      summary['...'] = `${Object.keys(obj).length - 5} more keys`;
    }
    
    return summary;
  }
  
  static async post<T>(endpoint: string, data: any): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      console.error(`Authorization failed: User doesn't have permission to access ${normalizedEndpoint}`);
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    console.log(`Making POST request to: ${API_URL}${normalizedEndpoint}`);
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    console.log(`POST response status:`, response.status, response.statusText);
    return this.handleResponse<T>(response);
  }
  
  static async put<T>(endpoint: string, data: any): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      console.error(`Authorization failed: User doesn't have permission to access ${normalizedEndpoint}`);
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    console.log(`Making PUT request to: ${API_URL}${normalizedEndpoint}`);
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    console.log(`PUT response status:`, response.status, response.statusText);
    return this.handleResponse<T>(response);
  }
  
  static async delete<T>(endpoint: string): Promise<T> {
    // Ensure we're only using /api prefix endpoints
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    
    // Check if the current user is authorized to access this endpoint
    if (!this.checkAuthorization(normalizedEndpoint)) {
      console.error(`Authorization failed: User doesn't have permission to access ${normalizedEndpoint}`);
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    console.log(`Making DELETE request to: ${API_URL}${normalizedEndpoint}`);
    
    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    console.log(`DELETE response status:`, response.status, response.statusText);
    return this.handleResponse<T>(response);
  }
  
  private static async handleResponse<T>(response: Response): Promise<T> {
    // For debugging
    console.log(`API Response: ${response.url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers]),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
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
      console.log('API Response Data:', data);
      
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
        console.log('Received array data directly');
        return data as T;
      }
      
      // Check for common response wrapper patterns
      if (data && typeof data === 'object') {
        // Check if this is a singleton object that matches our type
        if (hasExpectedStructure(data)) {
          console.log('Received single object, converting to array');
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
            console.log(`Extracting ${prop} from response wrapper:`, unwrappedData);
            
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
          console.log('Extracting paginated content:', data.content);
          return data.content as T;
        }
      }
      
      // If we couldn't find a known structure but we have data, return it as is
      console.log('Using response data as-is');
      return data as T;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      // If JSON parsing fails, try to get the text response
      try {
        const textResponse = await clonedResponse.text();
        console.log('Raw text response:', textResponse);
        if (textResponse.trim() !== '') {
          try {
            // Try parsing again, just in case
            return JSON.parse(textResponse) as T;
          } catch {
            // Ignore parsing errors here
          }
        }
      } catch (textError) {
        console.error('Error getting text response:', textError);
      }
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ApiClient;
