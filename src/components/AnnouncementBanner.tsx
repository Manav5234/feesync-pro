import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const priorityConfig = {
  urgent: {
    border: "border-l-red-500",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    pulse: true,
  },
  normal: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50/50 dark:bg-yellow-950/20",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    pulse: false,
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    pulse: false,
  },
};

export function AnnouncementBanner() {
  const { announcements, loading } = useAnnouncements();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) return null;

  const visible = announcements.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Announcements</h3>
        {announcements.length > 3 && (
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80" onClick={() => navigate("/student/announcements")}>
            +{announcements.length - 3} more · View all
          </Badge>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {visible.map((a, i) => {
          const config = priorityConfig[a.priority] || priorityConfig.normal;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={cn(
                  "border-l-4 overflow-hidden transition-shadow hover:shadow-md",
                  config.border,
                  config.bg,
                  config.pulse && "animate-pulse-subtle"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                      {a.is_pinned && <Pin className="inline h-3 w-3 mr-1 -mt-0.5" />}
                      {a.title}
                    </h4>
                    <Badge className={cn("text-[10px] shrink-0", config.badge)} variant="secondary">
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {a.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
