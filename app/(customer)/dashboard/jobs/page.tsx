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
  provider?: { name: string | null; phone: string } | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/post-job", label: "New Delivery" },
  { href: "/dashboard/jobs", label: "My Jobs" },
];

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELLED",
];

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function loadJobs() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/customer-login");
          return;
        }

        const url =
          filter === "ALL" ? "/api/jobs" : `/api/jobs?status=${filter}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          setJobs(data.data.jobs);
        }
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [filter, router]);

  const handleCancel = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        toast.success("Job cancelled");
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, status: "CANCELLED" } : j
          )
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Cannot cancel this job");
      }
    } catch {
      toast.error("Failed to cancel job");
    }
  };

  return (
    <>
      <DashboardNav items={NAV_ITEMS} role="Customer" />
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-12">
        <h1 className="mb-6 text-2xl font-bold text-white">My Deliveries</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setLoading(true);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-surface-800 text-surface-400 hover:text-white"
              }`}
            >
              {s === "ALL" ? "All" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No deliveries found"
            description={
              filter === "ALL"
                ? "You haven't booked any deliveries yet."
                : `No ${filter.toLowerCase().replace(/_/g, " ")} deliveries.`
            }
            action={{ label: "Book a Delivery", href: "/dashboard/post-job" }}
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
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="truncate text-sm text-white">
                      {job.pickupAddress}
                    </p>
                    <p className="truncate text-sm text-surface-400">
                      → {job.dropoffAddress}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-surface-500">
                      <span>{job.distance} km</span>
                      <span>~{job.estimatedTime} min</span>
                      {job.provider && (
                        <span>
                          Provider: {job.provider.name || job.provider.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold text-white">
                      ₦{job.totalPrice.toLocaleString()}
                    </p>
                    {["PENDING", "QUOTE_SENT", "ACCEPTED"].includes(
                      job.status
                    ) && (
                      <button
                        onClick={() => handleCancel(job.id)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
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
