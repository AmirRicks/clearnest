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

  // Keep the latest callbacks in refs. The init effect runs ONCE — if we put
  // onChange/onEmpty in the dep array, an inline callback from the parent (e.g.
  // onEmpty={() => setSignature(null)}) changes identity on every render, which
  // re-ran the effect and called resize() -> pad.clear(), wiping the signature
  // the instant the user finished signing. Reading from refs fixes that.
  const onChangeRef = useRef(onChange);
  const onEmptyRef = useRef(onEmpty);
  onChangeRef.current = onChange;
  onEmptyRef.current = onEmpty;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, {
      penColor: "#0e1116",
      backgroundColor: "rgba(0,0,0,0)",
      minWidth: 0.6,
      maxWidth: 2.4,
    });
    padRef.current = pad;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = pad.toData(); // preserve any existing strokes across a resize
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (data && data.length) pad.fromData(data);
    };

    pad.addEventListener("endStroke", () => {
      const empty = pad.isEmpty();
      setHasInk(!empty);
      if (empty) onEmptyRef.current?.();
      else onChangeRef.current(pad.toDataURL("image/png"));
    });

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
    // Init once; callbacks are read from refs so unstable parent callbacks
    // never tear down and re-create the pad (which was clearing the canvas).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    padRef.current?.clear();
    setHasInk(false);
    onEmptyRef.current?.();
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
