import { User } from '../types';

// Storage key for local storage - user data only
const USER_STORAGE_KEY = 'flight_system_user';

/**
 * Authenticate a user with username and password using the /auth/login endpoint to get a JWT token
 */
export const authenticateUser = async (username: string, password: string): Promise<User> => {
  try {
    // Make a request to the auth/login endpoint with credentials
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Authentication failed with status ${response.status}`);
    }
    
    // Carefully handle the response parsing
    let authData;
    try {
      const responseText = await response.text();
      
      // Try to parse as JSON
      try {
        authData = JSON.parse(responseText);
      } catch (parseError) {
        // If we can't parse the response as JSON but the request was successful,
        // create a basic auth data object as fallback
        authData = {
          username: username,
          role: username.toLowerCase().includes('admin') ? 'ADMIN' : 'AGENCY',
          token: btoa(`${username}:${password}`) // Use a Basic Auth token as fallback
        };
      }
    } catch (error) {
      throw new Error('Failed to read authentication response');
    }
    
    // Expected response format:
    // {
    //   "token": "eyJhbGciOiJIUzI1NiJ9...",
    //   "username": "admin",
    //   "role": "ADMIN"
    // }
    
    if (!authData.token) {
      // Create a token from the credentials as fallback
      authData.token = btoa(`${username}:${password}`);
    }
    
    // Create a normalized user object that includes the token
    const userData: User = {
      id: Math.floor(Math.random() * 1000), // Generate a random ID for this session
      name: authData.username || username,
      username: authData.username || username,
      role: authData.role?.toLowerCase() || 'agency', // Normalize role case
      token: authData.token
    };
    
    // Store the user in localStorage, but exclude sensitive data like the token
    const storageData = {
      ...userData,
      token: undefined // Don't store the token in localStorage for security
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storageData));
    
    return userData;
  } catch (error) {
    throw error;
  }
};

/**
 * Get the current user from localStorage
 * Note: This only returns basic user info, not the JWT token
 * The token is handled separately by the auth store and not stored in localStorage for security
 */
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(USER_STORAGE_KEY);
  
  if (!userData) {
    return null;
  }
  
  try {
    const user = JSON.parse(userData) as User;
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Log out the current user
 */
export const logoutUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};
