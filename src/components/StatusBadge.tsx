import { Badge } from "@/components/ui/badge";

type KnownStatus = "pending" | "under_review" | "verified" | "rejected" | "approved";

const STATUS_CONFIG: Record<KnownStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-400" },
  under_review: { label: "Under Review", className: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400" },
  verified: { label: "Verified", className: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400" },
  approved: { label: "Approved", className: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-700 border-red-300 dark:text-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as KnownStatus] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
