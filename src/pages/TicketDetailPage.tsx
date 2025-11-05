import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/contexts/TicketContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTicket, deleteTicket } = useTickets();

  const ticket = id ? getTicket(id) : undefined;

  if (!ticket) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">티켓을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            돌아가기
          </Button>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteTicket(ticket.id);
      navigate("/");
    }
  };

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
                {ticket.ticketPrice ? `₩${ticket.ticketPrice.toLocaleString()}` : "-"}
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
              onClick={() => navigate("/")}
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

