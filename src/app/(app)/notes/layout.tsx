"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useStore } from "@/store";
import NoteList from "@/components/sidebar/NoteList";
import SearchBar from "@/components/ui/SearchBar";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    notes,
    activeNoteId,
    activeFolderId,
    searchQuery,
    filterTags,
    sortBy,
    sortOrder,
    setActiveNote,
    setSearchQuery,
    trashNote,
  } = useStore();

  // Compute the filtered, sorted notes to display
  const displayNotes = useMemo(() => {
    // Exclude trashed notes from the main view
    let filtered = notes.filter((n) => !n.isTrashed);

    // Folder filter
    if (activeFolderId) {
      filtered = filtered.filter((n) => n.folderId === activeFolderId);
    }

    // Search filter (case-insensitive title + body text match)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((n) => {
        const titleMatch = (n.title ?? "").toLowerCase().includes(q);
        if (titleMatch) return true;
        // Also search body text
        try {
          const doc = JSON.parse(n.body);
          const bodyText = extractText(doc).toLowerCase();
          return bodyText.includes(q);
        } catch {
          return (n.body ?? "").toLowerCase().includes(q);
        }
      });
    }

    // Tag filter (note must have ALL selected tags)
    if (filterTags.length > 0) {
      filtered = filtered.filter((note) => {
        const noteTagIds =
          note.tags?.map((nt: { tagId: string }) => nt.tagId) ?? [];
        return filterTags.every((tid) => noteTagIds.includes(tid));
      });
    }

    // Sort: pinned notes always first, then by chosen field
    filtered = [...filtered].sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const field = sortBy as keyof typeof a;
      const aVal = a[field] ?? "";
      const bVal = b[field] ?? "";

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return filtered;
  }, [notes, activeFolderId, searchQuery, filterTags, sortBy, sortOrder]);

  // Create new note
  const handleNewNote = useCallback(async () => {
    const body: Record<string, string | null> = {};
    if (activeFolderId) body.folderId = activeFolderId;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const note = await res.json();
      useStore.getState().addNote(note);
      setActiveNote(note.id);
      router.push(`/notes/${note.id}`);
    }
  }, [activeFolderId, setActiveNote, router]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      setActiveNote(noteId);
      router.push(`/notes/${noteId}`);
    },
    [setActiveNote, router]
  );

  const handleTrashNote = useCallback(
    async (noteId: string) => {
      if (!confirm("Move this note to trash?")) return;
      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrashed: true }),
      });
      trashNote(noteId);
      if (activeNoteId === noteId) {
        router.push("/notes");
      }
    },
    [trashNote, activeNoteId, router]
  );

  return (
    <div className="flex h-full">
      {/* Notes list panel */}
      <div className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-gray-50/50">
        {/* Search */}
        <div className="px-3 pt-3">
          <SearchBar
            value={searchQuery}
            onChange={(v) => setSearchQuery(v)}
            placeholder="Search notes..."
          />
        </div>

        {/* New note button */}
        <div className="px-3 pt-3">
          <button
            onClick={handleNewNote}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
          <NoteList
            notes={displayNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onTrashNote={handleTrashNote}
          />
        </div>
      </div>

      {/* Editor / welcome area */}
      <div className="flex-1 overflow-y-auto">{children}</div>
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
    return node.content
      .map((child: Record<string, unknown>) => extractText(child))
      .join(" ");
  }
  return "";
}
