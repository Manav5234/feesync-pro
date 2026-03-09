import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | null; className: string }> = {
  pending: { label: "Pending", variant: "outline", className: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-400" },
  under_review: { label: "Under Review", variant: "outline", className: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400" },
  verified: { label: "Verified", variant: "outline", className: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400" },
  rejected: { label: "Rejected", variant: "outline", className: "bg-red-500/10 text-red-700 border-red-300 dark:text-red-400" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
