/**
 * 인증 관련 Queries
 */
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import * as authApi from "@/services/authApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

/**
 * 현재 사용자 정보 조회
 *
 * - 앱 로드 시 항상 실행
 * - access token이 없으면 apiClient가 /auth/refresh를 먼저 시도
 * - refresh token도 없으면 401로 실패 → user null 처리
 */
export function useCurrentUser() {
  const { setUser, clearUser } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async () => {
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);
        return user;
      } catch {
        clearUser();
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
  });
}
