import { useEffect } from "react";
import { X, ChevronRight, Eye, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useActorDetail } from "@/queries/reports/queries";

// 작품 태그 색상 (jewel tone, 순환)
const tagColors = [
  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40",
  "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
  "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40",
  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
];

interface ActorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  actorName: string;
  year?: string;
  month?: string;
}

export default function ActorDetailModal({
  isOpen,
  onClose,
  actorName,
  year,
  month,
}: ActorDetailModalProps) {
  const navigate = useNavigate();

  const { data: actorDetail, isLoading, error } = useActorDetail({
    actorName,
    year,
    month,
  });

  // 바텀시트 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  // 로딩/에러 상태
  if (isLoading || error || !actorDetail) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={handleBackdropClick}
      >
        <div
          className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border p-8 text-center text-sm text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading
            ? "불러오는 중..."
            : "데이터를 불러올 수 없습니다."}
        </div>
      </div>,
      document.body
    );
  }

  const actor = actorDetail.actor;
  const tickets = actorDetail.tickets.map((ticket) => ({
    id: ticket.id,
    date: ticket.date,
    performanceName: ticket.performanceName,
  }));

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[80vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 (모바일) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* 헤더 */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2 sm:px-5 sm:pt-5 flex-shrink-0">
          <div>
            <span className="text-xs text-muted-foreground">배우</span>
            <h2 className="text-xl font-bold tracking-tight leading-tight">
              {actor.actorName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 통계 영역 (고정) */}
        <div className="flex-shrink-0 p-4 sm:p-5 space-y-4">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Eye className="w-3.5 h-3.5" />
                총 관람 횟수
              </div>
              <div className="text-xl font-bold">
                {actor.viewCount}
                <span className="text-sm font-normal text-muted-foreground ml-0.5">
                  회
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Wallet className="w-3.5 h-3.5" />
                관람 금액
              </div>
              <div className="text-base font-bold leading-tight mt-1">
                {actor.totalTicketPrice.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  원
                </span>
              </div>
            </div>
          </div>

          {/* 관람 작품 태그 */}
          {actor.performanceList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                관람 작품
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actor.performanceList.map((performance, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      tagColors[idx % tagColors.length]
                    }`}
                  >
                    {performance}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-border mx-4 sm:mx-5 flex-shrink-0" />

        {/* 관람 티켓 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              관람 티켓
            </p>
            <span className="text-xs text-muted-foreground">
              {tickets.length}건
            </span>
          </div>
          {tickets.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                      {ticket.date}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {ticket.performanceName}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              티켓 정보가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
