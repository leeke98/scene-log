import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

// apiClient 전체 모킹 (서비스 로직만 격리해서 테스트)
vi.mock("@/lib/apiClient", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  setAccessToken: vi.fn(),
}));

import { apiPost, apiGet, setAccessToken } from "@/lib/apiClient";
import { login, logout, signup, getCurrentUser } from "@/services/authApi";

const mockUser = { id: "1", username: "testuser", nickname: "테스터", provider: "local" as const };

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null });
});

describe("authApi", () => {
  describe("login", () => {
    it("로그인 성공 시 access_token을 store에 저장한다", async () => {
      vi.mocked(apiPost).mockResolvedValue({
        message: "로그인 성공",
        access_token: "new-access-token",
        user: mockUser,
      });

      await login({ username: "testuser", password: "pass123" });

      expect(setAccessToken).toHaveBeenCalledWith("new-access-token");
    });

    it("응답 객체를 그대로 반환한다", async () => {
      const mockResponse = {
        message: "로그인 성공",
        access_token: "token",
        user: mockUser,
      };
      vi.mocked(apiPost).mockResolvedValue(mockResponse);

      const result = await login({ username: "testuser", password: "pass" });

      expect(result).toEqual(mockResponse);
    });

    it("requireAuth=false로 호출한다 (로그인 전이므로 토큰 불필요)", async () => {
      vi.mocked(apiPost).mockResolvedValue({
        message: "ok",
        access_token: "t",
        user: mockUser,
      });

      await login({ username: "u", password: "p" });

      expect(apiPost).toHaveBeenCalledWith(
        "/auth/login",
        expect.any(Object),
        { requireAuth: false }
      );
    });

    it("access_token이 없는 응답이면 setAccessToken을 호출하지 않는다", async () => {
      vi.mocked(apiPost).mockResolvedValue({
        message: "ok",
        access_token: "",
        user: mockUser,
      });

      await login({ username: "u", password: "p" });

      expect(setAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("로그아웃 시 store의 user와 accessToken을 초기화한다", async () => {
      useAuthStore.setState({ user: mockUser, accessToken: "token" });
      vi.mocked(apiPost).mockResolvedValue({});

      await logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("서버에 POST /auth/logout을 요청한다", async () => {
      vi.mocked(apiPost).mockResolvedValue({});

      await logout();

      expect(apiPost).toHaveBeenCalledWith(
        "/auth/logout",
        undefined,
        { requireAuth: false }
      );
    });
  });

  describe("signup", () => {
    it("회원가입은 requireAuth=false로 호출한다", async () => {
      vi.mocked(apiPost).mockResolvedValue({
        message: "가입 완료",
        access_token: "t",
        user: mockUser,
      });

      await signup({ username: "new", password: "pass", nickname: "신규" });

      expect(apiPost).toHaveBeenCalledWith(
        "/auth/signup",
        expect.any(Object),
        { requireAuth: false }
      );
    });

    it("회원가입 후 setAccessToken을 호출하지 않는다 (자동 로그인 없음)", async () => {
      vi.mocked(apiPost).mockResolvedValue({
        message: "ok",
        access_token: "t",
        user: mockUser,
      });

      await signup({ username: "new", password: "pass", nickname: "신규" });

      expect(setAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("GET /auth/me를 호출한다", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockUser);

      await getCurrentUser();

      expect(apiGet).toHaveBeenCalledWith("/auth/me");
    });

    it("사용자 정보를 반환한다", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });
});
