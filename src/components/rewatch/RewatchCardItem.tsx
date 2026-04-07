import { useState } from "react";
import { Plus, X, Ticket, Gift, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteRewatchCard,
  useRemoveTicketFromCard,
  useUpdateCardTicketStamps,
  useUseVoucher,
  useCancelVoucherUsage,
  useUpdateMerchandise,
} from "@/queries/rewatch";
import type { RewatchCardDetail, RewatchMilestoneDetail } from "@/services/rewatchApi";
import { AddTicketDialog } from "./AddTicketDialog";

interface RewatchCardItemProps {
  seasonId: string;
  seasonTitle: string;
  card: RewatchCardDetail;
  milestones: RewatchMilestoneDetail[];
  cardIndex: number;
  allUsedTicketIds: string[];
  allSeasonTickets: RewatchCardDetail["tickets"];
}

function StampCountInput({
  stampCount,
  onCommit,
}: {
  stampCount: number;
  onCommit: (val: number, onSettled: () => void) => void;
}) {
  const [value, setValue] = useState(String(stampCount));
  const [isCommitting, setIsCommitting] = useState(false);

  const commit = () => {
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 1 && val !== stampCount) {
      setIsCommitting(true);
      onCommit(val, () => setIsCommitting(false));
    } else {
      setValue(String(stampCount));
    }
  };

  return (
    <>
      <Input
        type="number"
        min={1}
        value={value}
        disabled={isCommitting}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="w-14 h-6 text-xs px-1.5 text-center"
      />
      <span className="w-4 flex items-center justify-center text-muted-foreground">
        {isCommitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "개"}
      </span>
    </>
  );
}

function StampGrid({ total, max }: { total: number; max: number }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-sm flex-shrink-0 ${
            i < total ? "bg-primary" : "bg-muted border border-border"
          }`}
        />
      ))}
    </div>
  );
}

export function RewatchCardItem({
  seasonId,
  seasonTitle,
  card,
  milestones,
  cardIndex,
  allUsedTicketIds,
  allSeasonTickets,
}: RewatchCardItemProps) {
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [voucherTicketId, setVoucherTicketId] = useState<string>("");
  const [voucherRewardId, setVoucherRewardId] = useState<string>("");
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { mutate: deleteCard } = useDeleteRewatchCard(seasonId);
  const { mutate: removeTicket } = useRemoveTicketFromCard(seasonId);
  const { mutate: updateStamps } = useUpdateCardTicketStamps(seasonId);
  const { mutate: useVoucher, isPending: isUsingVoucher } = useUseVoucher(seasonId);
  const { mutate: cancelVoucher } = useCancelVoucherUsage(seasonId);
  const { mutate: updateMerchandise } = useUpdateMerchandise(seasonId);

  const maxStamps = milestones.length > 0 ? Math.max(...milestones.map((m) => m.stampCount)) : 10;
  const label = card.label || `${cardIndex}번 카드`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const openVoucherDialog = (rewardId: string) => {
    setVoucherRewardId(rewardId);
    setVoucherTicketId(allSeasonTickets[0]?.ticketId ?? "");
    setIsVoucherOpen(true);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        <button
          onClick={() => {
            if (confirm(`"${label}"을 삭제하시겠습니까?`)) deleteCard(card.id);
          }}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 스탬프 현황 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {card.totalStamps} / {maxStamps} 도장
          </span>
        </div>
        <StampGrid total={card.totalStamps} max={maxStamps} />
      </div>

      {/* 재관람 혜택 달성 현황 */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          {milestones.map((m) => {
            const status = card.milestoneStatuses.find((s) => s.milestoneId === m.id);
            const achieved = status?.achieved ?? false;

            return (
              <div key={m.id} className="space-y-1">
                {m.rewards.map((reward) => {
                  const rewardStatus = status?.rewardStatuses.find((rs) => rs.rewardId === reward.id);

                  if (reward.rewardType === "DISCOUNT_VOUCHER") {
                    const remaining = rewardStatus?.voucherRemaining ?? (reward.voucherQty ?? 1);
                    const usages = rewardStatus?.usages ?? [];

                    return (
                      <div
                        key={reward.id}
                        className={`rounded-md px-3 py-2 text-xs ${
                          achieved
                            ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Ticket className={`w-3.5 h-3.5 flex-shrink-0 ${achieved ? "text-blue-500" : "text-muted-foreground"}`} />
                          <span className="font-medium">{m.stampCount}회</span>
                          <span className="text-muted-foreground">→</span>
                          <span>
                            {reward.discountPercent ? `${reward.discountPercent}% 할인권` : "할인권"}
                            {reward.voucherQty && reward.voucherQty > 1 ? ` ×${reward.voucherQty}` : ""}
                          </span>
                          {achieved ? (
                            <>
                              <span className="ml-auto text-blue-600 dark:text-blue-400 font-medium">
                                잔여 {remaining}장
                              </span>
                              {remaining > 0 && allSeasonTickets.length > 0 && (
                                <button
                                  onClick={() => openVoucherDialog(reward.id)}
                                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                                >
                                  사용 처리
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="ml-auto text-muted-foreground">
                              {card.totalStamps}/{m.stampCount}
                            </span>
                          )}
                        </div>
                        {/* 사용 이력 */}
                        {usages.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {usages.map((u) => {
                              const ticket = allSeasonTickets.find((t) => t.ticketId === u.ticketId);
                              return (
                                <div key={u.id} className="flex items-center gap-1 text-muted-foreground">
                                  <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                  <span>
                                    {ticket ? formatDate(ticket.date) : "할인권"} 사용
                                  </span>
                                  <button
                                    disabled={cancellingId === u.id}
                                    onClick={() => {
                                      setCancellingId(u.id);
                                      cancelVoucher(u.id, { onSettled: () => setCancellingId(null) });
                                    }}
                                    className="ml-auto hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    취소
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    const received = rewardStatus?.merchandiseReceived ?? false;
                    return (
                      <div
                        key={reward.id}
                        className={`rounded-md px-3 py-2 text-xs ${
                          achieved
                            ? "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Gift className={`w-3.5 h-3.5 flex-shrink-0 ${achieved ? "text-purple-500" : "text-muted-foreground"}`} />
                          <span className="font-medium">{m.stampCount}회</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{reward.merchandiseDesc || "굿즈"}</span>
                          {achieved ? (
                            <label className="ml-auto flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={received}
                                onChange={(e) =>
                                  updateMerchandise({
                                    cardId: card.id,
                                    rewardId: reward.id,
                                    received: e.target.checked,
                                  })
                                }
                                className="w-3.5 h-3.5"
                              />
                              <span className={received ? "text-purple-600 dark:text-purple-400 font-medium" : ""}>
                                {received ? "수령 완료" : "수령 처리"}
                              </span>
                            </label>
                          ) : (
                            <span className="ml-auto text-muted-foreground">
                              {card.totalStamps}/{m.stampCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* 티켓 목록 */}
      {card.tickets.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">등록된 관람</p>
          {card.tickets.map((ct) => (
            <div key={ct.id} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground w-20 flex-shrink-0">{formatDate(ct.date)}</span>
              <span className="flex-1 truncate">{ct.performanceName}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <StampCountInput
                  stampCount={ct.stampCount}
                  onCommit={(val, onSettled) =>
                    updateStamps(
                      { cardId: card.id, ticketId: ct.ticketId, stampCount: val },
                      { onSuccess: onSettled, onError: onSettled }
                    )
                  }
                />
              </div>
              <button
                onClick={() => removeTicket({ cardId: card.id, ticketId: ct.ticketId })}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 티켓 추가 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAddTicketOpen(true)}
        className="w-full gap-1 text-xs h-7"
      >
        <Plus className="w-3 h-3" />
        티켓 추가
      </Button>

      {/* 할인권 사용 처리 다이얼로그 */}
      {isVoucherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-lg p-5 w-80">
            <h3 className="font-semibold mb-3">할인권 사용 처리</h3>
            <p className="text-sm text-muted-foreground mb-3">어느 티켓에서 사용했나요?</p>
            <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto">
              {allSeasonTickets.map((ct) => (
                <button
                  key={ct.ticketId}
                  onClick={() => setVoucherTicketId(ct.ticketId)}
                  className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                    voucherTicketId === ct.ticketId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {formatDate(ct.date)} — {ct.performanceName}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsVoucherOpen(false)}>
                취소
              </Button>
              <Button
                size="sm"
                disabled={!voucherTicketId || isUsingVoucher}
                onClick={() => {
                  useVoucher(
                    { cardId: card.id, rewardId: voucherRewardId, ticketId: voucherTicketId },
                    { onSuccess: () => setIsVoucherOpen(false) }
                  );
                }}
              >
                사용 처리
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddTicketDialog
        isOpen={isAddTicketOpen}
        onClose={() => setIsAddTicketOpen(false)}
        seasonId={seasonId}
        cardId={card.id}
        defaultSearch={seasonTitle}
        alreadyAddedTicketIds={allUsedTicketIds}
      />
    </div>
  );
}
