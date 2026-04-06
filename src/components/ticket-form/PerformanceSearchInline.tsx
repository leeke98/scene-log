import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePerformanceSearch } from "@/hooks/usePerformanceSearch";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "react-toastify";

interface Props {
  date: string;
  genre: "연극" | "뮤지컬";
  onGenreChange: (genre: "연극" | "뮤지컬") => void;
  performanceName: string;
  theater: string;
  posterUrl: string;
  posterPreviewUrl: string;
  onPerformanceSelect: (perf: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
    mt20id?: string;
  }) => void;
  onManualNameChange: (name: string) => void;
  onPosterFileSelect: (file: File | null, previewUrl: string) => void;
}

export default function PerformanceSearchInline({
  date,
  genre,
  onGenreChange,
  performanceName,
  theater,
  posterUrl,
  posterPreviewUrl,
  onPerformanceSelect,
  onManualNameChange,
  onPosterFileSelect,
}: Props) {
  const [isManual, setIsManual] = useState(false);
  const [showSearch, setShowSearch] = useState(!performanceName);
  const [showResults, setShowResults] = useState(false);
  const prevBlobUrlRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("5MB 이하의 이미지만 업로드할 수 있습니다.");
      return;
    }

    // 이전 blob URL 해제 후 새 미리보기 생성
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    prevBlobUrlRef.current = blobUrl;
    onPosterFileSelect(file, blobUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearLocalPreview = () => {
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = "";
    onPosterFileSelect(null, "");
  };

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
      setShowSearch(false);
      clearLocalPreview(); // KOPIS 공연 선택 시 pending 파일 초기화
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

      {/* 숨김 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 선택된 공연 표시 */}
      {performanceName && !showSearch && !isManual && (
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 relative group">
            {(posterPreviewUrl || posterUrl) ? (
              <img
                src={posterPreviewUrl || posterUrl}
                alt={performanceName}
                className="w-[72px] aspect-[3/4] object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-[72px] aspect-[3/4] bg-muted rounded-lg" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <ImageUp className="w-4 h-4" />
              <span className="text-[10px] leading-tight text-center px-1">
                {(posterPreviewUrl || posterUrl) ? "사진 교체" : "업로드"}
              </span>
            </button>
          </div>
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
          <div className="flex gap-3 items-end">
            {/* 포스터 업로드 영역 */}
            <div className="flex-shrink-0 relative group">
              <div className="w-[72px] aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                {(posterPreviewUrl || posterUrl) && (
                  <img
                    src={posterPreviewUrl || posterUrl}
                    alt="포스터"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <ImageUp className="w-4 h-4" />
                <span className="text-[10px] leading-tight text-center px-1">
                  {(posterPreviewUrl || posterUrl) ? "사진 교체" : "업로드"}
                </span>
              </button>
            </div>
            <div className="flex-1 min-w-0">
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
                <EmptyState message="검색 결과가 없습니다." size="sm" />
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
