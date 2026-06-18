interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  QUOTE_SENT: "bg-blue-500/10 text-blue-400",
  ACCEPTED: "bg-brand-500/10 text-brand-400",
  DRIVER_ASSIGNED: "bg-indigo-500/10 text-indigo-400",
  DRIVER_ARRIVING: "bg-purple-500/10 text-purple-400",
  IN_TRANSIT: "bg-cyan-500/10 text-cyan-400",
  PICKED_UP: "bg-teal-500/10 text-teal-400",
  DELIVERED: "bg-green-500/10 text-green-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  FAILED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-surface-500/10 text-surface-400",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-surface-500/10 text-surface-400";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
