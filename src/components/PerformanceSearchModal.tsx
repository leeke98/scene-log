import { X, Search, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { formatDateToISO } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/DatePicker";
import { usePerformanceSearch } from "@/hooks/usePerformanceSearch";
import { EmptyState } from "@/components/ui/empty-state";

interface PerformanceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (performance: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
  }) => void;
  selectedDate?: Date | string;
  onDateChange?: (date: Date | null) => void;
  selectedGenre?: "연극" | "뮤지컬";
  onGenreChange?: (genre: "연극" | "뮤지컬") => void;
}

export default function PerformanceSearchModal({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  onDateChange,
  selectedGenre,
  onGenreChange,
}: PerformanceSearchModalProps) {
  const {
    searchTerm,
    setSearchTerm,
    genre,
    setGenre,
    modalDate,
    canSearch,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    performances,
    error,
    handleDateChange: handleDateChangeInternal,
    handleScroll,
    handleSelectPerformance,
    handleKeyPress,
    handleSearchClick,
  } = usePerformanceSearch({ selectedDate, selectedGenre, onSelect, onClose });

  if (!isOpen) return null;

  const handleDateChange = (dateString: string | null) => {
    handleDateChangeInternal(dateString);
    if (onDateChange) {
      onDateChange(
        dateString
          ? (() => {
              const [year, month, day] = dateString.split("-").map(Number);
              return new Date(year, month - 1, day);
            })()
          : null
      );
    }
  };

  const handleGenreChange = (next: "AAAA" | "GGGA") => {
    setGenre(next);
    if (onGenreChange) {
      onGenreChange(next === "AAAA" ? "연극" : "뮤지컬");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">공연 검색</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 검색 영역 */}
        <div className="p-6 border-b space-y-4">
          {/* 날짜 선택 */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              공연 날짜
            </Label>
            <div className="max-w-xs">
              <DatePicker
                value={modalDate ? formatDateToISO(modalDate) : undefined}
                onChange={handleDateChange}
                placeholder="공연 날짜를 선택하세요"
                size="small"
              />
            </div>
            {modalDate ? (
              <p className="text-xs text-muted-foreground mt-1">
                선택된 날짜 기준으로 검색됩니다 (
                {modalDate.toLocaleDateString("ko-KR")})
              </p>
            ) : (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ 날짜를 선택하지 않으면 검색 결과가 부정확할 수 있습니다.
              </p>
            )}
          </div>

          {/* 장르 선택 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">장르 선택</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={genre === "AAAA" ? "default" : "outline"}
                onClick={() => handleGenreChange("AAAA")}
                className="flex-1"
              >
                연극
              </Button>
              <Button
                type="button"
                variant={genre === "GGGA" ? "default" : "outline"}
                onClick={() => handleGenreChange("GGGA")}
                className="flex-1"
              >
                뮤지컬
              </Button>
            </div>
          </div>

          {/* 작품명 검색 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              작품명 검색
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="작품명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSearchClick}
                disabled={isLoading || !canSearch}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-6" onScroll={handleScroll}>
          {isLoading && !performances.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : performances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performances.map((performance) => (
                <div
                  key={performance.mt20id}
                  onClick={() => handleSelectPerformance(performance)}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="flex gap-3">
                    {performance.poster && (
                      <img
                        src={performance.poster}
                        alt={performance.prfnm}
                        className="w-14 h-20 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1.5 leading-snug">
                        {performance.prfnm}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        <span className="font-medium">기간:</span>{" "}
                        {performance.prfpdfrom} ~ {performance.prfpdto}
                      </p>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        <span className="font-medium">극장:</span>{" "}
                        {performance.fcltynm}
                      </p>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        <span className="font-medium">지역:</span>{" "}
                        {performance.area}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">장르:</span>{" "}
                        {performance.genrenm}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                더 많은 결과를 불러오는 중...
              </span>
            </div>
          )}

          {!isLoading &&
            !isFetchingNextPage &&
            performances.length > 0 &&
            !hasNextPage && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                모든 결과를 불러왔습니다.
              </div>
            )}

          {!isLoading && performances.length === 0 && !error && (
            <EmptyState
              message={!modalDate ? "공연 날짜를 먼저 선택해주세요." : "작품명을 입력하고 검색 버튼을 눌러주세요."}
              description={!modalDate ? "날짜 선택 후 작품명을 입력하고 검색 버튼을 눌러주세요." : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
