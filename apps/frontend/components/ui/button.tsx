import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "social";
  size?: "default" | "social";
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary:
      "bg-primary text-white hover:bg-primary-hover h-[56px] px-6 text-sm w-full",
    secondary:
      "border border-border bg-white text-neutral-700 hover:bg-neutral-50 h-[56px] px-6 text-sm",
    social:
      "border border-border bg-white text-neutral-700 hover:bg-neutral-50 h-[56px] px-4 text-sm flex-1",
  };
  const sizeStyles = size === "social" ? styles.social : styles[variant];
  return (
    <button className={`${base} ${sizeStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
