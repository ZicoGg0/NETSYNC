import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Netsync" },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
