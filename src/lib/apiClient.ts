/**
 * API 클라이언트 유틸리티
 * 백엔드 API 호출을 위한 공통 함수
 */

// 개발 환경에서는 항상 Vite 프록시 사용 (/api)
// 프로덕션에서는 환경 변수 또는 기본값 사용
const API_BASE_URL = import.meta.env.DEV
  ? "/api" // 개발 환경: 프록시 사용 (CORS 문제 해결)
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface ApiError {
  error: string;
  code?: string;
}

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API 응답 타입
 */
type ApiResponse<T> = T;

/**
 * 토큰 가져오기
 */
function getToken(): string | null {
  return localStorage.getItem("token");
}

/**
 * 토큰 저장
 */
export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

/**
 * 토큰 제거
 */
export function removeToken(): void {
  localStorage.removeItem("token");
}

/**
 * API 요청 함수
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // 인증이 필요한 경우 토큰 추가
  if (requireAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  // 디버깅용 로그 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${fetchOptions.method || "GET"} ${url}`, {
      headers,
      body: fetchOptions.body,
      apiBaseUrl: API_BASE_URL,
      endpoint,
    });
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 디버깅용 로그
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${url}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
    }

    // 응답이 비어있는 경우 (204 No Content 등)
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    // 디버깅용 로그 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API] ${fetchOptions.method || "GET"} ${endpoint}`, {
        status: response.status,
        data,
      });
    }

    // 에러 응답 처리
    if (!response.ok) {
      const error: ApiError = {
        error: data.error || `HTTP ${response.status} 오류가 발생했습니다.`,
        code: data.code,
      };
      // 디버깅용 로그
      if (import.meta.env.DEV) {
        console.error(
          `[API Error] ${fetchOptions.method || "GET"} ${endpoint}`,
          error
        );
      }
      throw error;
    }

    return data;
  } catch (error) {
    // 디버깅용 로그
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${url}`, error);
    }

    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const errorMessage = `서버에 연결할 수 없습니다. 
서버가 실행 중인지 확인해주세요.
요청 URL: ${url}
백엔드 서버: http://localhost:3001`;
      throw {
        error: errorMessage,
        code: "NETWORK_ERROR",
      } as ApiError;
    }

    // 이미 ApiError인 경우 그대로 throw
    if (error && typeof error === "object" && "error" in error) {
      throw error;
    }

    // 기타 오류
    throw {
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      code: "UNKNOWN_ERROR",
    } as ApiError;
  }
}

/**
 * GET 요청
 */
export async function apiGet<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST 요청
 */
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

/**
 * PUT 요청
 */
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

/**
 * DELETE 요청
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}
