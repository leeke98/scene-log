import { vi, afterEach } from "vitest";

// 테스트마다 모든 모킹 초기화
afterEach(() => {
  vi.clearAllMocks();
});

// console 출력 억제 (apiClient의 dev 로그 제거)
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
