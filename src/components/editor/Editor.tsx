"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExt from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useEffect, useRef, useCallback } from "react";
import MenuBar from "./MenuBar";

interface NoteEditorProps {
  content: string; // JSON string
  onUpdate: (json: string) => void;
  placeholder?: string;
}

export default function NoteEditor({
  content,
  onUpdate,
  placeholder = "Start writing...",
}: NoteEditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Track the last content string so we only call setContent for external changes
  // (e.g. navigating between notes), not for our own editor updates.
  const lastContentRef = useRef(content);

  const handleUpdate = useCallback(
    ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
      if (!editor) return;
      const json = JSON.stringify(editor.getJSON());
      lastContentRef.current = json;
      onUpdateRef.current(json);
    },
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // We use the standalone extension
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      UnderlineExt,
      HorizontalRule,
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    content: content ? JSON.parse(content) : undefined,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none px-4 py-3 focus:outline-none",
      },
    },
  });

  // Sync content only when navigating between notes (external content change).
  // Self-generated changes are tracked via lastContentRef in handleUpdate above.
  useEffect(() => {
    if (!editor) return;
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      try {
        const parsed = content ? JSON.parse(content) : { type: "doc", content: [] };
        editor.commands.setContent(parsed, { emitUpdate: false });
      } catch {
        editor.commands.setContent(content || "", { emitUpdate: false });
      }
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
