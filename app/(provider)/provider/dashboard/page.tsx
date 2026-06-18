"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

interface Job {
  id: string;
  status: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPrice: number;
  distance: number;
  estimatedTime: number;
  createdAt: string;
  customer?: { name: string | null; phone: string } | null;
}

const NAV_ITEMS = [
  { href: "/provider/dashboard", label: "Dashboard" },
  { href: "/provider/jobs", label: "Available Jobs" },
];

export default function ProviderDashboard() {
  const router = useRouter();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/provider-login");
          return;
        }

        const userData = await authRes.json();
        if (userData.data.user.role !== "PROVIDER") {
          router.push("/provider-login");
          return;
        }

        const res = await fetch("/api/jobs?limit=10");
        if (res.ok) {
          const data = await res.json();
          setMyJobs(data.data.jobs);
        }
      } catch {
        router.push("/provider-login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const updateStatus = async (jobId: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Job updated to ${status}`);
        setMyJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status } : j))
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <DashboardNav items={NAV_ITEMS} role="Provider" />
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-12">
        <h1 className="mb-6 text-2xl font-bold text-white">
          My Active Deliveries
        </h1>

        {myJobs.length === 0 ? (
          <EmptyState
            title="No active deliveries"
            description="Browse available jobs to start delivering."
            action={{ label: "Browse Jobs", href: "/provider/jobs" }}
          />
        ) : (
          <div className="space-y-3">
            {myJobs.map((job) => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-surface-500">
                        {job.vehicleType}
                      </span>
                    </div>
                    <p className="truncate text-sm text-white">
                      {job.pickupAddress}
                    </p>
                    <p className="truncate text-sm text-surface-400">
                      → {job.dropoffAddress}
                    </p>
                    <p className="mt-1 text-xs text-surface-500">
                      {job.distance} km · ~{job.estimatedTime} min
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold text-brand-400">
                      ₦{job.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-surface-700 pt-3">
                  {job.status === "ACCEPTED" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => updateStatus(job.id, "DRIVER_ARRIVING")}
                    >
                      Mark Arriving
                    </button>
                  )}
                  {job.status === "DRIVER_ARRIVING" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => updateStatus(job.id, "PICKED_UP")}
                    >
                      Picked Up
                    </button>
                  )}
                  {job.status === "PICKED_UP" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => updateStatus(job.id, "DELIVERED")}
                    >
                      Delivered
                    </button>
                  )}
                  {job.status === "DELIVERED" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => updateStatus(job.id, "COMPLETED")}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
