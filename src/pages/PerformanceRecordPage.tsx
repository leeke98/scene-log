import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import TicketCard from "@/components/TicketCard";
import TicketCardSkeleton from "@/components/TicketCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketsList } from "@/queries/tickets/queries";
import { ArrowUp, Search, X } from "lucide-react";

export default function PerformanceRecordPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(""); // 입력 중인 검색어
  const [searchTerm, setSearchTerm] = useState(""); // 실제 검색에 사용되는 검색어
  const [searchMode, setSearchMode] = useState<"작품명" | "배우명">("작품명");
  const [selectedGenre, setSelectedGenre] = useState<
    "전체" | "뮤지컬" | "연극"
  >("전체");

  const [showScrollTop, setShowScrollTop] = useState(false);

  const genreValue: "연극" | "뮤지컬" | undefined =
    selectedGenre === "전체" ? undefined : selectedGenre;

  const performanceNameParam =
    searchMode === "작품명" ? searchTerm || undefined : undefined;
  const actorNameParam =
    searchMode === "배우명" ? searchTerm || undefined : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTicketsList(20, performanceNameParam, genreValue, actorNameParam);

  // 500ms 디바운스 자동검색
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // 엔터 키 또는 아이콘 클릭 시 즉시 검색
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue);
    }
  };

  const handleSearchClick = () => {
    setSearchTerm(inputValue);
  };

  // 무한 스크롤을 위한 Intersection Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 스크롤 위치 감지 (맨 위로 버튼 표시 여부)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 모든 티켓 데이터를 평탄화
  const tickets = data?.pages.flatMap((page) => page.data) || [];
  // 총 개수는 첫 페이지의 pagination에서 가져옴
  const totalCount = data?.pages[0]?.pagination?.total ?? tickets.length;

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col gap-3">
          {/* 1행: 검색창 */}
          <div className="flex items-center">
            <Select
              value={searchMode}
              onValueChange={(value) => {
                setSearchMode(value as "작품명" | "배우명");
                setInputValue("");
                setSearchTerm("");
              }}
            >
              <SelectTrigger className="w-[105px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 shrink-0 bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="작품명">작품명</SelectItem>
                <SelectItem value="배우명">배우명</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={`${searchMode}으로 검색`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="rounded-l-none pr-16"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {inputValue && (
                  <button
                    onClick={() => {
                      setInputValue("");
                      setSearchTerm("");
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSearchClick}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2행: 장르 필터 + 새 기록 추가 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(["전체", "뮤지컬", "연극"] as const).map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedGenre === genre
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <Button onClick={() => navigate("/tickets/new")} size="sm">
              새 기록 추가
            </Button>
          </div>
        </div>

        {/* 검색 결과 건수 */}
        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || selectedGenre !== "전체"
              ? `검색 결과 ${totalCount}개`
              : `총 ${totalCount}개의 공연 기록`}
          </p>
        )}

        {/* 티켓 그리드 */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-red-500">
              {(error as any)?.error || "티켓을 불러오는데 실패했습니다."}
            </p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            message={
              searchTerm || selectedGenre !== "전체"
                ? "검색 결과가 없습니다."
                : "아직 기록된 공연이 없습니다."
            }
            action={
              !searchTerm && selectedGenre === "전체"
                ? { label: "첫 공연 기록하기", onClick: () => navigate("/tickets/new") }
                : undefined
            }
            size="lg"
            className="min-h-[400px]"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* 무한 스크롤 트리거 */}
            <div ref={observerTarget} />

            {isFetchingNextPage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TicketCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!hasNextPage && tickets.length > 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                모든 티켓을 불러왔습니다.
              </p>
            )}
          </>
        )}
      </div>

      {/* 맨 위로 이동 버튼 */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 md:bottom-8 right-6 z-30 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="맨 위로 이동"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </Layout>
  );
}
