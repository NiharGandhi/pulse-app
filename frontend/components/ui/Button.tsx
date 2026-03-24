import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
};

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary:   { background: "var(--text)", color: "var(--bg)" },
  secondary: { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
  ghost:     { background: "transparent", color: "var(--text-2)" },
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-body font-semibold transition-all duration-150 rounded-full cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        {
          "text-xs px-3 py-1.5 gap-1.5": size === "sm",
          "text-sm px-5 py-2.5 gap-2":   size === "md",
          "text-base px-6 py-3.5 gap-2": size === "lg",
          "w-full": fullWidth,
        },
        className
      )}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
