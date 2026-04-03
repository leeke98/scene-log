import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiClient", () => ({
  apiGet: vi.fn(),
}));

import { apiGet } from "@/lib/apiClient";
import {
  getSummary,
  getMonthlyStats,
  getWeeklyStats,
  getDayOfWeekStats,
  getActorStats,
  getActorDetail,
  getPerformanceDetail,
  getMostViewedPerformance,
} from "@/services/reportApi";

beforeEach(() => {
  vi.mocked(apiGet).mockResolvedValue([]);
});

describe("reportApi — 엔드포인트 빌드", () => {
  describe("getSummary", () => {
    it("파라미터 없으면 /reports/summary 요청", async () => {
      await getSummary();
      expect(apiGet).toHaveBeenCalledWith("/reports/summary");
    });

    it("year만 있으면 year 쿼리만 포함", async () => {
      await getSummary("2025");
      expect(apiGet).toHaveBeenCalledWith("/reports/summary?year=2025");
    });

    it("year + month 모두 있으면 둘 다 포함", async () => {
      await getSummary("2025", "01");
      expect(apiGet).toHaveBeenCalledWith(
        "/reports/summary?year=2025&month=01"
      );
    });
  });

  describe("getMonthlyStats", () => {
    it("year 없으면 /reports/monthly", async () => {
      await getMonthlyStats();
      expect(apiGet).toHaveBeenCalledWith("/reports/monthly");
    });

    it("year 있으면 쿼리스트링 포함", async () => {
      await getMonthlyStats("2025");
      expect(apiGet).toHaveBeenCalledWith("/reports/monthly?year=2025");
    });
  });

  describe("getWeeklyStats", () => {
    it("yearMonth 없으면 /reports/weekly", async () => {
      await getWeeklyStats();
      expect(apiGet).toHaveBeenCalledWith("/reports/weekly");
    });

    it("yearMonth 있으면 쿼리스트링 포함", async () => {
      await getWeeklyStats("2025-01");
      expect(apiGet).toHaveBeenCalledWith("/reports/weekly?yearMonth=2025-01");
    });
  });

  describe("getDayOfWeekStats", () => {
    it("파라미터 없으면 /reports/day-of-week", async () => {
      await getDayOfWeekStats();
      expect(apiGet).toHaveBeenCalledWith("/reports/day-of-week");
    });

    it("year만 있으면 year만 포함", async () => {
      await getDayOfWeekStats("2025");
      expect(apiGet).toHaveBeenCalledWith("/reports/day-of-week?year=2025");
    });

    it("year + month 모두 있으면 둘 다 포함", async () => {
      await getDayOfWeekStats("2025", "03");
      expect(apiGet).toHaveBeenCalledWith(
        "/reports/day-of-week?year=2025&month=03"
      );
    });
  });

  describe("getActorStats", () => {
    it("파라미터 없으면 /reports/actors", async () => {
      await getActorStats();
      expect(apiGet).toHaveBeenCalledWith("/reports/actors");
    });

    it("search, year, page가 모두 쿼리스트링에 포함된다", async () => {
      await getActorStats({ search: "홍길동", year: "2025", page: 2 });
      const call = decodeURIComponent(vi.mocked(apiGet).mock.calls[0][0] as string);
      expect(call).toContain("search=홍길동");
      expect(call).toContain("year=2025");
      expect(call).toContain("page=2");
    });
  });

  describe("getActorDetail", () => {
    it("actorId가 없으면 에러를 던진다", async () => {
      await expect(
        getActorDetail({ actorId: "" })
      ).rejects.toThrow("actorId is required");
    });

    it("actorId가 URL 인코딩되어 경로에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({});

      await getActorDetail({ actorId: "actor-uuid-123" });

      const call = vi.mocked(apiGet).mock.calls[0][0];
      expect(call).toContain("actor-uuid-123");
    });

    it("year, month가 쿼리스트링에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({});

      await getActorDetail({ actorId: "actor-uuid-123", year: "2025", month: "01" });

      const call = vi.mocked(apiGet).mock.calls[0][0];
      expect(call).toContain("year=2025");
      expect(call).toContain("month=01");
    });
  });

  describe("getPerformanceDetail", () => {
    it("performanceName이 없으면 에러를 던진다", async () => {
      await expect(
        getPerformanceDetail({ performanceName: "" })
      ).rejects.toThrow("performanceName is required");
    });

    it("performanceName이 URL 인코딩되어 경로에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({});

      await getPerformanceDetail({ performanceName: "레 미제라블" });

      const call = vi.mocked(apiGet).mock.calls[0][0];
      expect(call).toContain(encodeURIComponent("레 미제라블"));
    });
  });

  describe("getMostViewedPerformance", () => {
    it("파라미터 없으면 /reports/performances/top", async () => {
      await getMostViewedPerformance();
      expect(apiGet).toHaveBeenCalledWith("/reports/performances/top");
    });

    it("year, month가 쿼리스트링에 포함된다", async () => {
      await getMostViewedPerformance("2025", "03");
      const call = vi.mocked(apiGet).mock.calls[0][0];
      expect(call).toContain("year=2025");
      expect(call).toContain("month=03");
    });
  });
});
