import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: string;
  message: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inline";
  className?: string;
}

const paddingClasses = {
  sm: "py-6",
  md: "py-12",
  lg: "py-16",
};

export function EmptyState({
  icon,
  message,
  description,
  action,
  size = "md",
  variant = "default",
  className,
}: EmptyStateProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-muted/20 px-4 text-center text-sm text-muted-foreground",
          paddingClasses[size],
          className
        )}
      >
        {message}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-muted-foreground",
        paddingClasses[size],
        className
      )}
    >
      {icon && <span className="text-3xl">{icon}</span>}
      <span className="text-sm text-center">{message}</span>
      {description && (
        <span className="text-sm text-center text-muted-foreground/80">{description}</span>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
