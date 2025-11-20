import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useActorDetail } from "@/queries/reports/queries";

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

  // 배우 상세 정보 가져오기
  const { data: actorDetail, isLoading } = useActorDetail({
    actorName,
    year,
    month,
  });

  if (!isOpen) return null;

  // 로딩 중이거나 데이터가 없을 때
  if (isLoading) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-lg mx-4 bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            <div className="text-center">로딩 중...</div>
          </CardContent>
        </Card>
      </div>,
      document.body
    );
  }

  if (!actorDetail) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-lg mx-4 bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            <div className="text-center">데이터를 불러올 수 없습니다.</div>
          </CardContent>
        </Card>
      </div>,
      document.body
    );
  }

  const actor = actorDetail.actor;
  const actorData = {
    name: actor.actorName,
    totalViewCount: actor.viewCount,
    watchedPerformances: actor.performanceList,
    totalAmount: actor.totalTicketPrice,
    tickets: actorDetail.tickets.map((ticket) => ({
      id: ticket.id,
      displayText: `${ticket.date} ${ticket.performanceName}`,
    })),
  };

  const handleTicketClick = (ticketId: string) => {
    // 나중에 티켓 상세 페이지로 이동
    navigate(`/tickets/${ticketId}`);
    onClose(); // 모달 닫기
  };

  const maxViewCount = 30;
  const percentage = (actorData.totalViewCount / maxViewCount) * 100;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 bg-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 배우명과 닫기 버튼 - 동일 선상 */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{actorData.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 배우 상세 정보 - 2컬럼 레이아웃 */}
            <div className="space-y-5">
              {/* 총 관람 횟수 */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                  총 관람 횟수
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium">
                    {actorData.totalViewCount}회
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 max-w-xs">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 관람 작품 */}
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                  관람 작품
                </span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {actorData.watchedPerformances.map((performance, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-800"
                    >
                      {performance}
                    </span>
                  ))}
                </div>
              </div>

              {/* 관람 금액 */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                  관람 금액
                </span>
                <span className="text-sm font-medium">
                  {actorData.totalAmount.toLocaleString()} 원
                </span>
              </div>

              {/* 관람 티켓 */}
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                  관람 티켓
                </span>
                <div className="flex flex-col gap-1 flex-1 max-h-32 overflow-y-auto">
                  {actorData.tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket.id)}
                      className="text-sm text-gray-900 hover:text-blue-600 hover:underline text-left transition-colors py-1"
                    >
                      {ticket.displayText}
                    </button>
                  ))}
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
