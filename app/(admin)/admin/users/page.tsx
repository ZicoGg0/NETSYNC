"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { customerJobs: number; providerJobs: number };
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/jobs", label: "All Jobs" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/customer-login");
          return;
        }
        const userData = await authRes.json();
        if (userData.data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.data.users);
        }
      } catch {
        router.push("/customer-login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <DashboardNav items={NAV_ITEMS} role="Admin" />
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-12">
        <h1 className="mb-6 text-2xl font-bold text-white">User Management</h1>

        <div className="overflow-x-auto rounded-xl border border-surface-700">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-700 bg-surface-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Role
                </th>
                <th className="px-4 py-3 text-center font-medium text-surface-400">
                  Jobs
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-400">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3 text-white">{user.phone}</td>
                  <td className="px-4 py-3 text-surface-300">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        user.role === "ADMIN"
                          ? "bg-red-500/10 text-red-400"
                          : user.role === "PROVIDER"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-brand-500/10 text-brand-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-surface-300">
                    {user._count.customerJobs + user._count.providerJobs}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        user.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-surface-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
