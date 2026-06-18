import type { Metadata } from "next";
import ToasterProvider from "@/components/ToasterProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Netsync — Fast Delivery in Lagos",
    template: "%s | Netsync",
  },
  description:
    "Fast, transparent delivery platform for Lagos, Nigeria. Real-time pricing, live tracking, and reliable logistics.",
  keywords: [
    "logistics",
    "delivery",
    "Lagos",
    "Nigeria",
    "courier",
    "dispatch",
    "same-day delivery",
  ],
  openGraph: {
    title: "Netsync — Fast Delivery in Lagos",
    description:
      "Fast, transparent delivery platform for Lagos, Nigeria. Real-time pricing, live tracking, and reliable logistics.",
    type: "website",
    locale: "en_NG",
    siteName: "Netsync",
  },
  twitter: {
    card: "summary_large_image",
    title: "Netsync — Fast Delivery in Lagos",
    description:
      "Fast, transparent delivery platform for Lagos. Real-time pricing & live tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
