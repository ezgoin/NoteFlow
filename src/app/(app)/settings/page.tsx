"use client";

import { useSession } from "next-auth/react";
import { ArrowLeft, Check, User, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore, type Theme } from "@/store";

/* ------------------------------------------------------------------ */
/*  Theme definitions                                                  */
/* ------------------------------------------------------------------ */

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  /** Colours for the mini preview card */
  preview: {
    sidebar: string;
    content: string;
    accent: string;
    text: string;
    border: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright",
    preview: {
      sidebar: "#f9fafb",
      content: "#ffffff",
      accent: "#6366f1",
      text: "#374151",
      border: "#e5e7eb",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes",
    preview: {
      sidebar: "#15171a",
      content: "#1e2228",
      accent: "#818cf8",
      text: "#f3f4f6",
      border: "#2a2e34",
    },
  },
  {
    id: "aubergine",
    name: "Aubergine",
    description: "Rich and elegant",
    preview: {
      sidebar: "#3e1042",
      content: "#1a1d21",
      accent: "#e0a7f0",
      text: "#f3f4f6",
      border: "#5c2d5e",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue calm",
    preview: {
      sidebar: "#070d18",
      content: "#0f172a",
      accent: "#38bdf8",
      text: "#f1f5f9",
      border: "#1e293b",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Theme Preview Card                                                 */
/* ------------------------------------------------------------------ */

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { preview } = theme;

  return (
    <button
      onClick={onSelect}
      className={[
        "group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all cursor-pointer",
        isActive
          ? "border-accent ring-2 ring-accent/30 shadow-md"
          : "border-border hover:border-text-muted hover:shadow-sm",
      ].join(" ")}
    >
      {/* Mini mockup */}
      <div className="flex h-28 w-full">
        {/* Sidebar */}
        <div
          className="flex w-1/3 flex-col gap-1.5 p-2"
          style={{ backgroundColor: preview.sidebar }}
        >
          {/* Logo placeholder */}
          <div
            className="h-2 w-10 rounded-sm"
            style={{ backgroundColor: preview.accent }}
          />
          {/* Nav items */}
          <div className="mt-1 space-y-1">
            <div
              className="h-1.5 w-full rounded-sm opacity-40"
              style={{ backgroundColor: preview.text }}
            />
            <div
              className="h-1.5 w-3/4 rounded-sm opacity-25"
              style={{ backgroundColor: preview.text }}
            />
            <div
              className="h-1.5 w-5/6 rounded-sm opacity-25"
              style={{ backgroundColor: preview.text }}
            />
          </div>
        </div>

        {/* Content area */}
        <div
          className="flex flex-1 flex-col gap-1.5 p-2"
          style={{
            backgroundColor: preview.content,
            borderLeft: `1px solid ${preview.border}`,
          }}
        >
          {/* Title bar */}
          <div
            className="h-2 w-16 rounded-sm"
            style={{ backgroundColor: preview.text, opacity: 0.5 }}
          />
          {/* Content lines */}
          <div className="mt-1 space-y-1">
            <div
              className="h-1.5 w-full rounded-sm opacity-20"
              style={{ backgroundColor: preview.text }}
            />
            <div
              className="h-1.5 w-5/6 rounded-sm opacity-15"
              style={{ backgroundColor: preview.text }}
            />
            <div
              className="h-1.5 w-3/4 rounded-sm opacity-15"
              style={{ backgroundColor: preview.text }}
            />
            <div
              className="h-1.5 w-2/3 rounded-sm opacity-10"
              style={{ backgroundColor: preview.text }}
            />
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderTop: `1px solid ${preview.border}` }}
      >
        <div className="text-left">
          <p className="text-sm font-medium text-text-primary">{theme.name}</p>
          <p className="text-xs text-text-muted">{theme.description}</p>
        </div>
        {isActive && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
            <Check size={12} />
          </div>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Page                                                      */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <button
          onClick={() => router.push("/notes")}
          className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-10">
          {/* Appearance */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Palette size={18} className="text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">
                Appearance
              </h2>
            </div>
            <p className="mb-5 text-sm text-text-tertiary">
              Choose a theme for your workspace. The theme is synced across
              devices.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={theme === t.id}
                  onSelect={() => setTheme(t.id)}
                />
              ))}
            </div>
          </section>

          {/* Account */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <User size={18} className="text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">
                Account
              </h2>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div>
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Name
                </p>
                <p className="mt-0.5 text-sm text-text-primary">
                  {session?.user?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Email
                </p>
                <p className="mt-0.5 text-sm text-text-primary">
                  {session?.user?.email || "—"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
