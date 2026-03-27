import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CastingFieldProps = {
  casting: string[];
  onAddActor: (name: string) => void;
  onRemoveActor: (index: number) => void;
};

export default function CastingField({
  casting,
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
          <div className="flex flex-wrap gap-2">
            {casting.map((actor, index) => (
              <div
                key={`${actor}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
              >
                <span>{actor}</span>
                <button
                  type="button"
                  onClick={() => onRemoveActor(index)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
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
