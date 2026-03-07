"use client";

import { X } from "lucide-react";

interface TagBadgeProps {
  name: string;
  /** CSS color string, e.g. "#6366f1". */
  color: string;
  /** If provided, an x button is shown that calls this handler. */
  onRemove?: () => void;
}

/**
 * Converts a hex colour to an rgba string with the given alpha.
 * Falls back to the original value if parsing fails.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6 && cleaned.length !== 3) return hex;

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TagBadge({ name, color, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 select-none transition-colors"
      style={{
        backgroundColor: hexToRgba(color, 0.12),
        color,
      }}
    >
      <span
        className="inline-block size-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      {name}

      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10 cursor-pointer"
          aria-label={`Remove tag ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
