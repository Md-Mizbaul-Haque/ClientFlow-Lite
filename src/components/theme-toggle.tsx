"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const useHydrated = () =>
  React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useHydrated();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-muted-foreground", className)}
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}