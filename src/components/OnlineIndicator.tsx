import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md";
  className?: string;
}

const OnlineIndicator = ({ isOnline, size = "sm", className }: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
  };

  return (
    <span
      className={cn(
        "rounded-full border-2 border-card",
        sizeClasses[size],
        isOnline ? "bg-green-500" : "bg-muted-foreground/40",
        className
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  );
};

export default OnlineIndicator;
