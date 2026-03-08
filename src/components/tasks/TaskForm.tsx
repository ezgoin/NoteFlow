"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "done";

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO date string or ""
}

interface TaskFormProps {
  /** Supply initial values when editing an existing task. */
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  /** If true the submit button shows a loading spinner. */
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

/* ------------------------------------------------------------------ */
/*  Shared select styling                                             */
/* ------------------------------------------------------------------ */

const selectClassName =
  "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent cursor-pointer appearance-none";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [priority, setPriority] = useState<Priority>(
    initialValues?.priority ?? "medium"
  );
  const [status, setStatus] = useState<Status>(
    initialValues?.status ?? "todo"
  );
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [titleError, setTitleError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }

    setTitleError("");
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status,
      dueDate,
    });
  };

  const isEditing = Boolean(initialValues);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Title"
        required
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (titleError) setTitleError("");
        }}
        placeholder="What needs to be done?"
        error={titleError}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="task-description"
          className="text-sm font-medium text-text-secondary select-none"
        >
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent resize-y"
        />
      </div>

      {/* Priority & Status side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-priority"
            className="text-sm font-medium text-text-secondary select-none"
          >
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={selectClassName}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-status"
            className="text-sm font-medium text-text-secondary select-none"
          >
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={selectClassName}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date */}
      <Input
        label="Due date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditing ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
