import { create } from 'zustand';
import { User } from '../types';
import { authenticateUser, getCurrentUser as getStoredUser, logoutUser } from '../services/users';

interface AuthState {
  user: User | null;
  token: string | null; // JWT token
  username: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null, token?: string | null, username?: string | null, role?: string | null) => void;
  fetchUser: () => void;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  getToken: () => string | null;
}

// Initialize state with user from our service
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: null, // Initialize with no token
  username: null, // Initialize with no username
  role: null, // Initialize with no role
  loading: false,
  error: null,
  isLoggedIn: !!initialUser,
  setUser: (user: User | null, token: string | null = null, username: string | null = null, role: string | null = null) => 
    set({ user, token, username, role }),
  fetchUser: () => {
    // This is now synchronous since we're just checking localStorage
    const user = getStoredUser();
    set({ user, isLoggedIn: !!user, loading: false });
  },
  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      // Use the authenticateUser function from our users service
      const user = await authenticateUser(username, password);
      
      // Update state with the authenticated user, token, username and role
      // Note: user object will now contain token, username and role from the login response
      set({ 
        user, 
        token: user.token, 
        username: user.username, 
        role: user.role, 
        loading: false, 
        isLoggedIn: true, 
        error: null 
      });
      return user;
    } catch (error: any) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false,
        isLoggedIn: false
      });
      throw error;
    }
  },
  logout: () => {
    // Use the logoutUser function from our users service
    logoutUser();
    set({ user: null, token: null, username: null, role: null, isLoggedIn: false });
    
    // Navigate to the home page or reload to ensure the UI updates
    window.location.href = '/login';
  },
  
  // Helper function to get the JWT token for authentication
  getToken: () => get().token
}));