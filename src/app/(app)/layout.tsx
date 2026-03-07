"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { useStore } from "@/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main
        className={[
          "flex-1 overflow-y-auto transition-all",
          sidebarOpen ? "" : "pl-12",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
