import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePerformanceDetail } from "@/queries/reports/queries";

interface PerformanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceName: string;
}

export default function PerformanceDetailModal({
  isOpen,
  onClose,
  performanceName,
}: PerformanceDetailModalProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // API 호출
  const { data, isLoading, error } = usePerformanceDetail({
    performanceName,
  });

  // 모달이 열릴 때 이미지 에러 상태 리셋
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const performanceData = data?.performance;
  const tickets = data?.tickets || [];

  if (isLoading) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-2xl mx-4 bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            <div className="text-center text-gray-500">로딩 중...</div>
          </CardContent>
        </Card>
      </div>,
      document.body
    );
  }

  if (error || !performanceData) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-2xl mx-4 bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              데이터를 불러오는 중 오류가 발생했습니다.
            </div>
          </CardContent>
        </Card>
      </div>,
      document.body
    );
  }

  const maxViewCount = 50;
  const percentage = (performanceData.viewCount / maxViewCount) * 100;

  // 티켓 표시 텍스트 생성 (날짜 + 극장)
  const getTicketDisplayText = (performance: {
    date: string;
    name: string;
  }) => {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYMMDD)
    const dateStr = performance.date;
    return `${dateStr} ${performance.name}`;
  };

  const handleTicketClick = (ticketId: string) => {
    // 나중에 티켓 상세 페이지로 이동
    navigate(`/tickets/${ticketId}`);
    onClose(); // 모달 닫기
  };

  // 별점 표시
  const renderStars = (rating: number | undefined) => {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star className="w-5 h-5 fill-gray-300 text-gray-300 absolute" />
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 fill-gray-300 text-gray-300"
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl mx-4 bg-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 상단: 작품명과 닫기 버튼 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{performanceData.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 하단: 포스터와 상세 내용 */}
            <div className="flex items-start gap-6">
              {/* 왼쪽: 포스터 */}
              <div className="w-64 h-80 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                {performanceData.posterUrl && !imageError ? (
                  <img
                    src={performanceData.posterUrl}
                    alt={performanceData.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white text-center text-sm">
                    이미지 없음
                  </span>
                )}
              </div>

              {/* 오른쪽: 정보 패널 */}
              <div className="w-80 h-80 flex flex-col gap-5 overflow-hidden">
                {/* 관람 횟수 */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                    관람 횟수
                  </span>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium">
                      {performanceData.viewCount}회
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 max-w-xs">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 관람 금액 */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                    관람 금액
                  </span>
                  <span className="text-sm font-medium">
                    {performanceData.totalTicketPrice.toLocaleString()} 원
                  </span>
                </div>

                {/* 별점 */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                    별점
                  </span>
                  {renderStars(performanceData.avgRating)}
                </div>

                {/* 티켓 */}
                <div className="flex items-start gap-4 flex-1 min-h-0">
                  <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                    티켓
                  </span>
                  <div
                    className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden"
                    style={{ maxHeight: "calc(320px - 8rem)" }}
                  >
                    {tickets.length > 0 ? (
                      tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => handleTicketClick(ticket.id)}
                          className="text-sm text-gray-900 hover:text-blue-600 hover:underline text-left transition-colors py-1 truncate flex-shrink-0"
                        >
                          {getTicketDisplayText({
                            date: ticket.date,
                            name: performanceData.name,
                          })}
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        티켓 정보가 없습니다.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}
