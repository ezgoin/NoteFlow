"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore, type Theme } from "@/store";

const VALID_THEMES: Theme[] = ["light", "dark", "aubergine", "ocean"];
const STORAGE_KEY = "noteflow-theme";

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  // Help native elements (selects, scrollbars) respect dark/light
  document.documentElement.style.colorScheme =
    theme === "light" ? "light" : "dark";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const { status } = useSession();
  const hasFetched = useRef(false);
  // Track whether we're in the initial hydration phase so we don't
  // persist the default store value ("light") back to the server.
  const isHydrating = useRef(true);

  // On mount: apply cached theme from localStorage immediately
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (cached && VALID_THEMES.includes(cached)) {
      setTheme(cached);
      applyTheme(cached);
    }
  }, [setTheme]);

  // Fetch theme from server when authenticated
  useEffect(() => {
    if (status !== "authenticated" || hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/user/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.theme && VALID_THEMES.includes(data.theme)) {
          setTheme(data.theme);
          applyTheme(data.theme);
          localStorage.setItem(STORAGE_KEY, data.theme);
        }
      })
      .catch(() => {
        // Silently fail — use cached or default theme
      })
      .finally(() => {
        // Hydration is complete — future theme changes are user-initiated
        isHydrating.current = false;
      });
  }, [status, setTheme]);

  // React to theme changes in the store (e.g., from settings page)
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Persist to server when the user actively changes the theme
    // (skip during initial hydration to avoid writing defaults back)
    if (!isHydrating.current && status === "authenticated") {
      fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      }).catch(() => {
        // Silently fail — localStorage still has the value
      });
    }
  }, [theme, status]);

  return <>{children}</>;
}
