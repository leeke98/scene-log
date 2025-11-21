/**
 * 인증 관련 Mutations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import * as authApi from "@/services/authApi";
import { removeToken } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { queryKeys } from "@/lib/react-query/queryKeys";

/**
 * 로그인 Mutation
 */
export function useLogin() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authApi.login(data),
    onSuccess: (response) => {
      // 이전 사용자의 모든 캐시 데이터 초기화
      queryClient.clear();
      setUser(response.user);
      queryClient.setQueryData(queryKeys.auth.currentUser(), response.user);
      toast.success("로그인되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error?.error || "로그인에 실패했습니다.");
    },
  });
}

/**
 * 회원가입 Mutation
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      username: string;
      password: string;
      nickname: string;
    }) => authApi.signup(data),
    onSuccess: () => {
      // 회원가입 후 자동 로그인하지 않음
      removeToken();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      // toast는 컴포넌트에서 처리하므로 여기서는 제거
      // toast.success("회원가입이 완료되었습니다.");
    },
    onError: () => {
      // toast는 컴포넌트에서 처리하므로 여기서는 제거
      // toast.error(error?.error || "회원가입에 실패했습니다.");
    },
  });
}

/**
 * 로그아웃 Mutation
 */
export function useLogout() {
  const { clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      // 모든 캐시 데이터 초기화 (다른 사용자의 데이터가 남지 않도록)
      queryClient.clear();
      toast.success("로그아웃되었습니다.");
    },
    onError: (error) => {
      console.error("로그아웃 오류:", error);
      // 에러가 발생해도 로컬 상태는 정리
      clearUser();
      // 모든 캐시 데이터 초기화
      queryClient.clear();
    },
  });
}
