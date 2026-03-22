import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileStack, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  // Chart data
  const pieData = [
    { name: "Pending", value: stats.pending, color: "#EAB308" },
    { name: "Verified", value: stats.verified, color: "#22C55E" },
    { name: "Rejected", value: stats.rejected, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Pending", value: stats.pending, fill: "#EAB308" },
    { name: "Verified", value: stats.verified, fill: "#22C55E" },
    { name: "Rejected", value: stats.rejected, fill: "#EF4444" },
  ];

  // Group applications by date for trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const trendData = last7Days.map((day) => ({
    name: new Date(day).toLocaleDateString("en-IN", { weekday: "short" }),
    Submitted: applications.filter((a) => new Date(a.submitted_at).toDateString() === day).length,
    Verified: applications.filter((a) => a.verified_at && new Date(a.verified_at).toDateString() === day).length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>

      {/* Stat Cards */}
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

      {/* Charts Row */}
      {!loading && stats.total > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Applications Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 7 Day Trend */}
      {!loading && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">7 Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barSize={16} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend iconSize={8} formatter={(v) => <span style={{ fontSize: "12px" }}>{v}</span>} />
                <Bar dataKey="Submitted" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Verified" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
