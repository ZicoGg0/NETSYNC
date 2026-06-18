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
}

const NAV_ITEMS = [
  { href: "/provider/dashboard", label: "Dashboard" },
  { href: "/provider/jobs", label: "Available Jobs" },
];

export default function AvailableJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/provider-login");
          return;
        }

        const res = await fetch("/api/jobs?status=PENDING");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.data.jobs);
        }
      } catch {
        router.push("/provider-login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const acceptJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      if (res.ok) {
        toast.success("Job accepted!");
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        router.push("/provider/dashboard");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to accept job");
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
        <h1 className="mb-6 text-2xl font-bold text-white">Available Jobs</h1>

        {jobs.length === 0 ? (
          <EmptyState
            title="No available jobs"
            description="Check back soon for new delivery requests."
            action={{ label: "Refresh", href: "/provider/jobs" }}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-surface-500">
                        {job.vehicleType}
                      </span>
                      <span className="text-xs text-surface-600">
                        {new Date(job.createdAt).toLocaleString()}
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
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-brand-400">
                      ₦{job.totalPrice.toLocaleString()}
                    </p>
                    <button
                      className="btn-primary text-xs"
                      onClick={() => acceptJob(job.id)}
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
