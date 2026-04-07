import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/apiClient";

export type RewatchRewardType = "DISCOUNT_VOUCHER" | "MERCHANDISE";

export interface RewatchReward {
  id: string;
  rewardType: RewatchRewardType;
  discountPercent: number | null;
  voucherQty: number | null;
  merchandiseDesc: string | null;
}

export interface RewatchMilestoneSummary {
  id: string;
  stampCount: number;
  rewards: RewatchReward[];
}

export interface RewatchCardSummary {
  id: string;
  label: string | null;
  totalStamps: number;
  ticketCount: number;
}

export interface RewatchSeasonSummary {
  id: string;
  mt20id: string;
  title: string;
  posterUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  venue: string | null;
  createdAt: string;
  milestones: RewatchMilestoneSummary[];
  cards: RewatchCardSummary[];
  cardCount: number;
}

export interface RewatchMilestoneDetail extends RewatchMilestoneSummary {
  createdAt: string;
}

export interface RewatchCardTicketDetail {
  id: string;
  ticketId: string;
  stampCount: number;
  addedAt: string;
  performanceName: string;
  date: string;
  time: string;
  theater: string;
  posterUrl: string | null;
}

export interface RewatchRewardStatus {
  rewardId: string;
  rewardType: RewatchRewardType;
  // DISCOUNT_VOUCHER
  discountPercent?: number | null;
  voucherQty?: number | null;
  voucherUsed?: number;
  voucherRemaining?: number;
  usages?: { id: string; ticketId: string; usedAt: string }[];
  // MERCHANDISE
  merchandiseDesc?: string | null;
  merchandiseReceiptId?: string | null;
  merchandiseReceived?: boolean;
  merchandiseReceivedAt?: string | null;
}

export interface RewatchMilestoneStatus {
  milestoneId: string;
  achieved: boolean;
  rewardStatuses: RewatchRewardStatus[];
}

export interface RewatchCardDetail {
  id: string;
  label: string | null;
  totalStamps: number;
  ticketCount: number;
  createdAt: string;
  tickets: RewatchCardTicketDetail[];
  milestoneStatuses: RewatchMilestoneStatus[];
}

export interface RewatchSeasonDetail {
  id: string;
  mt20id: string;
  title: string;
  posterUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  venue: string | null;
  createdAt: string;
  milestones: RewatchMilestoneDetail[];
  cards: RewatchCardDetail[];
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export function getRewatchSeasons(): Promise<{ data: RewatchSeasonSummary[] }> {
  return apiGet("/rewatch/seasons");
}

export function createRewatchSeason(data: {
  mt20id: string;
  title: string;
  posterUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
}): Promise<{ data: RewatchSeasonSummary }> {
  return apiPost("/rewatch/seasons", data);
}

export function getRewatchSeasonDetail(seasonId: string): Promise<{ data: RewatchSeasonDetail }> {
  return apiGet(`/rewatch/seasons/${seasonId}`);
}

export function deleteRewatchSeason(seasonId: string): Promise<{ message: string }> {
  return apiDelete(`/rewatch/seasons/${seasonId}`);
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function addRewatchMilestone(
  seasonId: string,
  data: {
    stampCount: number;
    rewards: Array<{
      rewardType: RewatchRewardType;
      discountPercent?: number | null;
      voucherQty?: number | null;
      merchandiseDesc?: string | null;
    }>;
  }
): Promise<{ data: RewatchMilestoneDetail }> {
  return apiPost(`/rewatch/seasons/${seasonId}/milestones`, data);
}

export function updateRewatchMilestone(
  milestoneId: string,
  data: { stampCount?: number }
): Promise<{ data: RewatchMilestoneDetail }> {
  return apiPut(`/rewatch/milestones/${milestoneId}`, data);
}

export function deleteRewatchMilestone(milestoneId: string): Promise<{ message: string }> {
  return apiDelete(`/rewatch/milestones/${milestoneId}`);
}

// ─── Milestone Rewards ────────────────────────────────────────────────────────

export function addMilestoneReward(
  milestoneId: string,
  data: {
    rewardType: RewatchRewardType;
    discountPercent?: number | null;
    voucherQty?: number | null;
    merchandiseDesc?: string | null;
  }
): Promise<{ data: RewatchReward }> {
  return apiPost(`/rewatch/milestones/${milestoneId}/rewards`, data);
}

export function updateMilestoneReward(
  rewardId: string,
  data: {
    discountPercent?: number | null;
    voucherQty?: number | null;
    merchandiseDesc?: string | null;
  }
): Promise<{ data: RewatchReward }> {
  return apiPut(`/rewatch/rewards/${rewardId}`, data);
}

export function deleteMilestoneReward(rewardId: string): Promise<{ message: string }> {
  return apiDelete(`/rewatch/rewards/${rewardId}`);
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function addRewatchCard(
  seasonId: string,
  data: { label?: string | null }
): Promise<{ data: { id: string; seasonId: string; label: string | null; createdAt: string } }> {
  return apiPost(`/rewatch/seasons/${seasonId}/cards`, data);
}

export function deleteRewatchCard(cardId: string): Promise<{ message: string }> {
  return apiDelete(`/rewatch/cards/${cardId}`);
}

// ─── Card Tickets ─────────────────────────────────────────────────────────────

export function addTicketToCard(
  cardId: string,
  data: { ticketId: string; stampCount?: number }
): Promise<{ data: { id: string; cardId: string; ticketId: string; stampCount: number } }> {
  return apiPost(`/rewatch/cards/${cardId}/tickets`, data);
}

export function updateCardTicketStamps(
  cardId: string,
  ticketId: string,
  stampCount: number
): Promise<{ data: unknown }> {
  return apiPatch(`/rewatch/cards/${cardId}/tickets/${ticketId}`, { stampCount });
}

export function removeTicketFromCard(
  cardId: string,
  ticketId: string
): Promise<{ message: string }> {
  return apiDelete(`/rewatch/cards/${cardId}/tickets/${ticketId}`);
}

// ─── Voucher Usages ───────────────────────────────────────────────────────────

export function useVoucher(
  cardId: string,
  data: { rewardId: string; ticketId: string }
): Promise<{ data: { id: string } }> {
  return apiPost(`/rewatch/cards/${cardId}/voucher-usages`, data);
}

export function cancelVoucherUsage(usageId: string): Promise<{ message: string }> {
  return apiDelete(`/rewatch/voucher-usages/${usageId}`);
}

// ─── Merchandise Receipts ─────────────────────────────────────────────────────

export function updateMerchandiseReceipt(
  cardId: string,
  rewardId: string,
  received: boolean
): Promise<{ data: unknown }> {
  return apiPatch(`/rewatch/cards/${cardId}/merchandise-receipts/${rewardId}`, { received });
}
