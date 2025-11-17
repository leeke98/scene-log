/**
 * 인증 상태 관리 (Zustand)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/services/authApi";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      // user만 저장하고, token은 apiClient에서 관리
      partialize: (state) => ({ user: state.user }),
    }
  )
);
