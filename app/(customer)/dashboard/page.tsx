"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

interface Job {
  id: string;
  status: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPrice: number;
  estimatedTime: number;
  createdAt: string;
}

interface UserSession {
  id: string;
  phone: string;
  role: string;
  name: string | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/post-job", label: "New Delivery" },
  { href: "/dashboard/jobs", label: "My Jobs" },
];

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userRes, jobsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/jobs?limit=5"),
        ]);

        if (!userRes.ok) {
          router.push("/customer-login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.data.user);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecentJobs(jobsData.data.jobs);
        }
      } catch {
        router.push("/customer-login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
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
      <DashboardNav
        items={NAV_ITEMS}
        role="Customer"
        userName={user?.name}
      />
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-surface-400">
            Manage your deliveries and track packages
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/post-job"
            className="card flex items-center gap-4 transition-colors hover:border-brand-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600/20 text-2xl">
              📦
            </div>
            <div>
              <h3 className="font-semibold text-white">Send a Package</h3>
              <p className="text-sm text-surface-400">
                Book a new delivery
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/jobs"
            className="card flex items-center gap-4 transition-colors hover:border-brand-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20 text-2xl">
              📋
            </div>
            <div>
              <h3 className="font-semibold text-white">My Deliveries</h3>
              <p className="text-sm text-surface-400">
                View all your jobs
              </p>
            </div>
          </Link>
          <div className="card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 text-2xl">
              📍
            </div>
            <div>
              <h3 className="font-semibold text-white">Track Live</h3>
              <p className="text-sm text-surface-400">
                Real-time delivery tracking
              </p>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Recent Deliveries
          </h2>
          {recentJobs.length === 0 ? (
            <EmptyState
              title="No deliveries yet"
              description="Book your first delivery and it will appear here."
              action={{ label: "Send a Package", href: "/dashboard/post-job" }}
            />
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/jobs?id=${job.id}`}
                  className="card block transition-colors hover:border-surface-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} />
                        <span className="text-xs text-surface-500">
                          {job.vehicleType}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-white">
                        {job.pickupAddress}
                      </p>
                      <p className="truncate text-sm text-surface-400">
                        → {job.dropoffAddress}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold text-white">
                        ₦{job.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-surface-500">
                        ~{job.estimatedTime} min
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
