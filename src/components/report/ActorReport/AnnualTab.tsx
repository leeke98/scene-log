import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ActorDetailModal from "./ActorDetailModal";
import ActorCardList from "./ActorTable";
import { useInfiniteActorStats } from "@/queries/reports/queries";

interface ActorAnnualTabProps {
  searchTerm: string;
  year: string;
}

export default function ActorAnnualTab({
  searchTerm,
  year,
}: ActorAnnualTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedActor = searchParams.get("actor");
  const isModalOpen = !!selectedActor;

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteActorStats({
    search: searchTerm || undefined,
    year,
  });

  const actors = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page) => page.data)
      .map((actor) => ({
        name: actor.actorName,
        totalViewCount: actor.viewCount,
        watchedPerformances: actor.performanceList,
        totalAmount: actor.totalTicketPrice,
      }))
      .sort((a, b) => {
        if (b.totalViewCount !== a.totalViewCount)
          return b.totalViewCount - a.totalViewCount;
        if (b.totalAmount !== a.totalAmount)
          return b.totalAmount - a.totalAmount;
        return a.name.localeCompare(b.name, "ko");
      });
  }, [data]);

  const handleActorClick = (actorName: string) => {
    setSearchParams((prev) => {
      prev.set("actor", actorName);
      return prev;
    });
  };

  const handleCloseModal = () => {
    setSearchParams((prev) => {
      prev.delete("actor");
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <ActorCardList
        actors={actors}
        onActorClick={handleActorClick}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />

      {selectedActor && (
        <ActorDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actorName={selectedActor}
          year={year}
        />
      )}
    </div>
  );
}
