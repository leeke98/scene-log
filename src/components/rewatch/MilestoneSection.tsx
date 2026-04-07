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
import { useAddRewatchMilestone, useUpdateRewatchMilestone, useDeleteRewatchMilestone } from "@/queries/rewatch";
import type { RewatchMilestoneSummary, RewatchRewardType } from "@/services/rewatchApi";

interface MilestoneSectionProps {
  seasonId: string;
  milestones: RewatchMilestoneSummary[];
}

interface MilestoneFormState {
  rewardType: RewatchRewardType;
  stampCount: string;
  discountPercent: string;
  voucherQty: string;
  merchandiseDesc: string;
}

const defaultForm: MilestoneFormState = {
  rewardType: "DISCOUNT_VOUCHER",
  stampCount: "",
  discountPercent: "",
  voucherQty: "1",
  merchandiseDesc: "",
};

interface MilestoneFormProps {
  form: MilestoneFormState;
  setForm: React.Dispatch<React.SetStateAction<MilestoneFormState>>;
}

function MilestoneForm({ form, setForm }: MilestoneFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm">도장 개수</Label>
        <Input
          type="number"
          min={1}
          value={form.stampCount}
          onChange={(e) => setForm((f) => ({ ...f, stampCount: e.target.value }))}
          placeholder="예: 10"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm">혜택 유형</Label>
        <div className="flex gap-2 mt-1">
          <Button
            type="button"
            size="sm"
            variant={form.rewardType === "DISCOUNT_VOUCHER" ? "default" : "outline"}
            onClick={() => setForm((f) => ({ ...f, rewardType: "DISCOUNT_VOUCHER" }))}
            className="flex-1"
          >
            할인권
          </Button>
          <Button
            type="button"
            size="sm"
            variant={form.rewardType === "MERCHANDISE" ? "default" : "outline"}
            onClick={() => setForm((f) => ({ ...f, rewardType: "MERCHANDISE" }))}
            className="flex-1"
          >
            물품
          </Button>
        </div>
      </div>

      {form.rewardType === "DISCOUNT_VOUCHER" ? (
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-sm">할인율 (%)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              placeholder="예: 10"
              className="mt-1"
            />
          </div>
          <div className="w-24">
            <Label className="text-sm">장 수</Label>
            <Input
              type="number"
              min={1}
              value={form.voucherQty}
              onChange={(e) => setForm((f) => ({ ...f, voucherQty: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-sm">물품 설명</Label>
          <Input
            value={form.merchandiseDesc}
            onChange={(e) => setForm((f) => ({ ...f, merchandiseDesc: e.target.value }))}
            placeholder="예: 미니 실황 OST"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}

export function MilestoneSection({ seasonId, milestones }: MilestoneSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<RewatchMilestoneSummary | null>(null);
  const [form, setForm] = useState<MilestoneFormState>(defaultForm);

  const { mutate: addMilestone, isPending: isAdding } = useAddRewatchMilestone(seasonId);
  const { mutate: updateMilestone, isPending: isUpdating } = useUpdateRewatchMilestone(seasonId);
  const { mutate: deleteMilestone } = useDeleteRewatchMilestone(seasonId);

  const openAdd = () => {
    setForm(defaultForm);
    setIsAddOpen(true);
  };

  const openEdit = (m: RewatchMilestoneSummary) => {
    setForm({
      rewardType: m.rewardType,
      stampCount: String(m.stampCount),
      discountPercent: m.discountPercent != null ? String(m.discountPercent) : "",
      voucherQty: m.voucherQty != null ? String(m.voucherQty) : "1",
      merchandiseDesc: m.merchandiseDesc ?? "",
    });
    setEditingMilestone(m);
  };

  const closeAll = () => {
    setIsAddOpen(false);
    setEditingMilestone(null);
    setForm(defaultForm);
  };

  const handleAdd = () => {
    const count = parseInt(form.stampCount, 10);
    if (!count || count < 1) return;

    addMilestone(
      {
        stampCount: count,
        rewardType: form.rewardType,
        discountPercent:
          form.rewardType === "DISCOUNT_VOUCHER" && form.discountPercent
            ? parseInt(form.discountPercent, 10)
            : null,
        voucherQty: form.rewardType === "DISCOUNT_VOUCHER" ? parseInt(form.voucherQty, 10) || 1 : null,
        merchandiseDesc: form.rewardType === "MERCHANDISE" ? form.merchandiseDesc || null : null,
      },
      { onSuccess: closeAll }
    );
  };

  const handleUpdate = () => {
    if (!editingMilestone) return;
    const count = parseInt(form.stampCount, 10);
    if (!count || count < 1) return;

    updateMilestone(
      {
        milestoneId: editingMilestone.id,
        data: {
          stampCount: count,
          discountPercent:
            form.rewardType === "DISCOUNT_VOUCHER" && form.discountPercent
              ? parseInt(form.discountPercent, 10)
              : null,
          voucherQty:
            form.rewardType === "DISCOUNT_VOUCHER" ? parseInt(form.voucherQty, 10) || 1 : null,
          merchandiseDesc:
            form.rewardType === "MERCHANDISE" ? form.merchandiseDesc || null : null,
        },
      },
      { onSuccess: closeAll }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">재관람 혜택</h4>
        <Button variant="ghost" size="sm" onClick={openAdd} className="h-7 px-2 text-xs gap-1">
          <Plus className="w-3 h-3" />
          추가
        </Button>
      </div>

      {milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground">재관람 혜택을 설정하면 도장 목표와 보상을 관리할 수 있습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-xs"
            >
              {m.rewardType === "DISCOUNT_VOUCHER" ? (
                <Ticket className="w-3 h-3 text-blue-500 flex-shrink-0" />
              ) : (
                <Gift className="w-3 h-3 text-purple-500 flex-shrink-0" />
              )}
              <span className="font-medium">{m.stampCount}회</span>
              <span className="text-muted-foreground">→</span>
              {m.rewardType === "DISCOUNT_VOUCHER" ? (
                <span>
                  {m.discountPercent ? `${m.discountPercent}% 할인권` : "할인권"}
                  {m.voucherQty && m.voucherQty > 1 ? ` ×${m.voucherQty}` : ""}
                </span>
              ) : (
                <span>{m.merchandiseDesc || "굿즈"}</span>
              )}
              <button
                onClick={() => openEdit(m)}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
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
          ))}
        </div>
      )}

      {/* 추가 다이얼로그 */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) closeAll(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>재관람 혜택 추가</DialogTitle>
          </DialogHeader>
          <MilestoneForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={closeAll}>
              취소
            </Button>
            <Button onClick={handleAdd} disabled={!form.stampCount || isAdding}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => { if (!open) closeAll(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>재관람 혜택 수정</DialogTitle>
          </DialogHeader>
          <MilestoneForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={closeAll}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={!form.stampCount || isUpdating}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
