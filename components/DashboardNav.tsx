"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface NavItem {
  href: string;
  label: string;
}

interface DashboardNavProps {
  items: NavItem[];
  role: string;
  userName?: string | null;
}

export default function DashboardNav({
  items,
  role,
  userName,
}: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-surface-800 bg-surface-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-white">
            Net<span className="text-brand-500">sync</span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-surface-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-surface-400 sm:block">
            {userName || role}
          </span>
          <span className="badge-active text-xs">{role}</span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm text-surface-400 hover:text-red-400 transition-colors"
          >
            {loggingOut ? "..." : "Log out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
