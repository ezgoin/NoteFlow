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
      });
  }, [status, setTheme]);

  // React to theme changes in the store (e.g., from settings page)
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return <>{children}</>;
}
