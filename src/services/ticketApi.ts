/**
 * 티켓 관련 API
 */
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export interface CalendarTicket {
  id: string;
  posterUrl: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
}

export interface CalendarTicketsResponse {
  data: CalendarTicket[];
}

export interface CreateTicketRequest {
  date: string; // YYYY-MM-DD (필수)
  time: string; // HH:MM:SS (필수)
  performanceName: string; // 필수
  genre?: "연극" | "뮤지컬";
  isChild?: boolean;
  theater: string; // 필수
  seat?: string;
  ticketPrice?: number;
  companion?: string;
  mdPrice?: number;
  rating?: number;
  review?: string;
  posterUrl?: string;
  casting?: string[];
}

export interface UpdateTicketRequest extends Partial<CreateTicketRequest> {}

export interface CreateTicketResponse {
  message: string;
  id: string;
}

export interface UpdateTicketResponse {
  message: string;
}

export interface DeleteTicketResponse {
  message: string;
}

export interface Ticket {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM:SS
  performanceName: string;
  genre?: "연극" | "뮤지컬";
  isChild?: boolean;
  theater: string;
  seat?: string;
  ticketPrice?: number;
  companion?: string;
  mdPrice?: number;
  rating?: number;
  review?: string;
  posterUrl?: string;
  casting?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 월별 티켓 조회 (달력용)
 */
export async function getTicketsByMonth(
  yearMonth: string // YYYY-MM 형식
): Promise<CalendarTicket[]> {
  const response = await apiGet<CalendarTicketsResponse>(
    `/tickets/month?yearMonth=${yearMonth}`
  );
  return response.data;
}

/**
 * 티켓 생성
 */
export async function createTicket(
  data: CreateTicketRequest
): Promise<CreateTicketResponse> {
  // 필수 필드 검증
  if (!data.date || !data.time || !data.performanceName || !data.theater) {
    throw new Error(
      "필수 필드(date, time, performanceName, theater)를 모두 입력해주세요."
    );
  }

  return apiPost<CreateTicketResponse>("/tickets", data);
}

/**
 * 티켓 수정
 */
export async function updateTicket(
  id: string,
  data: UpdateTicketRequest
): Promise<UpdateTicketResponse> {
  return apiPut<UpdateTicketResponse>(`/tickets/${id}`, data);
}

/**
 * 티켓 상세 조회
 */
export async function getTicketById(id: string): Promise<Ticket> {
  return apiGet<Ticket>(`/tickets/${id}`);
}

/**
 * 티켓 삭제
 */
export async function deleteTicket(id: string): Promise<DeleteTicketResponse> {
  return apiDelete<DeleteTicketResponse>(`/tickets/${id}`);
}
