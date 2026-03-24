import { useState } from "react";
import { X } from "lucide-react";
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
    <Backdrop onClose={onClose}>
      <div
        className="w-full max-w-3xl bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 그라데이션 바 */}
        <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 flex-shrink-0" />

        {/* 헤더 - 항상 표시 */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 tracking-wide">공연</p>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {detail?.prfnm ?? (isLoading ? "" : "-")}
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

        {/* 본문 */}
        <div className="overflow-y-auto">
          {isLoading && (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          )}

          {error && !isLoading && (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "상세 정보를 불러오는데 실패했습니다."}
            </div>
          )}

          {detail && !isLoading && (
            <div className="flex gap-6 px-6 py-5">
              {/* 포스터 */}
              <div className="w-52 flex-shrink-0 self-start">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md">
                  {detail.poster && !imageError ? (
                    <img
                      src={detail.poster}
                      alt={detail.prfnm}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
                      <span className="text-white text-4xl font-bold opacity-90">
                        {detail.prfnm.charAt(0)}
                      </span>
                      <span className="text-white/60 text-xs mt-2">포스터 없음</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 정보 패널 */}
              <div className="flex-1 space-y-3 text-sm">
                <InfoRow label="공연 기간">
                  {formatDate(detail.prfpdfrom)} ~ {formatDate(detail.prfpdto)}
                </InfoRow>
                <InfoRow label="공연장">{detail.fcltynm || "-"}</InfoRow>
                <InfoRow label="공연 상태">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                      detail.prfstate === "공연중"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {detail.prfstate || "-"}
                  </span>
                </InfoRow>
                {detail.prfcast && (
                  <InfoRow label="출연진">{detail.prfcast}</InfoRow>
                )}
                {detail.prfruntime && (
                  <InfoRow label="런타임">{detail.prfruntime}</InfoRow>
                )}
                {detail.prfage && (
                  <InfoRow label="관람 연령">{detail.prfage}</InfoRow>
                )}
                {detail.pcseguidance && (
                  <InfoRow label="티켓 가격">{detail.pcseguidance}</InfoRow>
                )}
                {detail.dtguidance && (
                  <InfoRow label="공연 시간">
                    <span className="whitespace-pre-line">{detail.dtguidance}</span>
                  </InfoRow>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Backdrop>
  );

  return createPortal(modalContent, document.body);
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <span className="font-semibold text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
