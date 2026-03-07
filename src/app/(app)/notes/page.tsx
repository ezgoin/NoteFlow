"use client";

import { StickyNote } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
        <StickyNote size={40} className="text-indigo-400" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome to NoteFlow
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Select a note or create a new one to get started.
        </p>
      </div>
    </div>
  );
}
