import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import TicketCard from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketsList } from "@/queries/tickets/queries";
import { ArrowUp, Loader2, Search, X } from "lucide-react";

export default function PerformanceRecordPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(""); // 입력 중인 검색어
  const [searchTerm, setSearchTerm] = useState(""); // 실제 검색에 사용되는 검색어
  const [selectedGenre, setSelectedGenre] = useState<
    "전체" | "뮤지컬" | "연극"
  >("전체");

  const [showScrollTop, setShowScrollTop] = useState(false);

  const genreValue: "연극" | "뮤지컬" | undefined =
    selectedGenre === "전체" ? undefined : selectedGenre;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTicketsList(20, searchTerm || undefined, genreValue);

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
        <div className="mb-8">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={selectedGenre}
                onValueChange={(value) =>
                  setSelectedGenre(value as "전체" | "뮤지컬" | "연극")
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="장르 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="뮤지컬">뮤지컬</SelectItem>
                  <SelectItem value="연극">연극</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:flex-none">
                <button
                  onClick={handleSearchClick}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <Input
                  type="text"
                  placeholder="작품명 검색"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-8 w-full sm:w-[300px]"
                />
                {inputValue && (
                  <button
                    onClick={() => {
                      setInputValue("");
                      setSearchTerm("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <Button
              onClick={() => navigate("/tickets/new")}
              className="sm:ml-auto w-full sm:w-auto"
            >
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
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">티켓을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-red-500">
              {(error as any)?.error || "티켓을 불러오는데 실패했습니다."}
            </p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedGenre !== "전체"
                ? "검색 결과가 없습니다."
                : "아직 기록된 공연이 없습니다."}
            </p>
            {!searchTerm && selectedGenre === "전체" && (
              <Button
                onClick={() => navigate("/tickets/new")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                첫 공연 기록하기
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* 무한 스크롤 트리거 */}
            <div
              ref={observerTarget}
              className="h-20 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">더 많은 티켓을 불러오는 중...</span>
                </div>
              )}
              {!hasNextPage && tickets.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  모든 티켓을 불러왔습니다.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 맨 위로 이동 버튼 */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 md:bottom-8 right-6 z-30 p-3 rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl ${
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
