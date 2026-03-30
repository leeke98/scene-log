import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePerformanceSearch } from "@/hooks/usePerformanceSearch";

interface Props {
  date: string;
  genre: "연극" | "뮤지컬";
  onGenreChange: (genre: "연극" | "뮤지컬") => void;
  performanceName: string;
  theater: string;
  posterUrl: string;
  onPerformanceSelect: (perf: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
  }) => void;
  onManualNameChange: (name: string) => void;
}

export default function PerformanceSearchInline({
  date,
  genre,
  onGenreChange,
  performanceName,
  theater,
  posterUrl,
  onPerformanceSelect,
  onManualNameChange,
}: Props) {
  const [isManual, setIsManual] = useState(false);
  const [showSearch, setShowSearch] = useState(!performanceName);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (performanceName && !isManual) {
      setShowSearch(false);
      setShowResults(false);
    }
  }, [performanceName, isManual]);

  const {
    searchTerm,
    setSearchTerm,
    canSearch,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    performances,
    error,
    handleSelectPerformance,
    handleScroll,
    handleSearchClick,
  } = usePerformanceSearch({
    selectedDate: date || undefined,
    selectedGenre: genre,
    onSelect: (perf) => {
      onPerformanceSelect(perf);
      setShowResults(false);
    },
    onClose: () => setShowResults(false),
  });

  const triggerSearch = () => {
    handleSearchClick();
    setShowResults(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSearch && !isLoading) {
      e.preventDefault();
      handleSearchClick();
      setShowResults(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* 장르 선택 */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          장르
        </Label>
        <div className="flex gap-2">
          {(["연극", "뮤지컬"] as const).map((g) => (
            <Button
              key={g}
              type="button"
              size="sm"
              variant={genre === g ? "default" : "outline"}
              onClick={() => onGenreChange(g)}
              className="flex-1"
            >
              {g}
            </Button>
          ))}
        </div>
      </div>

      {/* 선택된 공연 표시 */}
      {performanceName && !showSearch && !isManual && (
        <div className="flex gap-3 items-start">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={performanceName}
              className="w-[72px] aspect-[3/4] object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-[72px] aspect-[3/4] bg-muted rounded-lg flex-shrink-0" />
          )}
          <div className="flex-1 pt-0.5 min-w-0">
            <p className="font-semibold text-sm leading-snug">{performanceName}</p>
            {theater && (
              <p className="text-xs text-muted-foreground mt-0.5">{theater}</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSearch(true);
                  setIsManual(false);
                }}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                다른 공연 검색
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsManual(true);
                  setShowSearch(false);
                }}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                직접 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 직접 입력 모드 */}
      {isManual && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              공연명
            </Label>
            <Input
              value={performanceName}
              onChange={(e) => onManualNameChange(e.target.value)}
              placeholder="공연명을 직접 입력하세요"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsManual(false);
              setShowSearch(true);
            }}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            공연 검색으로 돌아가기
          </button>
        </div>
      )}

      {/* KOPIS 검색 모드 */}
      {showSearch && !isManual && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            공연 검색
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder={date ? "공연명을 입력하세요" : "날짜를 먼저 선택해주세요"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!date}
            />
            <Button
              type="button"
              size="icon"
              onClick={triggerSearch}
              disabled={isLoading || !canSearch}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsManual(true);
              setShowSearch(false);
            }}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            직접 입력
          </button>

          {/* 검색 결과 패널 */}
          {showResults && (
            <div
              className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto divide-y bg-card"
              onScroll={handleScroll}
            >
              {isLoading && performances.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : performances.length > 0 ? (
                <>
                  {performances.map((p) => (
                    <div
                      key={p.mt20id}
                      onClick={() => handleSelectPerformance(p)}
                      className="flex gap-2.5 p-2.5 cursor-pointer hover:bg-accent transition-colors"
                    >
                      {p.poster && (
                        <img
                          src={p.poster}
                          alt={p.prfnm}
                          className="w-9 h-[52px] object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{p.prfnm}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.fcltynm}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.prfpdfrom} ~ {p.prfpdto}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isFetchingNextPage && (
                    <div className="py-3 flex justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isFetchingNextPage && !hasNextPage && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      모든 결과를 불러왔습니다.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  검색 결과가 없습니다.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
