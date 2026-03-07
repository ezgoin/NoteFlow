"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, ArrowUpDown } from "lucide-react";
import TaskItem from "@/components/tasks/TaskItem";
import TaskForm from "@/components/tasks/TaskForm";
import Modal from "@/components/ui/Modal";
import { useStore, type Task } from "@/store";

type StatusGroup = "todo" | "in_progress" | "done";

const STATUS_LABELS: Record<StatusGroup, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLORS: Record<StatusGroup, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
};

export default function TasksPage() {
  const { tasks } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterPriority !== "all") params.set("priority", filterPriority);

    const res = await fetch(`/api/tasks?${params}`);
    if (res.ok) {
      const data = await res.json();
      useStore.setState({ tasks: data });
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (values: {
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
  }) => {
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        dueDate: values.dueDate || null,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      fetchTasks();
    }
    setLoading(false);
  };

  const handleEditTask = async (values: {
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
  }) => {
    if (!editingTask) return;
    setLoading(true);
    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        dueDate: values.dueDate || null,
      }),
    });
    if (res.ok) {
      setEditingTask(null);
      fetchTasks();
    }
    setLoading(false);
  };

  const handleToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    useStore.getState().deleteTask(taskId);
    fetchTasks();
  };

  const handleTitleChange = async (taskId: string, newTitle: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchTasks();
  };

  // Group tasks by status
  const grouped: Record<StatusGroup, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  tasks.forEach((task) => {
    const group = (task.status as StatusGroup) || "todo";
    if (grouped[group]) grouped[group].push(task);
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={[
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-pointer",
              showFilters
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            <Filter size={14} />
            Filters
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-3 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">
              Priority:
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      )}

      {/* Task groups */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {(["todo", "in_progress", "done"] as StatusGroup[]).map((status) => {
            const groupTasks = grouped[status];
            if (filterStatus !== "all" && filterStatus !== status) return null;

            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_COLORS[status],
                    ].join(" ")}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {groupTasks.length}
                  </span>
                </div>

                {groupTasks.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-300">
                    No tasks
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {groupTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task as Task & { priority: "low" | "medium" | "high" | "urgent" }}
                        onToggle={handleToggle}
                        onEdit={(taskId) => {
                          const t = tasks.find((x) => x.id === taskId);
                          if (t) setEditingTask(t);
                        }}
                        onDelete={handleDelete}
                        onTitleChange={handleTitleChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create task modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Task"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit task modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            initialValues={{
              title: editingTask.title,
              description: editingTask.description || "",
              priority: editingTask.priority as "low" | "medium" | "high" | "urgent",
              status: editingTask.status as "todo" | "in_progress" | "done",
              dueDate: editingTask.dueDate
                ? new Date(editingTask.dueDate).toISOString().split("T")[0]
                : "",
            }}
            onSubmit={handleEditTask}
            onCancel={() => setEditingTask(null)}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}
