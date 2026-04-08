import { useState } from "react";
import { Loader2, Search, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTicketsList } from "@/queries/tickets";
import { useAddTicketToCard } from "@/queries/rewatch";
import type { Ticket } from "@/services/ticketApi";

interface AddTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId: string;
  cardId: string;
  defaultSearch?: string;
  defaultPosterUrl?: string;
  defaultTheater?: string;
  alreadyAddedTicketIds: string[];
}

export function AddTicketDialog({
  isOpen,
  onClose,
  seasonId,
  cardId,
  defaultSearch = "",
  defaultPosterUrl = "",
  defaultTheater = "",
  alreadyAddedTicketIds,
}: AddTicketDialogProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [submittedTerm, setSubmittedTerm] = useState(defaultSearch);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [stampCount, setStampCount] = useState(1);

  const { data, isLoading } = useTicketsList(50, submittedTerm || undefined);
  const tickets = data?.pages.flatMap((p) => p.data) ?? [];
  const available = tickets.filter((t) => !alreadyAddedTicketIds.includes(t.id));

  const { mutate: addTicket, isPending } = useAddTicketToCard(seasonId);

  const handleSearch = () => {
    setSubmittedTerm(searchTerm.trim());
    setSelectedTicket(null);
  };

  const handleSubmit = () => {
    if (!selectedTicket) return;
    addTicket(
      { cardId, ticketId: selectedTicket.id, stampCount },
      {
        onSuccess: () => {
          onClose();
          setSelectedTicket(null);
          setStampCount(1);
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>티켓 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색 */}
          <div className="flex gap-2">
            <Input
              placeholder="작품명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* 티켓 목록 */}
          <div className="max-h-52 overflow-y-auto space-y-1 border rounded-md p-1">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : available.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">
                {submittedTerm ? "일치하는 티켓이 없습니다." : "작품명을 검색하거나 전체 목록을 확인하세요."}
              </p>
            ) : (
              available.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium flex-1 truncate">{ticket.performanceName}</span>
                  <span className="text-xs flex-shrink-0 opacity-70">{formatDate(ticket.date)}</span>
                </button>
              ))
            )}
          </div>

          {/* 도장 수 입력 */}
          {selectedTicket && (
            <div>
              <Label className="text-sm">도장 수</Label>
              <Input
                type="number"
                min={1}
                value={stampCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setStampCount(val);
                }}
                className="mt-1 w-28"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <button
            onClick={() => {
              onClose();
              const params = new URLSearchParams();
              params.set("performanceName", submittedTerm || defaultSearch);
              if (defaultPosterUrl) params.set("posterUrl", defaultPosterUrl);
              if (defaultTheater) params.set("theater", defaultTheater);
              params.set("returnTo", "/rewatch");
              navigate(`/tickets/new?${params.toString()}`);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <PenLine className="w-3 h-3" />
            새 기록 추가하기
          </button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedTicket || isPending}>
              추가
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
