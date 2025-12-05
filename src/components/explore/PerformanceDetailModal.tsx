import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { usePerformanceDetail } from "@/queries/kopis";

interface PerformanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mt20id: string | null;
}

export default function PerformanceDetailModal({
  isOpen,
  onClose,
  mt20id,
}: PerformanceDetailModalProps) {
  const {
    data: detail,
    isLoading,
    error,
  } = usePerformanceDetail(isOpen && mt20id ? mt20id : undefined);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    // YYYYMMDD 형식을 YYYY.MM.DD로 변환
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}.${dateStr.substring(
        4,
        6
      )}.${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500">정보를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              {error instanceof Error
                ? error.message
                : "상세 정보를 불러오는데 실패했습니다."}
            </div>
          )}

          {detail && !isLoading && (
            <div className="space-y-6">
              {/* 제목과 닫기 버튼 */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{detail.prfnm}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 포스터와 모든 정보 */}
              <div className="flex gap-6 mb-6">
                {detail.poster && (
                  <img
                    src={detail.poster}
                    alt={detail.prfnm}
                    className="w-64 h-80 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연 기간:
                      </span>{" "}
                      {formatDate(detail.prfpdfrom)} ~{" "}
                      {formatDate(detail.prfpdto)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연장:
                      </span>{" "}
                      {detail.fcltynm || "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연 상태:
                      </span>{" "}
                      {detail.prfstate || "-"}
                    </div>
                    {detail.prfcast && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          출연진:
                        </span>{" "}
                        {detail.prfcast}
                      </div>
                    )}
                    {detail.prfruntime && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          런타임:
                        </span>{" "}
                        {detail.prfruntime}
                      </div>
                    )}
                    {detail.prfage && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          관람 연령:
                        </span>{" "}
                        {detail.prfage}
                      </div>
                    )}
                    {detail.pcseguidance && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          티켓 가격:
                        </span>{" "}
                        {detail.pcseguidance}
                      </div>
                    )}
                    {detail.dtguidance && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          공연 시간:
                        </span>{" "}
                        <p className="text-sm whitespace-pre-line inline">
                          {detail.dtguidance}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

