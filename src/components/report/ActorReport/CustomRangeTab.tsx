import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ActorDetailModal from "./ActorDetailModal";
import ActorCardList from "./ActorTable";
import { useInfiniteActorStats } from "@/queries/reports/queries";

interface ActorCustomRangeTabProps {
  searchTerm: string;
  startDate: string;
  endDate: string;
  genre?: "뮤지컬" | "연극";
}

export default function ActorCustomRangeTab({ searchTerm, startDate, endDate, genre }: ActorCustomRangeTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedActor = searchParams.get("actor");
  const isModalOpen = !!selectedActor;

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteActorStats({
    search: searchTerm || undefined,
    startDate,
    endDate,
    genre,
  });

  const actors = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page) => page.data)
      .map((actor) => ({
        id: actor.actorId,
        name: actor.actorName,
        totalViewCount: actor.viewCount,
        watchedPerformances: actor.performanceList,
        totalAmount: actor.totalTicketPrice,
        imageUrl: actor.imageUrl,
      }))
      .sort((a, b) => {
        if (b.totalViewCount !== a.totalViewCount) return b.totalViewCount - a.totalViewCount;
        if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount;
        return a.name.localeCompare(b.name, "ko");
      });
  }, [data]);

  const handleActorClick = (actorId: string) => {
    setSearchParams((prev) => { prev.set("actor", actorId); return prev; });
  };

  const handleCloseModal = () => {
    setSearchParams((prev) => { prev.delete("actor"); return prev; });
  };

  return (
    <div className="space-y-6">
      <ActorCardList
        actors={actors}
        isLoading={isLoading}
        onActorClick={handleActorClick}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
      {selectedActor && (
        <ActorDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actorId={selectedActor}
        />
      )}
    </div>
  );
}
