import { useState, useEffect } from "react";
import { X, Star, Eye, Wallet, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { usePerformanceDetail } from "@/queries/reports/queries";

interface PerformanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceName: string;
}

function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      {children}
    </div>
  );
}

function StatusModal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Backdrop onClose={onClose}>
      <div
        className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400" />
        <div className="p-8 text-center text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </Backdrop>
  );
}

function renderStars(rating: number | undefined) {
  const safeRating = rating ?? 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
        <Star key={`empty-${i}`} className="w-4 h-4 fill-muted text-muted" />
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

  if (!isOpen) return null;

  if (isLoading)
    return createPortal(
      <StatusModal onClose={onClose}>불러오는 중...</StatusModal>,
      document.body
    );

  if (error || !data?.performance)
    return createPortal(
      <StatusModal onClose={onClose}>
        데이터를 불러오는 중 오류가 발생했습니다.
      </StatusModal>,
      document.body
    );

  const perf = data.performance;
  const tickets = data.tickets || [];

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
    onClose();
  };

  const hasPoster = !!perf.posterUrl && !imageError;

  const modalContent = (
    <Backdrop onClose={onClose}>
      <div
        className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 그라데이션 바 */}
        <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 flex-shrink-0" />

        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 tracking-wide">작품</p>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {perf.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 구분선 */}
        <div className="mx-6 border-t border-border flex-shrink-0" />

        {/* 본문 - 포스터 + 정보 */}
        <div className="flex gap-5 px-6 py-5">
          {/* 포스터 */}
          <div className="w-52 flex-shrink-0 self-start">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md">
              {hasPoster ? (
                <img
                  src={perf.posterUrl}
                  alt={perf.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
                  <span className="text-white text-4xl font-bold opacity-90">
                    {perf.name.charAt(0)}
                  </span>
                  <span className="text-white/60 text-xs mt-2">포스터 없음</span>
                </div>
              )}
            </div>
          </div>

          {/* 정보 패널 */}
          <div className="flex-1 flex flex-col gap-4">
            {/* 통계 카드 2개 */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
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
                <div className="bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min((perf.viewCount / 30) * 100, 100)}%`,
                      background: "hsl(var(--chart-1))",
                    }}
                  />
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
            <div className="flex items-center gap-3 flex-shrink-0 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">
                별점
              </span>
              {renderStars(perf.avgRating)}
            </div>

            {/* 구분선 */}
            <div className="border-t border-border flex-shrink-0" />

            {/* 관람 티켓 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  관람 티켓
                </p>
                <span className="text-xs text-muted-foreground">
                  {tickets.length}건
                </span>
              </div>
              {tickets.length > 0 ? (
                <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60 max-h-32 overflow-y-auto">
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
                          <span className="text-xs font-medium">{ticket.casting.join(", ")}</span>
                        )}
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
      </div>
    </Backdrop>
  );

  return createPortal(modalContent, document.body);
}
