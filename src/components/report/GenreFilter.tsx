import { cn } from "@/lib/utils";

export type GenreType = "전체" | "뮤지컬" | "연극";

interface GenreFilterProps {
  activeGenre: GenreType;
  onGenreChange: (genre: GenreType) => void;
}

export default function GenreFilter({ activeGenre, onGenreChange }: GenreFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {(["전체", "뮤지컬", "연극"] as GenreType[]).map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreChange(genre)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            activeGenre === genre
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
