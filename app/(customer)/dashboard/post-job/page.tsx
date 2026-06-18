"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import toast from "react-hot-toast";

type VehicleType = "BIKE" | "VAN" | "TRUCK" | "HAULAGE";

interface PricingQuote {
  vehicleType: string;
  basePrice: number;
  distancePrice: number;
  surgeMultiplier: number;
  surgePrice: number;
  totalPrice: number;
  distance: number;
  estimatedTime: number;
}

const VEHICLE_OPTIONS: {
  type: VehicleType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { type: "BIKE", label: "Bike", desc: "Small packages, documents", icon: "🏍️" },
  { type: "VAN", label: "Van", desc: "Medium loads, furniture", icon: "🚐" },
  { type: "TRUCK", label: "Truck", desc: "Large items, bulk goods", icon: "🚛" },
  {
    type: "HAULAGE",
    label: "Haulage",
    desc: "Industrial, heavy cargo",
    icon: "🏗️",
  },
];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/post-job", label: "New Delivery" },
  { href: "/dashboard/jobs", label: "My Jobs" },
];

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<PricingQuote | null>(null);

  const [form, setForm] = useState({
    pickupAddress: "",
    pickupLat: "",
    pickupLng: "",
    dropoffAddress: "",
    dropoffLat: "",
    dropoffLng: "",
    vehicleType: "" as VehicleType | "",
    packageDetails: "",
    notes: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchQuote = async (vehicleOverride?: VehicleType) => {
    const vehicle = vehicleOverride || form.vehicleType;
    if (
      !form.pickupLat ||
      !form.pickupLng ||
      !form.dropoffLat ||
      !form.dropoffLng ||
      !vehicle
    ) {
      return;
    }

    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: {
            lat: parseFloat(form.pickupLat),
            lng: parseFloat(form.pickupLng),
          },
          dropoff: {
            lat: parseFloat(form.dropoffLat),
            lng: parseFloat(form.dropoffLng),
          },
          vehicleType: vehicle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuote(data.data);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to get quote");
      }
    } catch {
      toast.error("Failed to fetch pricing");
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress: form.pickupAddress,
          pickupLat: parseFloat(form.pickupLat),
          pickupLng: parseFloat(form.pickupLng),
          dropoffAddress: form.dropoffAddress,
          dropoffLat: parseFloat(form.dropoffLat),
          dropoffLng: parseFloat(form.dropoffLng),
          vehicleType: form.vehicleType,
          packageDetails: form.packageDetails || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Delivery booked successfully!");
        router.push("/dashboard/jobs");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create booking");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNav items={NAV_ITEMS} role="Customer" />
      <main className="mx-auto max-w-2xl px-4 pt-20 pb-12">
        <h1 className="mb-2 text-2xl font-bold text-white">
          Book a Delivery
        </h1>
        <p className="mb-8 text-surface-400">
          Get real-time pricing and book in 3 steps
        </p>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= s
                    ? "bg-brand-600 text-white"
                    : "bg-surface-800 text-surface-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 flex-1 ${
                    step > s ? "bg-brand-600" : "bg-surface-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Locations */}
        {step === 1 && (
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Pickup & Dropoff
            </h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-300">
                Pickup Address
              </label>
              <input
                className="input-field"
                placeholder="e.g. 15 Allen Avenue, Ikeja, Lagos"
                value={form.pickupAddress}
                onChange={(e) => updateForm("pickupAddress", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-300">
                  Pickup Latitude
                </label>
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="6.6018"
                  value={form.pickupLat}
                  onChange={(e) => updateForm("pickupLat", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-300">
                  Pickup Longitude
                </label>
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="3.3515"
                  value={form.pickupLng}
                  onChange={(e) => updateForm("pickupLng", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-300">
                Dropoff Address
              </label>
              <input
                className="input-field"
                placeholder="e.g. 22 Admiralty Way, Lekki, Lagos"
                value={form.dropoffAddress}
                onChange={(e) => updateForm("dropoffAddress", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-300">
                  Dropoff Latitude
                </label>
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="6.4281"
                  value={form.dropoffLat}
                  onChange={(e) => updateForm("dropoffLat", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-300">
                  Dropoff Longitude
                </label>
                <input
                  className="input-field"
                  type="number"
                  step="any"
                  placeholder="3.4219"
                  value={form.dropoffLng}
                  onChange={(e) => updateForm("dropoffLng", e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn-primary w-full"
              disabled={
                !form.pickupAddress ||
                !form.pickupLat ||
                !form.pickupLng ||
                !form.dropoffAddress ||
                !form.dropoffLat ||
                !form.dropoffLng
              }
              onClick={() => setStep(2)}
            >
              Continue to Vehicle Selection
            </button>
          </div>
        )}

        {/* Step 2: Vehicle & Pricing */}
        {step === 2 && (
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Select Vehicle
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {VEHICLE_OPTIONS.map((v) => (
                <button
                  key={v.type}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    form.vehicleType === v.type
                      ? "border-brand-500 bg-brand-600/10"
                      : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                  }`}
                  onClick={() => {
                    updateForm("vehicleType", v.type);
                    fetchQuote(v.type);
                  }}
                >
                  <div className="mb-2 text-2xl">{v.icon}</div>
                  <p className="font-semibold text-white">{v.label}</p>
                  <p className="text-xs text-surface-400">{v.desc}</p>
                </button>
              ))}
            </div>

            {/* Quote Display */}
            {quoteLoading && (
              <div className="rounded-lg border border-surface-700 bg-surface-800/50 p-4 text-center text-sm text-surface-400">
                Calculating price...
              </div>
            )}

            {quote && !quoteLoading && (
              <div className="rounded-lg border border-brand-500/30 bg-brand-600/5 p-4">
                <h3 className="mb-3 font-semibold text-white">
                  Price Estimate
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-surface-300">
                    <span>Base fare</span>
                    <span>₦{quote.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-surface-300">
                    <span>
                      Distance ({quote.distance} km)
                    </span>
                    <span>₦{quote.distancePrice.toLocaleString()}</span>
                  </div>
                  {quote.surgePrice > 0 && (
                    <div className="flex justify-between text-yellow-400">
                      <span>
                        Surge ({quote.surgeMultiplier}x)
                      </span>
                      <span>₦{quote.surgePrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-surface-700 pt-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total</span>
                      <span>₦{quote.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-surface-500">
                    Estimated delivery: ~{quote.estimatedTime} minutes
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-300">
                Package Details (optional)
              </label>
              <input
                className="input-field"
                placeholder="e.g. Electronics, fragile"
                value={form.packageDetails}
                onChange={(e) => updateForm("packageDetails", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-300">
                Notes (optional)
              </label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                placeholder="Any special instructions for the rider"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn-primary flex-1"
                disabled={!form.vehicleType || !quote}
                onClick={() => setStep(3)}
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && quote && (
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Review & Confirm
            </h2>

            <div className="space-y-3">
              <div className="rounded-lg bg-surface-800 p-3">
                <p className="text-xs text-surface-500">Pickup</p>
                <p className="text-sm text-white">{form.pickupAddress}</p>
              </div>
              <div className="rounded-lg bg-surface-800 p-3">
                <p className="text-xs text-surface-500">Dropoff</p>
                <p className="text-sm text-white">{form.dropoffAddress}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-surface-800 p-3">
                  <p className="text-xs text-surface-500">Vehicle</p>
                  <p className="text-sm font-semibold text-white">
                    {form.vehicleType}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-800 p-3">
                  <p className="text-xs text-surface-500">Distance</p>
                  <p className="text-sm font-semibold text-white">
                    {quote.distance} km
                  </p>
                </div>
                <div className="rounded-lg bg-surface-800 p-3">
                  <p className="text-xs text-surface-500">ETA</p>
                  <p className="text-sm font-semibold text-white">
                    ~{quote.estimatedTime} min
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-brand-500/30 bg-brand-600/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-surface-300">Total Price</span>
                  <span className="text-2xl font-bold text-white">
                    ₦{quote.totalPrice.toLocaleString()}
                  </span>
                </div>
                {quote.surgeMultiplier > 1 && (
                  <p className="mt-1 text-xs text-yellow-400">
                    Includes {quote.surgeMultiplier}x surge pricing
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn-primary flex-1"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
