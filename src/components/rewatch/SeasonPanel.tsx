import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRewatchSeasonDetail } from "@/queries/rewatch";
import { useDeleteRewatchSeason, useAddRewatchCard } from "@/queries/rewatch";
import type { RewatchSeasonSummary } from "@/services/rewatchApi";
import { MilestoneSection } from "./MilestoneSection";
import { RewatchCardItem } from "./RewatchCardItem";

interface SeasonPanelProps {
  season: RewatchSeasonSummary;
}

export function SeasonPanel({ season }: SeasonPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: detail, isLoading: isLoadingDetail } = useRewatchSeasonDetail(
    isExpanded ? season.id : null
  );

  const { mutate: deleteSeason, isPending: isDeleting } = useDeleteRewatchSeason();
  const { mutate: addCard, isPending: isAddingCard } = useAddRewatchCard(season.id);

  const formatDateRange = () => {
    if (!season.startDate && !season.endDate) return null;
    const parts = [season.startDate, season.endDate].filter(Boolean);
    if (parts.length === 2) return `${season.startDate} ~ ${season.endDate}`;
    return parts[0];
  };

  const totalStampsAll = season.cards.reduce((sum, c) => sum + c.totalStamps, 0);
  const summaryParts: string[] = [];
  if (season.milestones.length > 0) {
    const stampCounts = [...season.milestones.map((m) => m.stampCount)].sort((a, b) => a - b);
    summaryParts.push(`${stampCounts.join(" / ")}회차 혜택`);
  }
  if (totalStampsAll > 0) summaryParts.push(`현재 총 ${totalStampsAll}개 적립`);
  summaryParts.push(`발급 카드 ${season.cardCount}개`);

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* 시즌 헤더 */}
      <div className="flex gap-4 p-4">
        {season.posterUrl && (
          <img
            src={season.posterUrl}
            alt={season.title}
            className="w-14 h-20 object-cover rounded flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-snug">{season.title}</h3>
            <button
              onClick={() => {
                if (confirm(`"${season.title}"을(를) 삭제하시겠습니까?\n모든 카드와 기록이 함께 삭제됩니다.`)) {
                  deleteSeason(season.id);
                }
              }}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {season.venue && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{season.venue}</span>
            </div>
          )}

          {formatDateRange() && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{formatDateRange()}</span>
            </div>
          )}

          {/* 요약 */}
          <p className="mt-2 text-xs text-muted-foreground">
            {summaryParts.join(" | ")}
          </p>
        </div>
      </div>

      {/* 펼치기/접기 버튼 */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground border-t hover:bg-muted/50 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            접기
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            카드 관리
          </>
        )}
      </button>

      {/* 펼쳐진 내용 */}
      {isExpanded && (
        <div className="border-t p-4 space-y-5 bg-muted/20">
          {/* 마일스톤 섹션 */}
          <MilestoneSection seasonId={season.id} milestones={season.milestones} />

          <hr className="border-border" />

          {/* 카드 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">카드</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addCard({ label: null })}
                disabled={isAddingCard}
                className="h-7 px-2 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                추가
              </Button>
            </div>

            {isLoadingDetail ? (
              <p className="text-xs text-muted-foreground text-center py-4">불러오는 중...</p>
            ) : detail && detail.cards.length > 0 ? (
              <div className="space-y-3">
                {detail.cards.map((card, idx) => {
                  const allUsedTicketIds = detail.cards.flatMap((c) =>
                    c.tickets.map((t) => t.ticketId)
                  );
                  const allSeasonTickets = detail.cards.flatMap((c) => c.tickets);
                  return (
                  <RewatchCardItem
                    key={card.id}
                    seasonId={season.id}
                    seasonTitle={season.title}
                    card={card}
                    milestones={detail.milestones}
                    cardIndex={idx + 1}
                    allUsedTicketIds={allUsedTicketIds}
                    allSeasonTickets={allSeasonTickets}
                  />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                카드를 추가해 관람 기록을 시작하세요.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
