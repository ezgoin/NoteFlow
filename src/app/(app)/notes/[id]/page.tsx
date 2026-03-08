"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff, Trash2, ArrowLeft, Save } from "lucide-react";
import NoteEditor from "@/components/editor/Editor";
import TagPicker from "@/components/tags/TagPicker";
import TagBadge from "@/components/tags/TagBadge";
import { useStore } from "@/store";
import { debounce } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface NoteTag {
  tagId: string;
  tag: Tag;
}

interface NoteData {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  folderId: string | null;
  tags: NoteTag[];
}

export default function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [note, setNote] = useState<NoteData | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const togglingTag = useRef(false);
  const tags = useStore((s) => s.tags);

  // Fetch note
  useEffect(() => {
    const fetchNote = async () => {
      const res = await fetch(`/api/notes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setNote(data);
        setTitle(data.title);
        useStore.getState().setActiveNote(id);
      } else {
        router.push("/notes");
      }
    };
    fetchNote();

    return () => {
      useStore.getState().setActiveNote(null);
    };
  }, [id, router]);

  // Save function
  const saveNote = useCallback(
    async (updates: Partial<NoteData>) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = await res.json();
          setLastSaved(new Date());
          useStore.getState().updateNote(id, updated);
        }
      } catch (error) {
        console.error("Save failed:", error);
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  // Auto-save body with debounce
  const debouncedSaveBody = useRef(
    debounce((body: string) => {
      saveNote({ body } as Partial<NoteData>);
    }, 1000)
  ).current;

  const handleBodyChange = (json: string) => {
    if (note) {
      setNote({ ...note, body: json });
    }
    debouncedSaveBody(json);
  };

  // Auto-save title with debounce
  const debouncedSaveTitle = useRef(
    debounce((newTitle: string) => {
      saveNote({ title: newTitle } as Partial<NoteData>);
    }, 800)
  ).current;

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSaveTitle(newTitle);
  };

  // Toggle pin
  const handleTogglePin = async () => {
    if (!note) return;
    const newPinned = !note.isPinned;
    setNote({ ...note, isPinned: newPinned });
    await saveNote({ isPinned: newPinned } as Partial<NoteData>);
  };

  // Move note to trash
  const handleDelete = async () => {
    if (!confirm("Move this note to trash?")) return;
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTrashed: true }),
    });
    useStore.getState().trashNote(id);
    router.push("/notes");
  };

  // Tag toggle (guarded against concurrent calls)
  const handleTagToggle = async (tagId: string) => {
    if (!note || togglingTag.current) return;
    togglingTag.current = true;
    try {
      const currentTagIds = note.tags.map((nt) => nt.tagId);
      const newTagIds = currentTagIds.includes(tagId)
        ? currentTagIds.filter((t) => t !== tagId)
        : [...currentTagIds, tagId];

      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: newTagIds }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNote(updated);
        useStore.getState().updateNote(id, updated);
      }
    } finally {
      togglingTag.current = false;
    }
  };

  // Create tag
  const handleCreateTag = async (name: string, color: string) => {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const newTag = await res.json();
      useStore.getState().addTag(newTag);
      // Also add it to the note
      handleTagToggle(newTag.id);
    }
  };

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const selectedTagIds = note.tags.map((nt) => nt.tagId);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/notes")}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer md:hidden"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Save indicator */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            {saving ? (
              <>
                <Save size={12} className="animate-pulse" />
                Saving...
              </>
            ) : lastSaved ? (
              <>
                <Save size={12} />
                Saved
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={[
              "rounded-md p-1.5 transition-colors cursor-pointer",
              note.isPinned
                ? "text-accent bg-accent-light hover:opacity-80"
                : "text-text-muted hover:bg-surface-hover hover:text-text-secondary",
            ].join(" ")}
            title={note.isPinned ? "Unpin note" : "Pin note"}
          >
            {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md p-1.5 text-text-muted hover:bg-danger-light hover:text-danger transition-colors cursor-pointer"
            title="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Note title"
            className="w-full bg-transparent text-2xl font-bold text-text-primary placeholder:text-text-placeholder focus:outline-none"
          />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {note.tags.map((nt) => (
              <TagBadge
                key={nt.tagId}
                name={nt.tag.name}
                color={nt.tag.color}
                onRemove={() => handleTagToggle(nt.tagId)}
              />
            ))}
            <TagPicker
              availableTags={tags}
              selectedTagIds={selectedTagIds}
              onToggle={handleTagToggle}
              onCreate={handleCreateTag}
            />
          </div>

          {/* Editor */}
          <NoteEditor
            content={note.body}
            onUpdate={handleBodyChange}
            placeholder="Start writing your note..."
          />
        </div>
      </div>
    </div>
  );
}
