import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Provider Dashboard", template: "%s | Netsync Provider" },
};

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
