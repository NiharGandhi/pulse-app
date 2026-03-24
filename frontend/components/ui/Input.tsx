import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, style, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn("input-field w-full", error && "outline-none", className)}
        style={{
          borderColor: error ? "var(--closed)" : undefined,
          ...style,
        }}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs px-2 font-body" style={{ color: "var(--closed)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
