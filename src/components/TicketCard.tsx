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
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl h-full"
    >
      {/* 티켓 메인 컨테이너 - 모바일: 가로형, sm 이상: 세로형 */}
      <div className="relative bg-gradient-to-br from-background to-muted/50 rounded-2xl shadow-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all flex flex-row sm:flex-col h-full">
        {/* 티켓 포스터 영역 - 모바일: 왼쪽 고정폭, sm 이상: 상단 */}
        <div className="relative w-28 shrink-0 sm:w-full sm:h-64 bg-gradient-to-br from-muted to-muted/80 overflow-hidden">
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/80 gap-2">
              <span className="text-5xl font-bold text-muted-foreground/40">
                {ticket.performanceName.charAt(0)}
              </span>
              {ticket.genre && (
                <span className="text-xs text-muted-foreground/60 font-medium tracking-wide uppercase">
                  {ticket.genre}
                </span>
              )}
            </div>
          )}
          {/* 오버레이 그라데이션 - sm 이상만 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent hidden sm:block" />

          {/* 공연명 - sm 이상에서만 포스터 위에 표시 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 hidden sm:block">
            <h3 className="text-white font-bold text-xl mb-1 line-clamp-2 drop-shadow-lg">
              {ticket.performanceName}
            </h3>
            {ticket.genre && (
              <span className="inline-block px-2 py-1 bg-primary/80 text-primary-foreground text-xs rounded-md font-medium">
                {ticket.genre}
              </span>
            )}
          </div>
        </div>

        {/* 티켓 정보 영역 */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-2 sm:gap-3 min-w-0">
          {/* 모바일에서만 공연명 표시 */}
          <div className="sm:hidden mb-1">
            <h3 className="font-bold text-base line-clamp-2 text-foreground">
              {ticket.performanceName}
            </h3>
            {ticket.genre && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
                {ticket.genre}
              </span>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            {/* 날짜와 시간 */}
            <div className="flex items-center gap-3 sm:gap-4 text-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">
                  {formatDate(ticket.date)}
                </span>
              </div>
              {ticket.time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium">
                    {formatTime(ticket.time)}
                  </span>
                </div>
              )}
            </div>

            {/* 극장명 */}
            {ticket.theater && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-foreground line-clamp-1">
                  {ticket.theater}
                </span>
              </div>
            )}

            {/* 좌석 */}
            {ticket.seat && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-foreground">{ticket.seat}</span>
              </div>
            )}

            {/* 캐스팅 */}
            {displayCasting.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1">
                  {displayCasting.map((actor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                    >
                      {actor}
                    </span>
                  ))}
                  {ticket.casting && ticket.casting.length > 4 && (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted text-muted-foreground rounded-md text-xs">
                      +{ticket.casting.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 별점 */}
          {ticket.rating != null && ticket.rating > 0 && (
            <div className="pt-2 sm:pt-3 border-t border-border">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs sm:text-sm ${i < ticket.rating! ? "text-yellow-400" : "text-muted-foreground/30"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 티켓 구멍 효과 - 모바일: 상하, sm 이상: 좌우 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-muted rounded-full border-2 border-border sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:-translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-muted rounded-full border-2 border-border sm:left-auto sm:right-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:translate-x-1/2 sm:translate-y-0" />
      </div>
    </div>
  );
}
