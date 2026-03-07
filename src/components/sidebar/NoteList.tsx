"use client";

import { formatDate } from "@/lib/utils";
import { Pin, FileText, Trash2 } from "lucide-react";
import type { Note } from "@/store";

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onTrashNote?: (noteId: string) => void;
}

export default function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  onTrashNote,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-400">
        No notes yet. Create one!
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {notes.map((note) => {
        const isActive = note.id === activeNoteId;

        // Extract a preview from the body (first ~60 chars)
        let preview = "";
        try {
          const doc = JSON.parse(note.body);
          const firstText = extractText(doc);
          preview = firstText.slice(0, 80);
        } catch {
          preview = note.body?.slice(0, 80) || "";
        }

        return (
          <div
            key={note.id}
            className={[
              "group relative flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
              isActive
                ? "bg-indigo-50 border border-indigo-200"
                : "hover:bg-gray-50 border border-transparent",
            ].join(" ")}
            onClick={() => onSelectNote(note.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectNote(note.id);
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <FileText size={14} className="shrink-0 text-gray-400" />
              <span
                className={[
                  "flex-1 truncate text-sm font-medium",
                  isActive ? "text-indigo-700" : "text-gray-900",
                ].join(" ")}
              >
                {note.title || "Untitled"}
              </span>
              {note.isPinned && (
                <Pin size={12} className="shrink-0 text-indigo-400" />
              )}
              {onTrashNote && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrashNote(note.id);
                  }}
                  className="shrink-0 rounded-md p-0.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 cursor-pointer"
                  title="Move to trash"
                  aria-label="Move to trash"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            {preview && (
              <p className="truncate text-xs text-gray-400 pl-5">{preview}</p>
            )}
            <p className="text-[11px] text-gray-300 pl-5">
              {formatDate(note.updatedAt, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Recursively extract plain text from a TipTap JSON doc.
 */
function extractText(node: Record<string, unknown>): string {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content.map((child: Record<string, unknown>) => extractText(child)).join(" ");
  }
  return "";
}
