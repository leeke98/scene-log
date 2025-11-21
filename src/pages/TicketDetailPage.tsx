import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useDeleteTicket } from "@/queries/tickets";
import { toast } from "react-toastify";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, error } = useTicket(id);
  const deleteTicketMutation = useDeleteTicket();

  const handleDelete = () => {
    if (!id) return;

    // 커스텀 확인 toast
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
                } catch (err: any) {
                  // 에러는 mutation의 onError에서 처리됨
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
      (error as any)?.error || "티켓을 불러오는데 실패했습니다.";
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">
            {errorMessage || "티켓을 찾을 수 없습니다."}
          </p>
          <Button onClick={() => navigate("/records")} className="mt-4">
            돌아가기
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{ticket.performanceName}</CardTitle>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.posterUrl && (
            <div className="flex justify-center">
              <img
                src={ticket.posterUrl}
                alt={ticket.performanceName}
                className="max-w-xs rounded-md"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">관람 일시</p>
              <p className="font-medium">
                {ticket.date}
                {ticket.time && ` ${ticket.time}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">별점</p>
              <p className="font-medium">⭐ {ticket.rating}/5</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">극장</p>
              <p className="font-medium">{ticket.theater || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">좌석</p>
              <p className="font-medium">{ticket.seat || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-2">캐스팅</p>
              <div className="flex flex-wrap gap-2">
                {ticket.casting && ticket.casting.length > 0 ? (
                  ticket.casting.map((actor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {actor}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">동행자</p>
              <p className="font-medium">{ticket.companion || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">티켓 가격</p>
              <p className="font-medium">
                {ticket.ticketPrice
                  ? `₩${ticket.ticketPrice.toLocaleString()}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">MD 가격</p>
              <p className="font-medium">
                {ticket.mdPrice ? `₩${ticket.mdPrice.toLocaleString()}` : "-"}
              </p>
            </div>
          </div>

          {ticket.review && (
            <div>
              <p className="text-sm text-gray-500 mb-2">공연 후기</p>
              <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {ticket.review}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/records")}
              className="flex-1"
            >
              목록으로
            </Button>
            <Button
              onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
              className="flex-1"
            >
              수정
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
