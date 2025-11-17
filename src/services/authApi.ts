/**
 * 인증 관련 API
 */
import { apiPost, apiGet, setToken, removeToken } from "@/lib/apiClient";

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
  token: string;
  user: User;
}

/**
 * 회원가입
 * 회원가입 후 자동 로그인하지 않으므로 토큰을 저장하지 않음
 */
export async function signup(
  data: SignupRequest
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>(
    "/auth/signup",
    data,
    { requireAuth: false }
  );
  
  // 회원가입 후 자동 로그인하지 않으므로 토큰 저장하지 않음
  
  return response;
}

/**
 * 토큰 제거 (회원가입 후 사용)
 */
export { removeToken } from "@/lib/apiClient";

/**
 * 로그인
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>(
    "/auth/login",
    data,
    { requireAuth: false }
  );
  
  // 토큰 저장
  if (response.token) {
    setToken(response.token);
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
 */
export async function logout(): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } catch (error) {
    // 로그아웃 실패해도 토큰은 제거
    console.error("로그아웃 오류:", error);
  } finally {
    removeToken();
  }
}

