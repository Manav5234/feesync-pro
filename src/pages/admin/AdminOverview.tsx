import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent } from "@/components/ui/card";
import { FileStack, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function AdminOverview() {
  const { applications, loading } = useApplications();

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    verified: applications.filter((a) => a.status === "verified").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    todayVerified: applications.filter((a) => {
      if (a.status !== "verified" || !a.verified_at) return false;
      const today = new Date().toDateString();
      return new Date(a.verified_at).toDateString() === today;
    }).length,
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: FileStack, color: "text-primary bg-primary/10" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-yellow-600 bg-yellow-500/10" },
    { label: "Verified Today", value: stats.todayVerified, icon: TrendingUp, color: "text-green-600 bg-green-500/10" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600 bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
