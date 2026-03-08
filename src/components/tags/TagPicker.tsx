"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Check, Plus, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagPickerProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  onCreate: (name: string, color: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Predefined colour palette (8 colours)                             */
/* ------------------------------------------------------------------ */

const COLOR_PALETTE = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#a855f7", // purple
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function TagPicker({
  availableTags,
  selectedTagIds,
  onToggle,
  onCreate,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(COLOR_PALETTE[6]); // indigo default
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus the new-tag input when switching to create mode.
  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const handleCreate = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed, newColor);
    setNewName("");
    setNewColor(COLOR_PALETTE[6]);
    setCreating(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm hover:bg-surface-hover transition-colors cursor-pointer"
      >
        Tags
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 z-40 mt-1.5 w-64 origin-top-left rounded-xl border border-border bg-surface shadow-lg">
          {/* Tag list */}
          <div className="max-h-56 overflow-y-auto p-1.5">
            {availableTags.length === 0 && !creating && (
              <p className="px-3 py-2 text-sm text-text-muted">No tags yet</p>
            )}

            {availableTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggle(tag.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {/* Colour-coded checkbox */}
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded border transition-colors"
                    style={{
                      borderColor: tag.color,
                      backgroundColor: selected ? tag.color : "transparent",
                    }}
                  >
                    {selected && <Check size={12} className="text-white" />}
                  </span>

                  <span className="truncate">{tag.name}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Create new tag */}
          {creating ? (
            <form onSubmit={handleCreate} className="p-3 space-y-2.5">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tag name"
                className="w-full rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent"
              />

              {/* Colour swatches */}
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={[
                      "size-6 rounded-full transition-transform hover:scale-110 cursor-pointer",
                      newColor === c
                        ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                        : "",
                    ].join(" ")}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-md px-2.5 py-1 text-xs text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newName.trim().length === 0}
                  className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-accent hover:bg-accent-light transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Create new tag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
