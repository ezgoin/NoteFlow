import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Note {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isTrashed: boolean;
  trashedAt: string | null;
  userId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: NoteTag[];
  tasks?: Task[];
}

export interface Folder {
  id: string;
  name: string;
  sortOrder: number;
  userId: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
  subFolders?: Folder[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  userId: string;
  noteId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = "updatedAt" | "createdAt" | "title";
export type SortOrder = "asc" | "desc";

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface NoteFlowState {
  // Notes
  notes: Note[];
  activeNoteId: string | null;
  setActiveNote: (id: string | null) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  trashNote: (id: string) => void;
  restoreNote: (id: string) => void;

  // Folders
  folders: Folder[];
  activeFolderId: string | null;
  setActiveFolder: (id: string | null) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;

  // Tags
  tags: Tag[];
  addTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filters
  filterTags: string[];
  filterFolder: string | null;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setFilterTags: (tags: string[]) => void;
  setFilterFolder: (folderId: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStore = create<NoteFlowState>((set) => ({
  // Notes -----------------------------------------------------------------
  notes: [],
  activeNoteId: null,
  setActiveNote: (id) => set({ activeNoteId: id }),
  addNote: (note) =>
    set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    })),
  trashNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id
          ? { ...n, isTrashed: true, trashedAt: new Date().toISOString() }
          : n
      ),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    })),
  restoreNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, isTrashed: false, trashedAt: null } : n
      ),
    })),

  // Folders ---------------------------------------------------------------
  folders: [],
  activeFolderId: null,
  setActiveFolder: (id) => set({ activeFolderId: id }),
  addFolder: (folder) =>
    set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),
  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    })),

  // Tags ------------------------------------------------------------------
  tags: [],
  addTag: (tag) =>
    set((state) => ({ tags: [...state.tags, tag] })),
  deleteTag: (id) =>
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),

  // Tasks -----------------------------------------------------------------
  tasks: [],
  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  // Search ----------------------------------------------------------------
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filters ---------------------------------------------------------------
  filterTags: [],
  filterFolder: null,
  sortBy: "updatedAt",
  sortOrder: "desc",
  setFilterTags: (tags) => set({ filterTags: tags }),
  setFilterFolder: (folderId) => set({ filterFolder: folderId }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),

  // UI --------------------------------------------------------------------
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
