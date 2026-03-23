import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableCastingItem, CastingItemPreview } from "./SortableCastingItem";

type CastingFieldProps = {
  casting: string[];
  activeId: number | null;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddActor: (name: string) => void;
  onRemoveActor: (index: number) => void;
};

export default function CastingField({
  casting,
  activeId,
  sensors,
  onDragStart,
  onDragEnd,
  onAddActor,
  onRemoveActor,
}: CastingFieldProps) {
  return (
    <div>
      <Label htmlFor="casting">캐스팅</Label>
      <div className="space-y-2">
        {casting.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={casting.map((_, index) => index)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2">
                {casting.map((actor, index) => (
                  <SortableCastingItem
                    key={`${actor}-${index}`}
                    actor={actor}
                    index={index}
                    onRemove={() => onRemoveActor(index)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId !== null ? (
                <CastingItemPreview actor={casting[activeId]} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        <Input
          id="casting"
          type="text"
          placeholder="배우 이름을 입력하고 Enter를 누르세요"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.currentTarget;
              const value = input.value.trim();
              onAddActor(value);
              input.value = "";
            }
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
