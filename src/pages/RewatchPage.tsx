import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useRewatchSeasons } from "@/queries/rewatch";
import { AddSeasonModal, SeasonPanel } from "@/components/rewatch";

export default function RewatchPage() {
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);

  const { data: seasons, isLoading, isError } = useRewatchSeasons();

  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={() => setIsAddSeasonOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            재관람 극 추가
          </Button>
        </div>

        {/* 시즌 목록 */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <EmptyState
            icon="⚠️"
            message="데이터를 불러오는데 실패했습니다."
            description="잠시 후 다시 시도해주세요."
          />
        ) : seasons && seasons.length > 0 ? (
          <div className="space-y-4">
            {seasons.map((season) => (
              <SeasonPanel key={season.id} season={season} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎭"
            message="등록된 재관람 극이 없습니다."
            description="회전극의 도장과 재관람 혜택을 관리해보세요."
            action={{ label: "재관람 극 추가", onClick: () => setIsAddSeasonOpen(true) }}
          />
        )}
      </div>

      <AddSeasonModal isOpen={isAddSeasonOpen} onClose={() => setIsAddSeasonOpen(false)} />
    </Layout>
  );
}
