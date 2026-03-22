import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileStack, Clock, XCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, Cell,
  PieChart, Pie
} from "recharts";

const RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
];

export default function AdminOverview() {
  const { applications, loading } = useApplications();
  const [range, setRange] = useState("7d");
  const [drillDown, setDrillDown] = useState<{ month: number; year: number; label: string } | null>(null);

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

  const pieData = [
    { name: "Pending", value: stats.pending, color: "#EAB308" },
    { name: "Verified", value: stats.verified, color: "#22C55E" },
    { name: "Rejected", value: stats.rejected, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  // Drill down — daily view for a specific month
  const getDrillDownData = () => {
    if (!drillDown) return [];
    const { month, year } = drillDown;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = new Date(year, month, day).toDateString();
      return {
        name: `${day}`,
        Submitted: applications.filter((a) => new Date(a.submitted_at).toDateString() === dateStr).length,
        Verified: applications.filter((a) => a.verified_at && new Date(a.verified_at).toDateString() === dateStr).length,
      };
    });
  };

  const getTrendData = () => {
    if (range === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const day = d.toDateString();
        return {
          name: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
          Submitted: applications.filter((a) => new Date(a.submitted_at).toDateString() === day).length,
          Verified: applications.filter((a) => a.verified_at && new Date(a.verified_at).toDateString() === day).length,
        };
      });
    }

    if (range === "30d") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const day = d.toDateString();
        return {
          name: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          Submitted: applications.filter((a) => new Date(a.submitted_at).toDateString() === day).length,
          Verified: applications.filter((a) => a.verified_at && new Date(a.verified_at).toDateString() === day).length,
        };
      });
    }

    const year = parseInt(range);
    return Array.from({ length: 12 }, (_, i) => ({
      name: new Date(year, i, 1).toLocaleDateString("en-IN", { month: "short" }),
      month: i,
      year,
      Submitted: applications.filter((a) => {
        const d = new Date(a.submitted_at);
        return d.getFullYear() === year && d.getMonth() === i;
      }).length,
      Verified: applications.filter((a) => {
        if (!a.verified_at) return false;
        const d = new Date(a.verified_at);
        return d.getFullYear() === year && d.getMonth() === i;
      }).length,
    }));
  };

  const trendData = getTrendData();
  const drillDownData = getDrillDownData();
  const isYearView = ["2024", "2025", "2026"].includes(range);

  // Custom clickable bar for year view
  const handleBarClick = (data: any) => {
    if (isYearView && data && data.activePayload) {
      const point = data.activePayload[0]?.payload;
      if (point && point.month !== undefined) {
        const monthLabel = new Date(point.year, point.month, 1)
          .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        setDrillDown({ month: point.month, year: point.year, label: monthLabel });
      }
    }
  };

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
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: "12px" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Summary */}
          <Card className="flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Pending", value: stats.pending, color: "bg-yellow-400" },
                { label: "Verified", value: stats.verified, color: "bg-green-500" },
                { label: "Rejected", value: stats.rejected, color: "bg-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {!loading && stats.total > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {drillDown && (
                  <button
                    onClick={() => setDrillDown(null)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </button>
                )}
                <CardTitle className="text-sm font-medium">
                  {drillDown ? `${drillDown.label} — Daily View` : "Activity Trend"}
                </CardTitle>
                {isYearView && !drillDown && (
                  <span className="text-xs text-muted-foreground">(click a month to drill down)</span>
                )}
              </div>
              {!drillDown && (
                <div className="flex gap-1 flex-wrap">
                  {RANGES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => { setRange(r.value); setDrillDown(null); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        range === r.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={drillDown ? drillDownData : trendData}
                barSize={drillDown ? 10 : range === "30d" ? 8 : 18}
                barGap={2}
                onClick={!drillDown ? handleBarClick : undefined}
                style={{ cursor: isYearView && !drillDown ? "pointer" : "default" }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: drillDown || range === "30d" ? 9 : 11 }}
                  interval={drillDown ? 1 : range === "30d" ? 4 : 0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
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
