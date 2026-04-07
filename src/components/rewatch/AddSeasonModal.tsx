import { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchPerformances } from "@/queries/kopis";
import { useCreateRewatchSeason } from "@/queries/rewatch";
import type { KopisPerformance } from "@/services/kopisApi";
import { normalizePerformanceName, cleanTheaterName } from "@/services/kopisApi";

interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSeasonModal({ isOpen, onClose }: AddSeasonModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data: pages, isLoading } = useSearchPerformances({
    searchTerm: submittedTerm,
    enabled: submittedTerm.length > 0,
    rows: 20,
  });

  const performances: KopisPerformance[] = pages?.pages.flat() ?? [];

  const { mutate: createSeason, isPending } = useCreateRewatchSeason();

  const handleSearch = () => {
    setSubmittedTerm(searchTerm.trim());
  };

  const handleClose = () => {
    setSearchTerm("");
    setSubmittedTerm("");
    onClose();
  };

  const handleSelect = (p: KopisPerformance) => {
    createSeason(
      {
        mt20id: p.mt20id,
        title: normalizePerformanceName(p.prfnm),
        posterUrl: p.poster || null,
        startDate: p.prfpdfrom || null,
        endDate: p.prfpdto || null,
        venue: p.fcltynm ? cleanTheaterName(p.fcltynm) : null,
      },
      { onSuccess: handleClose }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">재관람 극 추가</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 border-b">
          <div className="flex gap-2">
            <Input
              placeholder="작품명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!searchTerm.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : performances.length > 0 ? (
            <div className="space-y-2">
              {performances.map((p) => (
                <button
                  key={p.mt20id}
                  onClick={() => handleSelect(p)}
                  disabled={isPending}
                  className="w-full flex gap-3 p-3 rounded-lg border text-left hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {p.poster && (
                    <img
                      src={p.poster}
                      alt={p.prfnm}
                      className="w-10 h-14 object-cover rounded flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">{p.prfnm}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.fcltynm}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.prfpdfrom} ~ {p.prfpdto}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.genrenm}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : submittedTerm ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              검색 결과가 없습니다.
            </p>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-12">
              작품명을 입력하고 검색해주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
