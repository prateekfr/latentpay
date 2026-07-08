"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 64 * 1024;

interface FileDropProps {
  value: string | null;
  onChange: (dataUri: string | null) => void;
  className?: string;
}

export default function FileDrop({ value, onChange, className = "" }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only PNG, JPG, or WebP images are supported.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`Image must be ${Math.round(MAX_BYTES / 1024)}KB or smaller.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.onerror = () => setError("Could not read that file.");
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="cursor-pointer rounded-2xl h-32 flex flex-col items-center justify-center gap-2 transition-colors"
        style={{
          border: `2px dashed ${dragging ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.12)"}`,
          background: dragging ? "rgba(139,92,246,0.06)" : "transparent",
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Brand icon preview" className="h-12 w-12 rounded-lg object-cover" />
            <span className="text-xs text-white/40">Click or drop to replace</span>
          </>
        ) : (
          <>
            <div className="text-2xl">🖼</div>
            <p className="text-xs text-white/30">Drop an image here or click to browse</p>
            <p className="text-[10px] text-white/20">PNG, JPG, WebP · ≤ 64KB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
        >
          Remove image
        </button>
      )}
      {error && <p className="mt-1.5 text-[11px] text-pink-400">{error}</p>}
    </div>
  );
}

export { FileDrop };
