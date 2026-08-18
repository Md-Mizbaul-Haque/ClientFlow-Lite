import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type IconContainerVariant = "plain" | "ring" | "crop" | "cut" | "filled";

export interface IconContainerProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: IconContainerVariant;
  boxSize?: number;
}

function Backdrop({ variant }: { variant: "ring" | "crop" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {variant === "ring" ? (
        <>
          <path d="M15.21 19.76A8.4 8.4 0 1 1 19.76 15.21" />
          <circle cx="17.94" cy="17.94" r="1.15" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          <path d="M3 6.75V4a1 1 0 0 1 1-1h2.75" />
          <path d="M17.25 3H20a1 1 0 0 1 1 1v2.75" />
          <path d="M3 17.25V20a1 1 0 0 0 1 1h2.75" />
          <path d="M17.25 21H20a1 1 0 0 0 1-1v-2.75" />
          <circle cx="18.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

export function IconContainer({
  variant = "ring",
  boxSize = 40,
  className,
  style,
  children,
  ...props
}: IconContainerProps) {
  if (variant === "plain") {
    return (
      <span
        className={cn("inline-flex shrink-0 items-center justify-center", className)}
        style={{ width: boxSize, height: boxSize, ...style }}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center text-muted-foreground/60 transition-colors duration-200",
        variant === "ring" && "group-hover:text-primary",
        variant === "cut" && "group-hover:border-primary/50",
        variant === "filled" && "bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/25",
        className
      )}
      style={{ width: boxSize, height: boxSize, ...style }}
      {...props}
    >
      {(variant === "ring" || variant === "crop") && <Backdrop variant={variant} />}
      {variant === "cut" && (
        <span
          className="absolute inset-0 border border-border/70"
          style={{
            clipPath: `polygon(0 0, calc(100% - ${Math.round(boxSize * 0.22)}px) 0, 100% ${Math.round(boxSize * 0.22)}px, 100% 100%, 0 100%)`,
          }}
        />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}