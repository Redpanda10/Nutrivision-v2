import { create } from "zustand";
import { api, setAuthToken } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isOnboarded: boolean;
  loading: boolean;
  error: string | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  completeOnboarding: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isOnboarded: false,
  loading: false,
  error: null,

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post("/api/auth/signup", { name, email, password });
      set({ loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Signup failed"
      });
      throw error;
    }
  },

  verifyEmail: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/auth/verify-email", { email, otp });
      const token = res.data.token as string;
      const user = res.data.user as User;
      setAuthToken(token);
      set({ token, user, loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Verification failed"
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const token = res.data.token as string;
      const user = res.data.user as User;
      setAuthToken(token);
      set({ token, user, loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Login failed"
      });
      throw error;
    }
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isOnboarded: false });
  }
}));

