"use client";
import { ClientFlowIcon } from "@/components/icons";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt="ClientFlow Lite logo"
          className="h-8 w-auto"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.removeAttribute("hidden");
          }}
        />
        <span hidden>
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
            <ClientFlowIcon name="portal" size={16} />
          </span>
        </span>
      </span>
      <span className="text-sm tracking-tight">
        ClientFlow <span className="text-muted-foreground font-normal">Lite</span>
      </span>
    </Link>
  );
}