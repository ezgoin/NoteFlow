"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: Priority;
  dueDate?: string | Date | null;
}

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onTitleChange: (taskId: string, newTitle: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Priority styling                                                  */
/* ------------------------------------------------------------------ */

const priorityConfig: Record<Priority, { label: string; classes: string }> = {
  low: { label: "Low", classes: "bg-surface-hover text-text-tertiary" },
  medium: { label: "Medium", classes: "bg-status-blue/10 text-status-blue" },
  high: { label: "High", classes: "bg-status-orange/10 text-status-orange" },
  urgent: { label: "Urgent", classes: "bg-status-red/10 text-status-red" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onTitleChange,
}: TaskItemProps) {
  const isDone = task.status === "done";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleChange(task.id, trimmed);
    } else {
      setDraft(task.title);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setDraft(task.title);
      setEditing(false);
    }
  };

  // Format the due date and determine if it is overdue.
  let dueDateLabel: string | null = null;
  let dueDateOverdue = false;
  if (task.dueDate) {
    const d =
      typeof task.dueDate === "string" ? new Date(task.dueDate) : task.dueDate;
    dueDateLabel = isToday(d) ? "Today" : format(d, "MMM d");
    dueDateOverdue = !isDone && isPast(d) && !isToday(d);
  }

  const priority = priorityConfig[task.priority] ?? priorityConfig.medium;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-shadow hover:shadow-sm">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={[
          "flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors cursor-pointer",
          isDone
            ? "border-accent bg-accent"
            : "border-border-strong hover:border-accent",
        ].join(" ")}
        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
      >
        {isDone && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="white"
            className="size-3"
          >
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Title (click to inline-edit) */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-accent bg-accent-light/40 px-1.5 py-0.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={[
              "w-full truncate text-left text-sm cursor-pointer transition-colors",
              isDone ? "text-text-muted line-through" : "text-text-primary",
            ].join(" ")}
            title="Click to edit title"
          >
            {task.title}
          </button>
        )}
      </div>

      {/* Priority badge */}
      <span
        className={[
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 select-none",
          priority.classes,
        ].join(" ")}
      >
        {priority.label}
      </span>

      {/* Due date */}
      {dueDateLabel && (
        <span
          className={[
            "flex shrink-0 items-center gap-1 text-xs whitespace-nowrap",
            dueDateOverdue ? "text-danger font-medium" : "text-text-tertiary",
          ].join(" ")}
        >
          <Calendar size={12} />
          {dueDateLabel}
        </span>
      )}

      {/* Action buttons (visible on hover) */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(task.id)}
          className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded-md p-1.5 text-text-tertiary hover:bg-danger-light hover:text-danger transition-colors cursor-pointer"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
