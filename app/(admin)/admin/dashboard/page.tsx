"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  recentJobs: {
    id: string;
    status: string;
    vehicleType: string;
    totalPrice: number;
    createdAt: string;
    customer?: { name: string | null; phone: string } | null;
    provider?: { name: string | null; phone: string } | null;
  }[];
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/jobs", label: "All Jobs" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
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

        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch {
        router.push("/customer-login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading || !stats) {
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
        <h1 className="mb-6 text-2xl font-bold text-white">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-sm text-surface-400">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="card">
            <p className="text-sm text-surface-400">Total Jobs</p>
            <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
          </div>
          <div className="card">
            <p className="text-sm text-surface-400">Active Jobs</p>
            <p className="text-3xl font-bold text-brand-400">
              {stats.activeJobs}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-surface-400">Revenue</p>
            <p className="text-3xl font-bold text-green-400">
              ₦{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Jobs */}
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Jobs</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-700">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-700 bg-surface-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Provider
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-400">
                  Price
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {stats.recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-white">{job.vehicleType}</td>
                  <td className="px-4 py-3 text-surface-300">
                    {job.customer?.name || job.customer?.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-surface-300">
                    {job.provider?.name || job.provider?.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    ₦{job.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-surface-500">
                    {new Date(job.createdAt).toLocaleDateString()}
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
