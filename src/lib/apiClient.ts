/**
 * API 클라이언트 유틸리티
 * 백엔드 API 호출을 위한 공통 함수
 *
 * 인증 방식: Access Token (메모리) + Refresh Token (httpOnly 쿠키)
 * - Access Token은 Zustand store에서 관리
 * - 401 응답 시 /auth/refresh 호출 후 원래 요청 자동 재시도
 */

// 개발 환경에서는 항상 Vite 프록시 사용 (/api)
// 프로덕션에서는 환경 변수 또는 기본값 사용
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { useAuthStore } from "@/stores/authStore";

export interface ApiError {
  error: string;
  code?: string;
}

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  _isRetry?: boolean; // 재시도 여부 (무한 루프 방지)
}

/**
 * API 응답 타입
 */
type ApiResponse<T> = T;

// ─────────────────────────────────────────────
// Access Token 관리 (store 직접 접근 — React 외부)
// ─────────────────────────────────────────────

function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

function setAccessToken(token: string | null): void {
  useAuthStore.getState().setAccessToken(token);
}

function clearAuth(): void {
  useAuthStore.getState().clearUser();
}

// ─────────────────────────────────────────────
// Refresh Token 인터셉터 (뮤텍스로 중복 호출 방지)
// ─────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // httpOnly refresh token 쿠키 자동 전송
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      const token: string = data.access_token;
      setAccessToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─────────────────────────────────────────────
// 핵심 요청 함수
// ─────────────────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, _isRetry = false, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Access Token을 Authorization 헤더에 첨부
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (import.meta.env.DEV) {
    console.log(`[API Request] ${fetchOptions.method || "GET"} ${url}`, {
      headers,
      body: fetchOptions.body,
    });
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // refresh token 쿠키 자동 전송
    });

    if (import.meta.env.DEV) {
      console.log(`[API Response] ${url}`, {
        status: response.status,
        ok: response.ok,
      });
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // ── 401: Access Token 만료 → Refresh 시도 후 재시도 ──
    if (response.status === 401 && requireAuth && !_isRetry) {
      const newToken = await tryRefreshToken();

      if (newToken) {
        // 새 토큰으로 원래 요청 1회 재시도
        return apiRequest<T>(endpoint, {
          ...fetchOptions,
          requireAuth,
          _isRetry: true,
        });
      } else {
        // Refresh 실패 → 로그인 페이지로
        clearAuth();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
        throw { error: "인증이 만료되었습니다. 다시 로그인해주세요.", code: "AUTH_EXPIRED" } as ApiError;
      }
    }

    const data = await response.json();

    if (import.meta.env.DEV) {
      console.log(`[API] ${fetchOptions.method || "GET"} ${endpoint}`, {
        status: response.status,
        data,
      });
    }

    if (!response.ok) {
      const error: ApiError = {
        error: data.error || `HTTP ${response.status} 오류가 발생했습니다.`,
        code: data.code,
      };
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${fetchOptions.method || "GET"} ${endpoint}`, error);
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${url}`, error);
    }

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw {
        error: `서버에 연결할 수 없습니다.\n서버가 실행 중인지 확인해주세요.\n요청 URL: ${url}`,
        code: "NETWORK_ERROR",
      } as ApiError;
    }

    if (error && typeof error === "object" && "error" in error) {
      throw error;
    }

    throw {
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      code: "UNKNOWN_ERROR",
    } as ApiError;
  }
}

// ─────────────────────────────────────────────
// 공개 HTTP 메서드
// ─────────────────────────────────────────────

export async function apiGet<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}

// ─────────────────────────────────────────────
// Access Token 직접 설정 (로그인 시 authApi에서 사용)
// ─────────────────────────────────────────────

export { setAccessToken };
