import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: '1', role: 'admin' }, // Hardcoded for demo
  setUser: (user) => set({ user }),
}));