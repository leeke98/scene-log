/**
 * 인증 관련 API
 */
import { apiPost, apiGet, setAccessToken } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";

export interface User {
  id: string;
  username: string;
  nickname: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

/**
 * 회원가입
 * 회원가입 후 자동 로그인하지 않으므로 토큰을 저장하지 않음
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/signup", data, { requireAuth: false });
}

/**
 * 로그인
 * - access token → 메모리(store)에 저장
 * - refresh token → 백엔드가 httpOnly 쿠키로 자동 설정
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/login", data, {
    requireAuth: false,
  });

  if (response.access_token) {
    setAccessToken(response.access_token);
  }

  return response;
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  return apiGet<User>("/auth/me");
}

/**
 * 로그아웃
 * 서버에서 refresh token 삭제 및 쿠키 클리어
 */
export async function logout(): Promise<void> {
  await apiPost("/auth/logout", undefined, { requireAuth: false });
  useAuthStore.getState().clearUser();
}
