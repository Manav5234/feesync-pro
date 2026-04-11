import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Pin, Search, SlidersHorizontal } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const priorityConfig: Record<string, { border: string; bg: string; badge: string }> = {
  urgent: {
    border: "border-l-red-500",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  normal: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50/50 dark:bg-yellow-950/20",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

export default function StudentAnnouncements() {
  const { announcements, loading } = useAnnouncements();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filtered = announcements
    .filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === "all" || a.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">Stay updated with the latest notices</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="normal">🟡 Normal</SelectItem>
                <SelectItem value="info">🔵 Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No announcements found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const style = priorityConfig[a.priority] || priorityConfig.normal;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={cn("border-l-4 transition-shadow hover:shadow-md", style.border, style.bg)}>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-foreground">
                        {a.is_pinned && <Pin className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-yellow-500" />}
                        {a.title}
                      </h3>
                      <Badge className={cn("text-[10px] shrink-0", style.badge)} variant="secondary">{a.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/70 pt-1">
                      <span>{format(new Date(a.created_at), "MMM dd, yyyy · h:mm a")}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
