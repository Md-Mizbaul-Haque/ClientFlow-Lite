"use client";

import * as React from "react";
import { Eraser, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
}

export function SignaturePad({ value, onChange, className }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const padRef = React.useRef<import("signature_pad").default | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      const { default: SignaturePad } = await import("signature_pad");
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const pad = new SignaturePad(canvas, {
        backgroundColor: "rgba(0,0,0,0)",
        penColor: "rgb(24 24 27)",
        minWidth: 1,
        maxWidth: 2.5,
      });
      pad.minWidth = 1;
      pad.maxWidth = 2.5;

      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);

      const resize = () => {
        const r = canvas.getBoundingClientRect();
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        ctx?.scale(dpr, dpr);
        pad.clear();
      };
      window.addEventListener("resize", resize);

      padRef.current = pad;
      setReady(true);

      return () => {
        window.removeEventListener("resize", resize);
        pad.off();
        padRef.current = null;
      };
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleEnd() {
    const pad = padRef.current;
    if (!pad) return;
    const isEmpty = pad.isEmpty();
    onChange(isEmpty ? "" : pad.toDataURL("image/png"));
  }

  function handleClear() {
    padRef.current?.clear();
    onChange("");
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative h-36 overflow-hidden rounded-lg border">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none bg-white dark:bg-zinc-50"
          onPointerDown={handleEnd}
          onPointerMove={handleEnd}
          onPointerUp={handleEnd}
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <LoaderCircle className={cn("size-5 text-muted-foreground/50", !ready && "animate-spin")} />
              <span className="text-muted-foreground/60 text-xs">
                {ready ? "Sign above with your finger or mouse" : "Preparing canvas…"}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">Draw your signature</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7"
          onClick={handleClear}
        >
          <Eraser className="size-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}