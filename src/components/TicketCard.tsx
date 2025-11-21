import { useNavigate } from "react-router-dom";
import type { Ticket } from "@/services/ticketApi";
import { Calendar, Clock, MapPin, User, Users } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tickets/${ticket.id}`);
  };

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 시간 포맷팅 (HH:MM:SS -> HH:MM)
  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return timeString.split(":").slice(0, 2).join(":");
  };

  // 캐스팅 최대 4명까지만 표시
  const displayCasting = ticket.casting?.slice(0, 4) || [];

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* 티켓 메인 컨테이너 */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-primary/50 transition-all">
        {/* 티켓 상단 - 포스터 영역 */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {ticket.posterUrl ? (
            <img
              src={ticket.posterUrl}
              alt={ticket.performanceName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-gray-400 text-sm">포스터 없음</div>
            </div>
          )}
          {/* 오버레이 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* 공연명 */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-xl mb-1 line-clamp-2 drop-shadow-lg">
              {ticket.performanceName}
            </h3>
            {ticket.genre && (
              <span className="inline-block px-2 py-1 bg-primary/80 text-white text-xs rounded-md font-medium">
                {ticket.genre}
              </span>
            )}
          </div>
        </div>

        {/* 티켓 하단 - 정보 영역 */}
        <div className="p-5 space-y-3">
          {/* 날짜와 시간 */}
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                {formatDate(ticket.date)}
              </span>
            </div>
            {ticket.time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {formatTime(ticket.time)}
                </span>
              </div>
            )}
          </div>

          {/* 극장명 */}
          {ticket.theater && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 line-clamp-1">
                {ticket.theater}
              </span>
            </div>
          )}

          {/* 좌석 */}
          {ticket.seat && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{ticket.seat}</span>
            </div>
          )}

          {/* 캐스팅 */}
          {displayCasting.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {displayCasting.map((actor, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                  >
                    {actor}
                  </span>
                ))}
                {ticket.casting && ticket.casting.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                    +{ticket.casting.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 티켓 하단 구분선 효과 */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                티켓을 클릭하여 상세보기
              </span>
              {ticket.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-xs text-gray-600 font-medium">
                    {ticket.rating}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 티켓 왼쪽 구멍 효과 (비행기표 느낌) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-gray-100 rounded-full border-2 border-gray-300" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-gray-100 rounded-full border-2 border-gray-300" />
      </div>
    </div>
  );
}
