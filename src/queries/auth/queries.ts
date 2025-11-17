/**
 * 인증 관련 Queries
 */
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import * as authApi from "@/services/authApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

/**
 * 토큰이 있는지 확인하는 헬퍼 함수
 */
function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

/**
 * 현재 사용자 정보 조회
 *
 * - token이 있을 때만 API 호출
 * - token이 없으면 쿼리를 비활성화하여 호출하지 않음
 */
export function useCurrentUser() {
  const { setUser, clearUser } = useAuthStore();
  const tokenExists = hasToken();

  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async () => {
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);
        return user;
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    enabled: tokenExists, // token이 있을 때만 호출
    retry: false, // 에러 발생 시 재시도 안 함
    staleTime: Infinity, // 한 번 로드하면 계속 사용
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지 (구 cacheTime)
  });
}
