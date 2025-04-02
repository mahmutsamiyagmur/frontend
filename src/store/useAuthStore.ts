import { create } from 'zustand';
import { User } from '../types';
import { getCurrentUser } from '../services/api';

// Define default users
interface UserCredentials {
  username: string;
  password: string;
  role: 'admin' | 'agency';
  name?: string;
}

const DEFAULT_USERS: UserCredentials[] = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    username: 'agency',
    password: 'agency123',
    role: 'agency',
    name: 'Agency User'
  }
];

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (username: string, password: string, role?: 'admin' | 'agency') => Promise<void>;
  logout: () => void;
}

// Initialize state with user from localStorage if available
const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  loading: false,
  error: null,
  isLoggedIn: !!initialUser,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false, isLoggedIn: !!user });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false 
      });
    }
  },
  login: async (username, password, role) => {
    console.log('Login attempt with:', { username, password, roleProvided: !!role });
    set({ loading: true, error: null });
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if the credentials match one of our default users
      console.log('Default users:', DEFAULT_USERS);
      console.log('Checking credentials against default users...');
      
      const matchedUser = DEFAULT_USERS.find(user => 
        user.username === username && user.password === password
      );
      
      console.log('Matched user:', matchedUser);
      
      // If no user found with these credentials
      if (!matchedUser) {
        console.error('No matching user found');
        throw new Error('Invalid username or password');
      }
      
      // If role was provided, enforce it matches the user's role
      if (role && matchedUser.role !== role) {
        console.error('Role mismatch:', { providedRole: role, userRole: matchedUser.role });
        throw new Error('You do not have permission to log in with this role');
      }
      
      // Create a user object
      const user: User = {
        id: Math.floor(Math.random() * 10000), // Generate random ID
        name: matchedUser.name || matchedUser.username,
        role: matchedUser.role
      };
      
      console.log('Created user object:', user);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User stored in localStorage');
      
      console.log('Setting user in state and updating isLoggedIn to true');
      set({ user, loading: false, isLoggedIn: true, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false
      });
    }
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isLoggedIn: false });
  }
}));