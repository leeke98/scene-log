import { useState } from "react";
import { Plus, X, Ticket, Gift, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAddRewatchMilestone,
  useUpdateRewatchMilestone,
  useDeleteRewatchMilestone,
  useAddMilestoneReward,
  useUpdateMilestoneReward,
  useDeleteMilestoneReward,
} from "@/queries/rewatch";
import type { RewatchMilestoneSummary, RewatchReward, RewatchRewardType } from "@/services/rewatchApi";

interface MilestoneSectionProps {
  seasonId: string;
  milestones: RewatchMilestoneSummary[];
}

interface RewardFormState {
  rewardType: RewatchRewardType;
  discountPercent: string;
  voucherQty: string;
  merchandiseDesc: string;
}

const defaultReward: RewardFormState = {
  rewardType: "DISCOUNT_VOUCHER",
  discountPercent: "",
  voucherQty: "1",
  merchandiseDesc: "",
};

function RewardFormRow({
  reward,
  onChange,
  onDelete,
  canDelete,
}: {
  reward: RewardFormState;
  onChange: (r: RewardFormState) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={reward.rewardType === "DISCOUNT_VOUCHER" ? "default" : "outline"}
            onClick={() => onChange({ ...reward, rewardType: "DISCOUNT_VOUCHER" })}
            className="h-7 px-2 text-xs"
          >
            할인권
          </Button>
          <Button
            type="button"
            size="sm"
            variant={reward.rewardType === "MERCHANDISE" ? "default" : "outline"}
            onClick={() => onChange({ ...reward, rewardType: "MERCHANDISE" })}
            className="h-7 px-2 text-xs"
          >
            물품
          </Button>
        </div>
        {canDelete && (
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {reward.rewardType === "DISCOUNT_VOUCHER" ? (
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">할인율 (%)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={reward.discountPercent}
              onChange={(e) => onChange({ ...reward, discountPercent: e.target.value })}
              placeholder="예: 30"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs">장 수</Label>
            <Input
              type="number"
              min={1}
              value={reward.voucherQty}
              onChange={(e) => onChange({ ...reward, voucherQty: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-xs">물품 설명</Label>
          <Input
            value={reward.merchandiseDesc}
            onChange={(e) => onChange({ ...reward, merchandiseDesc: e.target.value })}
            placeholder="예: 미니 실황 OST"
            className="mt-1 h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function rewardToPayload(r: RewardFormState) {
  return {
    rewardType: r.rewardType,
    discountPercent:
      r.rewardType === "DISCOUNT_VOUCHER" && r.discountPercent
        ? parseInt(r.discountPercent, 10)
        : null,
    voucherQty: r.rewardType === "DISCOUNT_VOUCHER" ? parseInt(r.voucherQty, 10) || 1 : null,
    merchandiseDesc: r.rewardType === "MERCHANDISE" ? r.merchandiseDesc || null : null,
  };
}

function rewardToFormState(r: RewatchReward): RewardFormState {
  return {
    rewardType: r.rewardType,
    discountPercent: r.discountPercent != null ? String(r.discountPercent) : "",
    voucherQty: r.voucherQty != null ? String(r.voucherQty) : "1",
    merchandiseDesc: r.merchandiseDesc ?? "",
  };
}

function rewardLabel(r: RewatchReward | RewardFormState): string {
  if (r.rewardType === "DISCOUNT_VOUCHER") {
    const pct = "discountPercent" in r && typeof r.discountPercent === "number"
      ? r.discountPercent
      : (r as RewardFormState).discountPercent
        ? parseInt((r as RewardFormState).discountPercent, 10)
        : null;
    const qty = "voucherQty" in r && typeof r.voucherQty === "number"
      ? r.voucherQty
      : parseInt((r as RewardFormState).voucherQty, 10) || 1;
    return `${pct ? `${pct}%` : ""} 할인권${qty > 1 ? ` ×${qty}` : ""}`.trim();
  } else {
    const desc = "merchandiseDesc" in r && typeof r.merchandiseDesc === "string"
      ? r.merchandiseDesc
      : (r as RewardFormState).merchandiseDesc;
    return desc || "굿즈";
  }
}

export function MilestoneSection({ seasonId, milestones }: MilestoneSectionProps) {
  // 마일스톤 추가 다이얼로그
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStampCount, setAddStampCount] = useState("");
  const [addRewards, setAddRewards] = useState<RewardFormState[]>([{ ...defaultReward }]);

  // 마일스톤 회차 수정 다이얼로그
  const [editingMilestone, setEditingMilestone] = useState<RewatchMilestoneSummary | null>(null);
  const [editStampCount, setEditStampCount] = useState("");

  // 혜택 수정 다이얼로그
  const [editingReward, setEditingReward] = useState<RewatchReward | null>(null);
  const [editRewardForm, setEditRewardForm] = useState<RewardFormState>(defaultReward);

  const { mutate: addMilestone, isPending: isAdding } = useAddRewatchMilestone(seasonId);
  const { mutate: updateMilestone, isPending: isUpdating } = useUpdateRewatchMilestone(seasonId);
  const { mutate: deleteMilestone } = useDeleteRewatchMilestone(seasonId);
  const { mutate: addReward, isPending: isAddingReward } = useAddMilestoneReward(seasonId);
  const { mutate: updateReward, isPending: isUpdatingReward } = useUpdateMilestoneReward(seasonId);
  const { mutate: deleteReward } = useDeleteMilestoneReward(seasonId);

  const closeAdd = () => {
    setIsAddOpen(false);
    setAddStampCount("");
    setAddRewards([{ ...defaultReward }]);
  };

  const handleAdd = () => {
    const count = parseInt(addStampCount, 10);
    if (!count || count < 1) return;
    addMilestone(
      { stampCount: count, rewards: addRewards.map(rewardToPayload) },
      { onSuccess: closeAdd }
    );
  };

  const openEditMilestone = (m: RewatchMilestoneSummary) => {
    setEditStampCount(String(m.stampCount));
    setEditingMilestone(m);
  };

  const handleUpdateMilestone = () => {
    if (!editingMilestone) return;
    const count = parseInt(editStampCount, 10);
    if (!count || count < 1) return;
    updateMilestone(
      { milestoneId: editingMilestone.id, data: { stampCount: count } },
      { onSuccess: () => setEditingMilestone(null) }
    );
  };

  const openEditReward = (r: RewatchReward) => {
    setEditRewardForm(rewardToFormState(r));
    setEditingReward(r);
  };

  const handleUpdateReward = () => {
    if (!editingReward) return;
    const payload = rewardToPayload(editRewardForm);
    updateReward(
      { rewardId: editingReward.id, data: payload },
      { onSuccess: () => setEditingReward(null) }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">재관람 혜택</h4>
        <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(true)} className="h-7 px-2 text-xs gap-1">
          <Plus className="w-3 h-3" />
          추가
        </Button>
      </div>

      {milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground">재관람 혜택을 설정하면 도장 목표와 보상을 관리할 수 있습니다.</p>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="bg-muted/50 border rounded-lg px-3 py-2">
              {/* 마일스톤 헤더 */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold">{m.stampCount}회차 혜택</span>
                <button
                  onClick={() => openEditMilestone(m)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {/* 혜택 목록 */}
              <div className="flex flex-wrap gap-1.5">
                {m.rewards.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-1 bg-background rounded-full px-2.5 py-0.5 text-xs border"
                  >
                    {r.rewardType === "DISCOUNT_VOUCHER" ? (
                      <Ticket className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Gift className="w-3 h-3 text-purple-500 flex-shrink-0" />
                    )}
                    <span>{rewardLabel(r)}</span>
                    <button
                      onClick={() => openEditReward(r)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => deleteReward(r.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    addReward({ milestoneId: m.id, data: rewardToPayload({ ...defaultReward }) })
                  }
                  disabled={isAddingReward}
                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  <Plus className="w-3 h-3" />
                  혜택 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 마일스톤 추가 다이얼로그 */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) closeAdd(); }}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>재관람 혜택 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">도장 개수</Label>
              <Input
                type="number"
                min={1}
                value={addStampCount}
                onChange={(e) => setAddStampCount(e.target.value)}
                placeholder="예: 10"
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">혜택</Label>
              {addRewards.map((r, i) => (
                <RewardFormRow
                  key={i}
                  reward={r}
                  onChange={(updated) =>
                    setAddRewards((prev) => prev.map((x, idx) => (idx === i ? updated : x)))
                  }
                  onDelete={() => setAddRewards((prev) => prev.filter((_, idx) => idx !== i))}
                  canDelete={addRewards.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddRewards((prev) => [...prev, { ...defaultReward }])}
                className="w-full gap-1 text-xs h-8"
              >
                <Plus className="w-3 h-3" />
                혜택 추가
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAdd}>취소</Button>
            <Button onClick={handleAdd} disabled={!addStampCount || isAdding}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 마일스톤 회차 수정 다이얼로그 */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => { if (!open) setEditingMilestone(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>회차 수정</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-sm">도장 개수</Label>
            <Input
              type="number"
              min={1}
              value={editStampCount}
              onChange={(e) => setEditStampCount(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMilestone(null)}>취소</Button>
            <Button onClick={handleUpdateMilestone} disabled={!editStampCount || isUpdating}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 혜택 수정 다이얼로그 */}
      <Dialog open={!!editingReward} onOpenChange={(open) => { if (!open) setEditingReward(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>혜택 수정</DialogTitle>
          </DialogHeader>
          <RewardFormRow
            reward={editRewardForm}
            onChange={setEditRewardForm}
            onDelete={() => {}}
            canDelete={false}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReward(null)}>취소</Button>
            <Button onClick={handleUpdateReward} disabled={isUpdatingReward}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
