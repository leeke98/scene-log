/**
 * 인증 상태 관리 (Zustand)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/services/authApi";

interface AuthState {
  user: User | null;
  accessToken: string | null; // 메모리에만 유지 (localStorage 비저장)
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, accessToken: null }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: "auth-storage",
      // user만 저장, accessToken은 메모리에만 유지
      partialize: (state) => ({ user: state.user }),
    }
  )
);
