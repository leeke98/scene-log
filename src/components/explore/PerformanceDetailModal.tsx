import { useState } from "react";
import { X, Calendar, Clock, MapPin, Users, Ticket, Baby } from "lucide-react";
import { createPortal } from "react-dom";
import { usePerformanceDetail } from "@/queries/kopis";

interface PerformanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mt20id: string | null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
  }
  return dateStr;
}

export default function PerformanceDetailModal({
  isOpen,
  onClose,
  mt20id,
}: PerformanceDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  const {
    data: detail,
    isLoading,
    error,
  } = usePerformanceDetail(isOpen && mt20id ? mt20id : undefined);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 히어로 포스터 배너 */}
        <div className="relative h-52 sm:h-64 flex-shrink-0 overflow-hidden">
          {detail?.poster && !imageError ? (
            <img
              src={detail.poster}
              alt={detail.prfnm}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-700" />
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 포스터 위 텍스트 */}
          {detail && !isLoading && (
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold mb-2 ${
                  detail.prfstate === "공연중"
                    ? "bg-emerald-500/90 text-white"
                    : detail.prfstate === "공연예정"
                      ? "bg-amber-500/90 text-white"
                      : "bg-white/20 text-white/90"
                }`}
              >
                {detail.prfstate || "-"}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight break-keep">
                {detail.prfnm}
              </h2>
              {detail.fcltynm && (
                <p className="text-sm text-white/70 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {detail.fcltynm}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="overflow-y-auto">
          {isLoading && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          )}

          {error && !isLoading && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "상세 정보를 불러오는데 실패했습니다."}
            </div>
          )}

          {detail && !isLoading && (
            <div className="px-5 py-4 space-y-4">
              {/* 핵심 정보 카드 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={<Calendar className="w-4 h-4" />}
                  label="공연 기간"
                  value={`${formatDate(detail.prfpdfrom)} ~ ${formatDate(detail.prfpdto)}`}
                />
                {detail.prfruntime && (
                  <InfoCard
                    icon={<Clock className="w-4 h-4" />}
                    label="런타임"
                    value={detail.prfruntime}
                  />
                )}
              </div>

              {/* 상세 정보 리스트 */}
              <div className="space-y-1">
                {detail.prfcast && (
                  <InfoItem
                    icon={<Users className="w-4 h-4" />}
                    label="출연진"
                    value={detail.prfcast}
                  />
                )}
                {detail.prfage && (
                  <InfoItem
                    icon={<Baby className="w-4 h-4" />}
                    label="관람 연령"
                    value={detail.prfage}
                  />
                )}
                {detail.pcseguidance && (
                  <InfoItem
                    icon={<Ticket className="w-4 h-4" />}
                    label="티켓 가격"
                    value={detail.pcseguidance}
                  />
                )}
                {detail.dtguidance && (
                  <InfoItem
                    icon={<Clock className="w-4 h-4" />}
                    label="공연 시간"
                    value={detail.dtguidance}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-border/50 last:border-b-0">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}
