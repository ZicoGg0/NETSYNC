import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Netsync — Fast, Transparent Delivery in Lagos",
};

const FEATURES = [
  {
    icon: "🚀",
    title: "Real-Time Pricing",
    description:
      "Know exactly what you pay before booking. Transparent breakdown of base, distance, and surge charges.",
  },
  {
    icon: "📍",
    title: "Live Tracking",
    description:
      "Track your delivery in real time from pickup to dropoff. 10+ status updates keep you informed.",
  },
  {
    icon: "🏍️",
    title: "Multiple Vehicles",
    description:
      "Choose from bikes, vans, trucks, or haulage depending on your package size and urgency.",
  },
  {
    icon: "🔒",
    title: "Secure & Reliable",
    description:
      "OTP-verified accounts, encrypted data, and vetted delivery providers you can trust.",
  },
];

const VEHICLE_TYPES = [
  {
    name: "Bike",
    price: "From ₦2,500",
    desc: "Small packages, documents",
    speed: "Fastest",
  },
  {
    name: "Van",
    price: "From ₦5,000",
    desc: "Medium loads, furniture",
    speed: "Fast",
  },
  {
    name: "Truck",
    price: "From ₦8,000",
    desc: "Large items, bulk goods",
    speed: "Standard",
  },
  {
    name: "Haulage",
    price: "From ₦15,000",
    desc: "Industrial, heavy cargo",
    speed: "Scheduled",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            Net<span className="text-brand-500">sync</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/customer-login" className="btn-secondary text-sm">
              Log In
            </Link>
            <Link href="/customer-login" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400">
            Delivering across Lagos
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Fast, Transparent
            <br />
            <span className="text-brand-500">Delivery in Lagos</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-surface-300">
            Book a delivery in under 60 seconds. Get real-time pricing, live
            tracking, and reliable logistics across Lagos, Nigeria.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/customer-login" className="btn-primary px-8 py-3 text-base">
              Send a Package
            </Link>
            <Link
              href="/provider-login"
              className="btn-secondary px-8 py-3 text-base"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-800 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Why Netsync?
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-surface-400">
            Built for Lagos. Designed for speed. Priced with transparency.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card text-center">
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-surface-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-surface-800 bg-surface-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-surface-400">
            Base fare + distance charge. Surge pricing during peak hours is
            always shown upfront.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VEHICLE_TYPES.map((v) => (
              <div
                key={v.name}
                className="card flex flex-col items-center text-center"
              >
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {v.name}
                </h3>
                <p className="mb-2 text-2xl font-bold text-brand-500">
                  {v.price}
                </p>
                <p className="mb-1 text-sm text-surface-400">{v.desc}</p>
                <span className="badge-active mt-auto">{v.speed}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-800 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to ship?
          </h2>
          <p className="mb-8 text-surface-400">
            Join thousands of businesses and individuals using Netsync for fast,
            reliable delivery across Lagos.
          </p>
          <Link href="/customer-login" className="btn-primary px-8 py-3 text-base">
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} Netsync. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-surface-500">
            <span>Lagos, Nigeria</span>
            <span>support@netsync.ng</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
