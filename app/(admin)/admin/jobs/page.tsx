"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Job {
  id: string;
  status: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPrice: number;
  distance: number;
  createdAt: string;
  customer?: { name: string | null; phone: string } | null;
  provider?: { name: string | null; phone: string } | null;
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/jobs", label: "All Jobs" },
];

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
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

        const res = await fetch("/api/jobs?limit=50");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.data.jobs);
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
        <h1 className="mb-6 text-2xl font-bold text-white">All Jobs</h1>

        <div className="overflow-x-auto rounded-xl border border-surface-700">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-700 bg-surface-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Pickup
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-400">
                  Dropoff
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
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-white">
                    {job.pickupAddress}
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-surface-300">
                    {job.dropoffAddress}
                  </td>
                  <td className="px-4 py-3 text-surface-300">
                    {job.vehicleType}
                  </td>
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
