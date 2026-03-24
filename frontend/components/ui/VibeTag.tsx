import { cn } from "@/lib/utils";
import { VIBE_TAG_STYLES } from "@/lib/constants";

type VibeTagProps = {
  tag: string;
  size?: "sm" | "md";
  className?: string;
};

const FALLBACK = { background: "#EDEBE8", color: "#5A5450" };

export function VibeTag({ tag, size = "sm", className }: VibeTagProps) {
  const styles = VIBE_TAG_STYLES[tag.toLowerCase()] ?? FALLBACK;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-body font-medium capitalize leading-none",
        size === "sm" ? "text-[10px] px-2.5 py-[3px]" : "text-xs px-3 py-1",
        className
      )}
      style={{ backgroundColor: styles.background, color: styles.color }}
    >
      {tag}
    </span>
  );
}
