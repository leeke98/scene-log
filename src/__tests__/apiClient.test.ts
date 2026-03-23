import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

// fetch를 전역 모킹
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockOk(body: unknown, status = 200) {
  return Promise.resolve({
    status,
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFail(status: number, body: unknown) {
  return Promise.resolve({
    status,
    ok: false,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
  useAuthStore.setState({ user: null, accessToken: null });

  // window.location 재설정
  Object.defineProperty(window, "location", {
    value: { href: "", pathname: "/dashboard" },
    writable: true,
    configurable: true,
  });
});

describe("apiClient", () => {
  describe("Authorization 헤더", () => {
    it("requireAuth=true이고 토큰이 있으면 Bearer 헤더를 첨부한다", async () => {
      useAuthStore.setState({ accessToken: "my-access-token" });
      mockFetch.mockReturnValue(mockOk({ data: "ok" }));

      await apiGet("/me");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBe("Bearer my-access-token");
    });

    it("accessToken이 없으면 Authorization 헤더가 없다", async () => {
      mockFetch.mockReturnValue(mockOk({ data: "ok" }));

      await apiGet("/public", { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBeUndefined();
    });

    it("requireAuth=false이면 토큰이 있어도 헤더를 첨부하지 않는다", async () => {
      useAuthStore.setState({ accessToken: "my-token" });
      mockFetch.mockReturnValue(mockOk({}));

      await apiGet("/open", { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBeUndefined();
    });
  });

  describe("204 No Content", () => {
    it("204 응답은 빈 객체를 반환한다", async () => {
      mockFetch.mockReturnValue(
        Promise.resolve({ status: 204, ok: true, json: vi.fn() } as unknown as Response)
      );

      const result = await apiGet("/empty", { requireAuth: false });

      expect(result).toEqual({});
    });
  });

  describe("401 처리 — refresh 흐름", () => {
    it("401 → 리프레시 성공 → 새 토큰으로 원래 요청 재시도", async () => {
      useAuthStore.setState({ accessToken: "expired-token" });

      mockFetch
        .mockReturnValueOnce(mockFail(401, { error: "Unauthorized" }))         // 원래 요청
        .mockReturnValueOnce(mockOk({ access_token: "fresh-token" }))           // /auth/refresh
        .mockReturnValueOnce(mockOk({ id: "1", name: "결과" }));                // 재시도

      const result = await apiGet("/protected");

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(useAuthStore.getState().accessToken).toBe("fresh-token");
      expect(result).toEqual({ id: "1", name: "결과" });
    });

    it("재시도 요청에는 새 토큰이 Authorization 헤더에 담긴다", async () => {
      useAuthStore.setState({ accessToken: "expired-token" });

      mockFetch
        .mockReturnValueOnce(mockFail(401, { error: "Unauthorized" }))
        .mockReturnValueOnce(mockOk({ access_token: "fresh-token" }))
        .mockReturnValueOnce(mockOk({ ok: true }));

      await apiGet("/protected");

      const [, retryOptions] = mockFetch.mock.calls[2]; // 세 번째 호출 = 재시도
      expect(retryOptions.headers["Authorization"]).toBe("Bearer fresh-token");
    });

    it("401 → 리프레시 실패 → clearUser 후 AUTH_EXPIRED 에러", async () => {
      const user = { id: "1", username: "test", nickname: "테스터" };
      useAuthStore.setState({ user, accessToken: "expired-token" });

      mockFetch
        .mockReturnValueOnce(mockFail(401, { error: "Unauthorized" }))
        .mockReturnValueOnce(mockFail(401, { error: "Refresh token expired" }));

      await expect(apiGet("/protected")).rejects.toMatchObject({
        code: "AUTH_EXPIRED",
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("_isRetry=true일 때 401이 와도 재시도하지 않는다 (무한 루프 방지)", async () => {
      // 내부적으로 재시도 요청이 또 401 오면 refresh를 다시 시도하지 않아야 함
      useAuthStore.setState({ accessToken: "expired" });

      mockFetch
        .mockReturnValueOnce(mockFail(401, { error: "Unauthorized" }))  // 원래
        .mockReturnValueOnce(mockOk({ access_token: "new-token" }))      // refresh
        .mockReturnValueOnce(mockFail(401, { error: "Still 401" }));     // 재시도도 401

      await expect(apiGet("/protected")).rejects.toMatchObject({
        error: expect.any(String),
      });

      // refresh 포함 총 3번 호출, 그 이상은 없어야 함
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("에러 처리", () => {
    it("네트워크 오류 → NETWORK_ERROR 코드", async () => {
      mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(apiGet("/test", { requireAuth: false })).rejects.toMatchObject({
        code: "NETWORK_ERROR",
      });
    });

    it("서버 오류 응답 → error 메시지를 포함한 ApiError를 던진다", async () => {
      mockFetch.mockReturnValue(mockFail(500, { error: "서버 내부 오류" }));

      await expect(apiGet("/fail", { requireAuth: false })).rejects.toMatchObject({
        error: "서버 내부 오류",
      });
    });

    it("서버가 code 필드를 반환하면 ApiError에 포함된다", async () => {
      mockFetch.mockReturnValue(
        mockFail(422, { error: "유효성 오류", code: "VALIDATION_ERROR" })
      );

      await expect(apiGet("/validate", { requireAuth: false })).rejects.toMatchObject({
        error: "유효성 오류",
        code: "VALIDATION_ERROR",
      });
    });

    it("error 필드 없는 서버 오류 → 기본 HTTP 오류 메시지", async () => {
      mockFetch.mockReturnValue(mockFail(503, {}));

      await expect(apiGet("/down", { requireAuth: false })).rejects.toMatchObject({
        error: expect.stringContaining("503"),
      });
    });
  });

  describe("HTTP 메서드 래퍼", () => {
    it("apiPost는 POST 메서드와 JSON body로 요청한다", async () => {
      mockFetch.mockReturnValue(mockOk({ id: "new-1" }));

      await apiPost("/tickets", { name: "레미제라블" }, { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify({ name: "레미제라블" }));
      expect(options.headers["Content-Type"]).toBe("application/json");
    });

    it("apiPut은 PUT 메서드로 요청한다", async () => {
      mockFetch.mockReturnValue(mockOk({ message: "updated" }));

      await apiPut("/tickets/1", { name: "수정됨" }, { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("PUT");
    });

    it("apiDelete는 DELETE 메서드로 요청한다", async () => {
      mockFetch.mockReturnValue(mockOk({ message: "deleted" }));

      await apiDelete("/tickets/1", { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("DELETE");
    });

    it("모든 요청에 credentials: include가 설정된다 (refresh token 쿠키 전송)", async () => {
      mockFetch.mockReturnValue(mockOk({}));

      await apiGet("/test", { requireAuth: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.credentials).toBe("include");
    });
  });
});
