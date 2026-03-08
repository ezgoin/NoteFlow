"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  PanelLeftClose,
  Settings,
  StickyNote,
  Tag,
  Trash2,
} from "lucide-react";
import { useStore } from "@/store";
import FolderTree from "./FolderTree";
import TagBadge from "@/components/tags/TagBadge";

export default function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    notes,
    folders,
    tags,
    activeFolderId,
    filterTags,
    sidebarOpen,
    setActiveFolder,
    setFilterTags,
    setSidebarOpen,
  } = useStore();

  // Fetch folders, tags, notes on mount
  const fetchFolders = useCallback(async () => {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const data = await res.json();
      useStore.setState({ folders: data });
    }
  }, []);

  const fetchTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    if (res.ok) {
      const data = await res.json();
      useStore.setState({ tags: data });
    }
  }, []);

  // Always fetch ALL notes (no filter params) so the store has the complete set.
  const fetchNotes = useCallback(async () => {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      useStore.setState({ notes: data });
    }
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchTags();
    fetchNotes();
  }, [fetchFolders, fetchTags, fetchNotes]);

  // Folder handlers
  const handleCreateFolder = async (
    name: string,
    parentFolderId?: string | null
  ) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentFolderId }),
    });
    if (res.ok) {
      fetchFolders();
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchFolders();
  };

  const handleDeleteFolder = async (id: string) => {
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (activeFolderId === id) setActiveFolder(null);
    fetchFolders();
    fetchNotes();
  };

  const toggleTagFilter = (tagId: string) => {
    if (filterTags.includes(tagId)) {
      setFilterTags(filterTags.filter((id) => id !== tagId));
    } else {
      setFilterTags([...filterTags, tagId]);
    }
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-2 top-2 z-30 rounded-lg bg-surface p-2 shadow-md border border-border hover:bg-surface-hover transition-colors cursor-pointer"
        title="Open sidebar"
      >
        <StickyNote size={20} className="text-accent" />
      </button>
    );
  }

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-accent">NoteFlow</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Scrollable content: Folders → Tags → Trash */}
      <div className="flex-1 overflow-y-auto">
        {/* Folders */}
        <div className="px-3 py-3">
          <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Folders
          </p>
          <FolderTree
            folders={folders}
            activeFolderId={activeFolderId}
            onSelectFolder={(id) => {
              setActiveFolder(id);
              router.push("/notes");
            }}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        <hr className="border-border" />

        {/* Tags filter */}
        <div className="px-3 py-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Tag size={12} />
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {tags.map((tag) => {
              const isActive = filterTags.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleTagFilter(tag.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTagFilter(tag.id);
                    }
                  }}
                  className={[
                    "cursor-pointer rounded-full transition-opacity inline-flex",
                    isActive
                      ? "ring-2 ring-text-muted"
                      : "opacity-80 hover:opacity-100",
                  ].join(" ")}
                >
                  <TagBadge name={tag.name} color={tag.color} />
                </div>
              );
            })}
            {tags.length === 0 && (
              <p className="text-xs text-text-muted">No tags yet</p>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Trash */}
        <div className="px-3 py-1.5">
          <button
            onClick={() => router.push("/trash")}
            className="flex w-full items-center gap-2 rounded-md px-1 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            Trash
            {notes.filter((n) => n.isTrashed).length > 0 && (
              <span className="ml-auto rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                {notes.filter((n) => n.isTrashed).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* User / Settings / Sign out — pinned to bottom */}
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-1.5 truncate rounded-md px-2 py-1 text-xs text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings size={13} className="shrink-0" />
            <span className="truncate">{session?.user?.email}</span>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
