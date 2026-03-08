"use client";

import { useState } from "react";
import {
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { Folder } from "@/store";

interface FolderTreeProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

interface FolderNodeProps {
  folder: Folder;
  depth: number;
  activeFolderId: string | null;
  editingFolderId: string | null;
  onSetEditingFolder: (id: string | null) => void;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function FolderNode({
  folder,
  depth,
  activeFolderId,
  editingFolderId,
  onSetEditingFolder,
  onSelect,
  onCreateChild,
  onRename,
  onDelete,
}: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showNewChild, setShowNewChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");

  const hasChildren = folder.subFolders && folder.subFolders.length > 0;
  const isActive = activeFolderId === folder.id;
  const editing = editingFolderId === folder.id;

  const startEditing = () => {
    setEditName(folder.name);
    onSetEditingFolder(folder.id);
  };

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed);
    } else {
      setEditName(folder.name);
    }
    onSetEditingFolder(null);
  };

  const cancelEditing = () => {
    setEditName(folder.name);
    onSetEditingFolder(null);
  };

  const handleCreateChild = () => {
    const trimmed = newChildName.trim();
    if (trimmed) {
      onCreateChild(folder.id, trimmed);
      setNewChildName("");
      setShowNewChild(false);
      setExpanded(true);
    }
  };

  return (
    <div>
      <div
        className={[
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors cursor-pointer",
          isActive
            ? "bg-accent-light text-accent font-medium"
            : "text-text-secondary hover:bg-surface-hover",
        ].join(" ")}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={[
            "rounded p-0.5 transition-transform cursor-pointer",
            hasChildren ? "text-text-muted" : "invisible",
          ].join(" ")}
        >
          <ChevronRight
            size={14}
            className={expanded ? "rotate-90 transition-transform" : "transition-transform"}
          />
        </button>

        {/* Folder icon */}
        {expanded && hasChildren ? (
          <FolderOpen size={16} className="shrink-0 text-accent" />
        ) : (
          <FolderIcon size={16} className="shrink-0 text-text-muted" />
        )}

        {/* Folder name OR rename input — NOT nested inside a button */}
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleRename();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                cancelEditing();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-accent bg-surface px-1.5 py-0.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
          />
        ) : (
          <button
            onClick={() => onSelect(folder.id)}
            className="flex-1 text-left truncate min-w-0 cursor-pointer"
          >
            {folder.name}
          </button>
        )}

        {/* Actions (visible on hover) */}
        {!editing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {depth < 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewChild(true);
                  setExpanded(true);
                }}
                className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary cursor-pointer"
                title="New subfolder"
              >
                <Plus size={12} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditing();
              }}
              className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary cursor-pointer"
              title="Rename"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!confirm("Delete this folder? Notes inside will be moved to All Notes.")) return;
                onDelete(folder.id);
              }}
              className="rounded p-1 text-text-muted hover:bg-danger-light hover:text-danger cursor-pointer"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* New subfolder input */}
      {showNewChild && (
        <div
          className="flex items-center gap-1.5 px-2 py-1"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
        >
          <FolderIcon size={14} className="shrink-0 text-text-placeholder" />
          <input
            autoFocus
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleCreateChild();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setShowNewChild(false);
                setNewChildName("");
              }
            }}
            className="flex-1 rounded border border-border-strong bg-surface px-1.5 py-0.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleCreateChild}
            className="rounded p-1 text-success hover:bg-success-light cursor-pointer"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setShowNewChild(false);
              setNewChildName("");
            }}
            className="rounded p-1 text-text-muted hover:bg-surface-hover cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {folder.subFolders!.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              activeFolderId={activeFolderId}
              editingFolderId={editingFolderId}
              onSetEditingFolder={onSetEditingFolder}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [showNewRoot, setShowNewRoot] = useState(false);
  const [newRootName, setNewRootName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  const handleCreateRoot = () => {
    const trimmed = newRootName.trim();
    if (trimmed) {
      onCreateFolder(trimmed, null);
      setNewRootName("");
      setShowNewRoot(false);
    }
  };

  return (
    <div className="space-y-0.5">
      {/* All Notes */}
      <button
        onClick={() => onSelectFolder(null)}
        className={[
          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer",
          activeFolderId === null
            ? "bg-accent-light text-accent font-medium"
            : "text-text-secondary hover:bg-surface-hover",
        ].join(" ")}
      >
        <FolderIcon size={16} className="shrink-0" />
        All Notes
      </button>

      {/* Folder tree */}
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          activeFolderId={activeFolderId}
          editingFolderId={editingFolderId}
          onSetEditingFolder={setEditingFolderId}
          onSelect={(id) => onSelectFolder(id)}
          onCreateChild={(parentId, name) => onCreateFolder(name, parentId)}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
        />
      ))}

      {/* New root folder */}
      {showNewRoot ? (
        <div className="flex items-center gap-1.5 px-3 py-1">
          <FolderIcon size={14} className="shrink-0 text-text-placeholder" />
          <input
            autoFocus
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleCreateRoot();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setShowNewRoot(false);
                setNewRootName("");
              }
            }}
            className="flex-1 rounded border border-border-strong bg-surface px-1.5 py-0.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleCreateRoot}
            className="rounded p-1 text-success hover:bg-success-light cursor-pointer"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setShowNewRoot(false);
              setNewRootName("");
            }}
            className="rounded p-1 text-text-muted hover:bg-surface-hover cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewRoot(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer"
        >
          <Plus size={14} />
          New folder
        </button>
      )}
    </div>
  );
}
