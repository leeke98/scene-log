/**
 * 인증 관련 API
 */
import { apiPost, apiGet, apiPatch, setAccessToken } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";

export interface User {
  id: string;
  username: string;
  nickname: string;
  provider: "local" | "google";
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
 * 구글 로그인
 * Google OAuth credential(ID token)을 백엔드에 전달하여 인증
 */
export async function googleLogin(credential: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>(
    "/auth/google",
    { credential },
    { requireAuth: false }
  );

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

/**
 * 닉네임 변경
 */
export interface UpdateProfileRequest {
  nickname: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  return apiPatch<UpdateProfileResponse>("/auth/profile", data);
}

/**
 * 비밀번호 변경
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export async function updatePassword(
  data: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> {
  return apiPatch<UpdatePasswordResponse>("/auth/password", data);
}
