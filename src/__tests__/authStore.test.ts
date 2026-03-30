import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

const mockUser = { id: "1", username: "testuser", nickname: "테스터", provider: "local" as const };

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null });
  localStorage.clear();
});

describe("authStore", () => {
  describe("초기 상태", () => {
    it("user와 accessToken이 null이다", () => {
      const { user, accessToken } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(accessToken).toBeNull();
    });
  });

  describe("setUser", () => {
    it("user를 설정한다", () => {
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it("null을 설정할 수 있다", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("setAccessToken", () => {
    it("accessToken을 설정한다", () => {
      useAuthStore.getState().setAccessToken("token-abc");
      expect(useAuthStore.getState().accessToken).toBe("token-abc");
    });

    it("null을 설정할 수 있다", () => {
      useAuthStore.getState().setAccessToken("token-abc");
      useAuthStore.getState().setAccessToken(null);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("clearUser", () => {
    it("user와 accessToken을 모두 초기화한다", () => {
      useAuthStore.setState({ user: mockUser, accessToken: "some-token" });

      useAuthStore.getState().clearUser();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("localStorage 영속성", () => {
    it("user는 localStorage에 저장된다", () => {
      useAuthStore.getState().setUser(mockUser);

      const stored = JSON.parse(
        localStorage.getItem("auth-storage") ?? "{}"
      );
      expect(stored.state?.user).toEqual(mockUser);
    });

    it("accessToken은 localStorage에 저장되지 않는다 (보안)", () => {
      useAuthStore.getState().setAccessToken("secret-token");

      const stored = JSON.parse(
        localStorage.getItem("auth-storage") ?? "{}"
      );
      expect(stored.state?.accessToken).toBeUndefined();
    });

    it("clearUser 후 localStorage의 user도 null이 된다", () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().clearUser();

      const stored = JSON.parse(
        localStorage.getItem("auth-storage") ?? "{}"
      );
      expect(stored.state?.user).toBeNull();
    });
  });
});
