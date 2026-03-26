import { useState, useMemo } from "react";
import ActorDetailModal from "./ActorDetailModal";
import ActorCardList from "./ActorTable";
import { useInfiniteActorStats } from "@/queries/reports/queries";

interface ActorMonthlyTabProps {
  searchTerm: string;
  year: string;
  month: string; // "YYYY-MM" 형식
}

export default function ActorMonthlyTab({
  searchTerm,
  year,
  month,
}: ActorMonthlyTabProps) {
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // month가 "YYYY-MM" 형식이므로 "MM" 부분만 추출
  const monthOnly = month.split("-")[1];

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteActorStats({
    search: searchTerm || undefined,
    year,
    month: monthOnly,
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
    setSelectedActor(actorName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActor(null);
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
          month={monthOnly}
        />
      )}
    </div>
  );
}
