import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useDeleteTicket } from "@/queries/tickets";
import { type ApiError } from "@/lib/apiClient";
import { toast } from "react-toastify";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, MapPin, Armchair, Users, Ticket, ShoppingBag, Calendar, Clock, Copy, Check } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, error } = useTicket(id);
  const deleteTicketMutation = useDeleteTicket();
  const [copied, setCopied] = useState(false);

  const handleCopyReview = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = () => {
    if (!id) return;

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">정말 삭제하시겠습니까?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeToast}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              onClick={async () => {
                closeToast();
                try {
                  await deleteTicketMutation.mutateAsync(id);
                  navigate("/records");
                } catch (err: unknown) {
                  console.error("티켓 삭제 오류:", err);
                }
              }}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    const errorMessage =
      (error && "error" in error ? (error as ApiError).error : null) || "티켓을 불러오는데 실패했습니다.";
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{errorMessage || "티켓을 찾을 수 없습니다."}</p>
          <Button onClick={() => navigate("/records")} className="mt-4">
            돌아가기
          </Button>
        </div>
      </Layout>
    );
  }

  const totalSpend = (ticket.ticketPrice ?? 0) + (ticket.mdPrice ?? 0);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* 상단 액션바 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/records")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
              className="flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              수정
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </Button>
          </div>
        </div>

        {/* 히어로 섹션 */}
        <div className="flex gap-6 bg-card rounded-xl border p-6">
          {/* 포스터 */}
          {ticket.posterUrl && (
            <div className="flex-shrink-0">
              <img
                src={ticket.posterUrl}
                alt={ticket.performanceName}
                className="w-52 rounded-lg object-cover shadow-md"
              />
            </div>
          )}

          {/* 공연 기본 정보 */}
          <div className="flex-1 min-w-0 space-y-2">
            {(ticket.genre || ticket.isChild !== undefined) && (
              <div className="flex gap-2">
                {ticket.genre && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {ticket.genre}
                  </span>
                )}
                {ticket.isChild && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    아동
                  </span>
                )}
              </div>
            )}
            <h1 className="text-xl font-bold leading-snug">{ticket.performanceName}</h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {ticket.date}
              </span>
              {ticket.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ticket.time.slice(0, 5)}
                </span>
              )}
              {ticket.theater && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {ticket.theater}
                </span>
              )}
            </div>

            {ticket.rating !== undefined && ticket.rating !== null && (
              <div className="flex items-center gap-2">
                <StarRating rating={ticket.rating} />
                <span className="text-xs text-muted-foreground">{ticket.rating}/5</span>
              </div>
            )}

            {/* 캐스팅 */}
            {ticket.casting && ticket.casting.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ticket.casting.map((actor, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 stat 바 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem icon={<Armchair className="w-4 h-4" />} label="좌석" value={ticket.seat} />
          <StatItem icon={<Users className="w-4 h-4" />} label="동행자" value={ticket.companion} />
          <StatItem
            icon={<Ticket className="w-4 h-4" />}
            label="티켓"
            value={ticket.ticketPrice ? `₩${ticket.ticketPrice.toLocaleString()}` : undefined}
          />
          <StatItem
            icon={<ShoppingBag className="w-4 h-4" />}
            label="MD"
            value={ticket.mdPrice ? `₩${ticket.mdPrice.toLocaleString()}` : undefined}
          />
        </div>

        {/* 총 지출 (둘 다 있을 때만) */}
        {ticket.ticketPrice && ticket.mdPrice ? (
          <div className="flex items-center justify-end gap-2 text-sm px-1">
            <span className="text-muted-foreground">총 지출</span>
            <span className="font-semibold">₩{totalSpend.toLocaleString()}</span>
          </div>
        ) : null}

        {/* 후기 */}
        {ticket.review && (
          <div className="bg-card rounded-xl border p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">공연 후기</p>
              <div className="relative">
                <button
                  onClick={() => handleCopyReview(ticket.review!)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                {copied && (
                  <span className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md">
                    복사되었습니다
                  </span>
                )}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.review}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-card rounded-xl border px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium truncate">{value ?? <span className="text-muted-foreground">-</span>}</p>
    </div>
  );
}
