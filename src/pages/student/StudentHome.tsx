import { useAuth } from "@/contexts/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import { useNotifications } from "@/hooks/useNotifications";
import { useCertificates } from "@/hooks/useCertificates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FileText,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Award,
  Send,
  Download,
  TrendingUp,
  CalendarDays,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(48, 96%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(0, 84%, 60%)",
];

export default function StudentHome() {
  const { profile } = useAuth();
  const { applications, loading: appsLoading } = useApplications({ studentOnly: true });
  const { requests: certificates, loading: certsLoading } = useCertificates({ studentOnly: true });
  const { notifications, unreadCount, loading: notifsLoading } = useNotifications();
  const navigate = useNavigate();

  const loading = appsLoading || certsLoading;

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    verified: applications.filter((a) => a.status === "verified").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const certsReady = certificates.filter((c) => c.status === "approved" && c.file_url).length;
  const certsPending = certificates.filter((c) => c.status === "pending").length;

  const recentApplications = applications.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Verified", value: stats.verified },
    { name: "Rejected", value: stats.rejected },
  ].filter((d) => d.value > 0);

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: FileText, accent: "bg-primary/10 text-primary" },
    { label: "Pending", value: stats.pending, icon: Clock, accent: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    { label: "Verified", value: stats.verified, icon: CheckCircle, accent: "bg-green-500/10 text-green-600 dark:text-green-400" },
    { label: "Certificates Ready", value: certsReady, icon: Award, accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  ];

  return (
    <motion.div
      className="space-y-6 max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Welcome Banner ── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="flex flex-col gap-1 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </div>
              <h1 className="text-2xl font-heading font-bold sm:text-3xl">
                {getGreeting()},{" "}
                <span className="text-primary">
                  {profile?.name?.split(" ")[0] || "Student"}
                </span>
                ! <Sparkles className="inline h-5 w-5 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {profile?.roll_number || "—"} • {profile?.course || "—"} • Year{" "}
                {profile?.year || "—"}
              </p>
            </div>

            <Button
              size="lg"
              className="mt-3 sm:mt-0 gap-2"
              onClick={() => navigate("/student/submit")}
            >
              <Send className="h-4 w-4" />
              New Application
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} variants={item}>
            <Card className="group hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${s.accent}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Recent Applications ── */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/student/submissions")}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No applications yet</p>
                  <p className="text-xs mt-1">Submit your first application to get started</p>
                  <Button size="sm" className="mt-4" onClick={() => navigate("/student/submit")}>
                    Submit Application
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate("/student/submissions")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium capitalize truncate">
                            {app.type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(app.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Application Breakdown Chart ── */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {loading ? (
                <Skeleton className="h-40 w-40 rounded-full" />
              ) : pieData.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No data yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i + 1]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: CHART_COLORS[i + 1] }}
                        />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Certificates & Notifications Row ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Certificate Status ── */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                Certificates
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/student/certificates")}>
                View <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {certsReady > 0 && (
                    <div
                      className="flex items-center gap-3 rounded-lg border border-green-300 dark:border-green-700 bg-green-500/10 p-3 cursor-pointer hover:bg-green-500/15 transition-colors"
                      onClick={() => navigate("/student/certificates")}
                    >
                      <Download className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {certsReady} certificate{certsReady > 1 ? "s" : ""} ready to download!
                        </p>
                        <p className="text-xs text-green-600/70 dark:text-green-400/70">
                          Click to go to certificates page
                        </p>
                      </div>
                    </div>
                  )}
                  {certsPending > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-500/10 p-3">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {certsPending} pending request{certsPending > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                          Admin is reviewing your requests
                        </p>
                      </div>
                    </div>
                  )}
                  {certsReady === 0 && certsPending === 0 && (
                    <div className="flex flex-col items-center py-6 text-muted-foreground">
                      <Award className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">No certificate requests yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => navigate("/student/certificates")}
                      >
                        Request Certificate
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Recent Notifications ── */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/student/notifications")}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {notifsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg border p-3 text-sm transition-colors ${
                        !n.is_read
                          ? "bg-primary/5 border-primary/20"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <p className="line-clamp-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-5">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/student/submit")} className="gap-2">
                <Send className="h-4 w-4" />
                Submit Application
              </Button>
              <Button variant="outline" onClick={() => navigate("/student/certificates")} className="gap-2">
                <Award className="h-4 w-4" />
                Request Certificate
              </Button>
              <Button variant="outline" onClick={() => navigate("/student/notifications")} className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
