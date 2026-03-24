import { useState, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { formatDateToKopis } from "@/lib/dateUtils";
import Layout from "@/components/Layout";
import { useWeeklyBoxOffice } from "@/queries/kopis";
import {
  PerformanceDetailModal,
  ScrollablePosters,
  SearchResults,
} from "@/components/explore";

type GenreFilter = "전체" | "뮤지컬" | "연극";

const GENRE_MAP: Record<GenreFilter, "AAAA" | "GGGA" | undefined> = {
  전체: undefined,
  뮤지컬: "GGGA",
  연극: "AAAA",
};

function formatKopisDate(yyyymmdd: string): string {
  const month = parseInt(yyyymmdd.substring(4, 6));
  const day = parseInt(yyyymmdd.substring(6, 8));
  return `${month}월 ${day}일`;
}

export default function ExplorePage() {
  const [selectedMt20id, setSelectedMt20id] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("전체");

  // 날짜 계산: stdate는 오늘로부터 6일 전, eddate는 오늘 (일주일 치)
  const { stdate, eddate } = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
    return {
      stdate: formatDateToKopis(oneWeekAgo),
      eddate: formatDateToKopis(today),
    };
  }, []);

  const dateRangeLabel = `${formatKopisDate(stdate)} ~ ${formatKopisDate(eddate)}`;

  // 뮤지컬 주간 예매 순위 조회
  const {
    data: musicalRankings = [],
    isLoading: isLoadingMusical,
    error: errorMusical,
  } = useWeeklyBoxOffice("뮤지컬", stdate, eddate);

  // 연극 주간 예매 순위 조회
  const {
    data: playRankings = [],
    isLoading: isLoadingPlay,
    error: errorPlay,
  } = useWeeklyBoxOffice("연극", stdate, eddate);

  const handlePosterClick = useCallback((mt20id: string) => {
    setSelectedMt20id(mt20id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMt20id(null);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSubmittedSearch("");
  };

  const isSearching = submittedSearch.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* 검색 영역 */}
        <div className="mb-8 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="공연명으로 검색"
                className="w-full pl-9 pr-9 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              검색
            </button>
          </form>

          {/* 장르 필터 (검색 시에만 표시) */}
          {isSearching && (
            <div className="flex gap-2">
              {(["전체", "뮤지컬", "연극"] as GenreFilter[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    genreFilter === g
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 검색 결과 or 박스오피스 */}
        {isSearching ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              "{submittedSearch}" 검색 결과
            </h2>
            <SearchResults
              searchTerm={submittedSearch}
              genre={GENRE_MAP[genreFilter]}
              onPosterClick={handlePosterClick}
            />
          </div>
        ) : (
          <div className="space-y-12">
            {/* 주간 뮤지컬 예매 순위 */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">주간 뮤지컬 예매 순위</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {dateRangeLabel}
                </p>
              </div>
              <ScrollablePosters
                performances={musicalRankings}
                isLoading={isLoadingMusical}
                error={
                  errorMusical
                    ? errorMusical instanceof Error
                      ? errorMusical.message
                      : "예매 순위를 불러오는데 실패했습니다."
                    : null
                }
                onPosterClick={handlePosterClick}
              />
            </div>

            {/* 주간 연극 예매 순위 */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">주간 연극 예매 순위</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {dateRangeLabel}
                </p>
              </div>
              <ScrollablePosters
                performances={playRankings}
                isLoading={isLoadingPlay}
                error={
                  errorPlay
                    ? errorPlay instanceof Error
                      ? errorPlay.message
                      : "예매 순위를 불러오는데 실패했습니다."
                    : null
                }
                onPosterClick={handlePosterClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* 공연 상세 정보 모달 */}
      <PerformanceDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mt20id={selectedMt20id}
      />
    </Layout>
  );
}
