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
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const value = inputValue.trim();
    if (value) {
      onAddActor(value);
      setInputValue("");
    }
    inputRef.current?.focus();
  };

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
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="casting"
            type="text"
            enterKeyHint="done"
            placeholder="배우를 한 명씩 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
