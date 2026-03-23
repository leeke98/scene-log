import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiClient", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import {
  createTicket,
  getTicketsByMonth,
  getTicketsList,
  getTicketById,
  updateTicket,
  deleteTicket,
  type CreateTicketRequest,
} from "@/services/ticketApi";

const validTicket: CreateTicketRequest = {
  date: "2025-01-15",
  time: "14:00:00",
  performanceName: "레미제라블",
  theater: "블루스퀘어",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ticketApi", () => {
  describe("createTicket — 필수 필드 검증", () => {
    it("date가 없으면 에러를 던진다", async () => {
      const data = { ...validTicket, date: "" };
      await expect(createTicket(data)).rejects.toThrow("필수 필드");
    });

    it("time이 없으면 에러를 던진다", async () => {
      const data = { ...validTicket, time: "" };
      await expect(createTicket(data)).rejects.toThrow("필수 필드");
    });

    it("performanceName이 없으면 에러를 던진다", async () => {
      const data = { ...validTicket, performanceName: "" };
      await expect(createTicket(data)).rejects.toThrow("필수 필드");
    });

    it("theater가 없으면 에러를 던진다", async () => {
      const data = { ...validTicket, theater: "" };
      await expect(createTicket(data)).rejects.toThrow("필수 필드");
    });

    it("필수 필드가 모두 있으면 apiPost를 호출한다", async () => {
      vi.mocked(apiPost).mockResolvedValue({ message: "created", id: "new-1" });

      await createTicket(validTicket);

      expect(apiPost).toHaveBeenCalledWith("/tickets", validTicket);
    });
  });

  describe("getTicketsByMonth", () => {
    it("yearMonth 파라미터를 쿼리스트링으로 전달한다", async () => {
      vi.mocked(apiGet).mockResolvedValue({ data: [] });

      await getTicketsByMonth("2025-01");

      expect(apiGet).toHaveBeenCalledWith("/tickets/month?yearMonth=2025-01");
    });

    it("응답의 data 배열을 반환한다", async () => {
      const mockData = [{ id: "1", posterUrl: "", date: "2025-01-15", time: "14:00:00" }];
      vi.mocked(apiGet).mockResolvedValue({ data: mockData });

      const result = await getTicketsByMonth("2025-01");

      expect(result).toEqual(mockData);
    });
  });

  describe("getTicketsList — 쿼리스트링 빌드", () => {
    it("파라미터 없이 호출하면 /tickets를 요청한다", async () => {
      vi.mocked(apiGet).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0 },
      });

      await getTicketsList();

      expect(apiGet).toHaveBeenCalledWith("/tickets");
    });

    it("page 파라미터가 쿼리스트링에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({
        data: [],
        pagination: { page: 2, limit: 20, total: 100 },
      });

      await getTicketsList({ page: 2 });

      expect(apiGet).toHaveBeenCalledWith("/tickets?page=2");
    });

    it("genre 파라미터가 쿼리스트링에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0 },
      });

      await getTicketsList({ genre: "뮤지컬" });

      const call = decodeURIComponent(vi.mocked(apiGet).mock.calls[0][0] as string);
      expect(call).toContain("genre=뮤지컬");
    });

    it("performanceName 파라미터가 쿼리스트링에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0 },
      });

      await getTicketsList({ performanceName: "레미제라블" });

      const call = decodeURIComponent(vi.mocked(apiGet).mock.calls[0][0] as string);
      expect(call).toContain("performanceName=레미제라블");
    });

    it("여러 파라미터가 함께 쿼리스트링에 포함된다", async () => {
      vi.mocked(apiGet).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      await getTicketsList({ page: 1, limit: 10, genre: "연극" });

      const call = decodeURIComponent(vi.mocked(apiGet).mock.calls[0][0] as string);
      expect(call).toContain("page=1");
      expect(call).toContain("limit=10");
      expect(call).toContain("genre=연극");
    });
  });

  describe("getTicketById", () => {
    it("티켓 ID를 경로에 포함해 GET 요청한다", async () => {
      vi.mocked(apiGet).mockResolvedValue({ id: "ticket-123" });

      await getTicketById("ticket-123");

      expect(apiGet).toHaveBeenCalledWith("/tickets/ticket-123");
    });
  });

  describe("updateTicket", () => {
    it("티켓 ID를 경로에 포함해 PUT 요청한다", async () => {
      vi.mocked(apiPut).mockResolvedValue({ message: "updated" });

      await updateTicket("ticket-123", { rating: 5 });

      expect(apiPut).toHaveBeenCalledWith("/tickets/ticket-123", { rating: 5 });
    });
  });

  describe("deleteTicket", () => {
    it("티켓 ID를 경로에 포함해 DELETE 요청한다", async () => {
      vi.mocked(apiDelete).mockResolvedValue({ message: "deleted" });

      await deleteTicket("ticket-123");

      expect(apiDelete).toHaveBeenCalledWith("/tickets/ticket-123");
    });
  });
});
