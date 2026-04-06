/**
 * 위시리스트 관련 API
 */
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

export interface PerformanceMark {
  id: string;
  userId: string;
  kopisId: string;
  title: string;
  posterUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  venue: string | null;
  createdAt: string;
}

export interface MarksListResponse {
  data: PerformanceMark[];
}

export interface AddMarkRequest {
  kopisId: string;
  title: string;
  posterUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
}

export interface AddMarkResponse {
  data: PerformanceMark;
}

export function getMarks(): Promise<MarksListResponse> {
  return apiGet<MarksListResponse>("/marks");
}

export function addMark(data: AddMarkRequest): Promise<AddMarkResponse> {
  return apiPost<AddMarkResponse>("/marks", data);
}

export function removeMark(kopisId: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/marks/${encodeURIComponent(kopisId)}`);
}
