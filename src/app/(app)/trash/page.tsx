"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useStore, type Note } from "@/store";

export default function TrashPage() {
  const router = useRouter();
  const { notes } = useStore();

  const trashedNotes = useMemo(
    () =>
      notes
        .filter((n) => n.isTrashed)
        .sort((a, b) => {
          const aDate = a.trashedAt ?? a.updatedAt;
          const bDate = b.trashedAt ?? b.updatedAt;
          return bDate.localeCompare(aDate);
        }),
    [notes]
  );

  const handleRestore = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTrashed: false }),
    });
    useStore.getState().restoreNote(noteId);
  };

  const handlePermanentDelete = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    useStore.getState().deleteNote(noteId);
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Permanently delete all notes in trash? This cannot be undone.")) return;
    await Promise.all(
      trashedNotes.map((n) =>
        fetch(`/api/notes/${n.id}`, { method: "DELETE" })
      )
    );
    trashedNotes.forEach((n) => useStore.getState().deleteNote(n.id));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Trash2 size={20} className="text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">Trash</h1>
          {trashedNotes.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {trashedNotes.length}
            </span>
          )}
        </div>
        {trashedNotes.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X size={14} />
            Empty Trash
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {trashedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Trash2 size={48} className="mb-4 text-gray-200" />
              <p className="text-lg font-medium text-gray-300">Trash is empty</p>
              <p className="mt-1 text-sm">Deleted notes will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trashedNotes.map((note) => (
                <TrashItem
                  key={note.id}
                  note={note}
                  onRestore={handleRestore}
                  onDelete={handlePermanentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrashItem({
  note,
  onRestore,
  onDelete,
}: {
  note: Note;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  // Extract a preview from the body
  let preview = "";
  try {
    const doc = JSON.parse(note.body);
    preview = extractText(doc).slice(0, 120);
  } catch {
    preview = note.body?.slice(0, 120) || "";
  }

  return (
    <div className="group flex items-start gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3 transition-shadow hover:shadow-sm">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {note.title || "Untitled"}
        </h3>
        {preview && (
          <p className="mt-0.5 truncate text-xs text-gray-400">{preview}</p>
        )}
        <p className="mt-1 text-[11px] text-gray-300">
          Deleted{" "}
          {formatDate(note.trashedAt ?? note.updatedAt, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onRestore(note.id)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
          title="Restore note"
        >
          <RotateCcw size={13} />
          Restore
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Delete permanently"
        >
          <X size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content
      .map((child: Record<string, unknown>) => extractText(child))
      .join(" ");
  }
  return "";
}
