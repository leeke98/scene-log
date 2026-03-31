import { useState, useEffect } from "react";
import { X, Star, Eye, Wallet, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { usePerformanceDetail } from "@/queries/reports/queries";
import { EmptyState } from "@/components/ui/empty-state";

interface PerformanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceName: string;
}

function renderStars(rating: number | undefined) {
  const safeRating = rating ?? 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          <Star className="w-4 h-4 fill-muted text-muted absolute" />
          <div className="absolute overflow-hidden" style={{ width: "50%" }}>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 fill-muted text-muted"
        />
      ))}
      <span className="ml-1.5 text-sm font-medium tabular-nums">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
}

export default function PerformanceDetailModal({
  isOpen,
  onClose,
  performanceName,
}: PerformanceDetailModalProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const { data, isLoading, error } = usePerformanceDetail({ performanceName });

  useEffect(() => {
    if (isOpen) setImageError(false);
  }, [isOpen]);

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
  if (isLoading || error || !data?.performance) {
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
            : "데이터를 불러오는 중 오류가 발생했습니다."}
        </div>
      </div>,
      document.body
    );
  }

  const perf = data.performance;
  const tickets = data.tickets || [];
  const hasPoster = !!perf.posterUrl && !imageError;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 (모바일) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* 포스터 배너 (넓게) */}
        <div className="relative w-full h-48 sm:h-56 flex-shrink-0 bg-muted overflow-hidden">
          {hasPoster ? (
            <img
              src={perf.posterUrl}
              alt={perf.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
              <span className="text-white text-5xl font-bold opacity-90">
                {perf.name.charAt(0)}
              </span>
              <span className="text-white/60 text-xs mt-2">포스터 없음</span>
            </div>
          )}
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 포스터 위 제목 */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
              {perf.name}
            </h2>
            {perf.genre && (
              <span className="text-xs text-white/80 mt-0.5">{perf.genre}</span>
            )}
          </div>
        </div>

        {/* 통계 영역 (고정) */}
        <div className="flex-shrink-0 p-4 sm:p-5 space-y-4">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Eye className="w-3.5 h-3.5" />
                관람 횟수
              </div>
              <div className="text-xl font-bold">
                {perf.viewCount}
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
                {perf.totalTicketPrice.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  원
                </span>
              </div>
            </div>
          </div>

          {/* 별점 */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">
              별점
            </span>
            {renderStars(perf.avgRating)}
          </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ticket.date}
                    </span>
                    {ticket.casting && ticket.casting.length > 0 && (
                      <span className="text-xs font-medium">
                        {ticket.casting.join(", ")}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState message="티켓 정보가 없습니다." variant="inline" size="sm" />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
