"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { RotateCcw } from "lucide-react";

export function SignaturePad({
  onChange,
  onEmpty,
}: {
  onChange: (dataUrl: string) => void;
  onEmpty?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = padRef.current?.toData();
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);
      padRef.current?.clear();
      if (data) padRef.current?.fromData(data);
    };

    padRef.current = new SignaturePadLib(canvas, {
      penColor: "#0e1116",
      backgroundColor: "rgba(0,0,0,0)",
      minWidth: 0.6,
      maxWidth: 2.4,
    });

    padRef.current.addEventListener("endStroke", () => {
      const empty = padRef.current?.isEmpty() ?? true;
      setHasInk(!empty);
      if (empty) onEmpty?.();
      else onChange(padRef.current!.toDataURL("image/png"));
    });

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      padRef.current?.off();
    };
  }, [onChange, onEmpty]);

  const clear = () => {
    padRef.current?.clear();
    setHasInk(false);
    onEmpty?.();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-stone bg-paper/40">
      <canvas
        ref={canvasRef}
        className="block h-44 w-full touch-none cursor-crosshair"
        aria-label="Signature pad"
      />
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-4 text-[11px] text-graphite">
        <span>{hasInk ? "Looks good." : "Sign with your finger or mouse"}</span>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone/70 bg-background px-2.5 py-1 text-[11px] font-medium text-graphite transition hover:border-brand-300 hover:text-charcoal"
        >
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}
