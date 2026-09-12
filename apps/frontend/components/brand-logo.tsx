import Image from "next/image";

type BrandLogoProps = {
  variant?: "onBlue" | "onWhite";
  showWordmark?: boolean;
  className?: string;
};

export function BrandLogo({ variant = "onWhite", showWordmark = true, className = "" }: BrandLogoProps) {
  const isOnBlue = variant === "onBlue";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
          isOnBlue ? "bg-white p-0.5" : "bg-white"
        }`}
      >
        <Image
          src="/logo.png"
          alt="ClientFlow Lite logo"
          width={32}
          height={32}
          sizes="32px"
          priority
          className="h-8 w-8 object-contain"
        />
      </span>
      {showWordmark ? (
        <span className="flex items-center gap-2">
          <span className={`text-lg font-bold tracking-tight ${isOnBlue ? "text-white" : "text-neutral-900"}`}>
            ClientFlow Lite
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              isOnBlue ? "bg-white/20 text-white" : "bg-primary-soft text-primary"
            }`}
          >
            Portal
          </span>
        </span>
      ) : null}
    </div>
  );
}
