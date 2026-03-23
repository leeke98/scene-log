/**
 * 인증 관련 React Query Hooks
 *
 * 기존 useAuth와의 호환성을 위한 래퍼
 */
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser } from "./queries";
import { useLogin, useSignup, useLogout } from "./mutations";

/**
 * 인증 상태 Hook (기존 useAuth와 호환)
 */
export function useAuth() {
  const { user } = useAuthStore();
  const { data: currentUser, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const logoutMutation = useLogout();

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated: !!currentUser || !!user,
    login: async (id: string, password: string) => {
      // 이미 진행 중이면 중복 호출 방지
      if (loginMutation.isPending) {
        return { success: false, error: "이미 로그인 처리 중입니다." };
      }
      try {
        await loginMutation.mutateAsync({ username: id, password });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.error };
      }
    },
    signup: async (id: string, password: string, nickname: string) => {
      // 이미 진행 중이면 중복 호출 방지
      if (signupMutation.isPending) {
        return { success: false, error: "이미 회원가입 처리 중입니다." };
      }
      try {
        await signupMutation.mutateAsync({
          username: id,
          password,
          nickname,
        });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.error };
      }
    },
    logout: async () => {
      // 이미 진행 중이면 중복 호출 방지
      if (logoutMutation.isPending) {
        return;
      }
      await logoutMutation.mutateAsync();
    },
  };
}

// 개별 hooks도 export
export { useCurrentUser } from "./queries";
export { useLogin, useSignup, useLogout } from "./mutations";
