import { useState, useMemo } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye, Search, CheckCircle, XCircle, Loader2, X,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

type SortKey = "name" | "submitted_at" | "roll_no";
type SortDir = "asc" | "desc";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AllApplications({ filterStatus }: { filterStatus?: ApplicationStatus }) {
  const { applications, loading, updateApplicationStatus } = useApplications({ status: filterStatus });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("submitted_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Remark modal state (untouched)
  const [remarkModal, setRemarkModal] = useState<{
    open: boolean;
    appId: string;
    appRollNo: string;
    action: "verified" | "rejected";
  } | null>(null);
  const [remark, setRemark] = useState("");
  const [updating, setUpdating] = useState(false);

  // Derive unique values for filter dropdowns
  const uniqueCourses = useMemo(
    () => [...new Set(applications.map((a) => a.course))].sort(),
    [applications]
  );
  const uniqueTypes = useMemo(
    () => [...new Set(applications.map((a) => a.type))].sort(),
    [applications]
  );

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    courseFilter !== "all" ||
    yearFilter !== "all" ||
    typeFilter !== "all";

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; key: string }[] = [];
    if (statusFilter !== "all") tags.push({ label: statusFilter.replace("_", " "), key: "status" });
    if (courseFilter !== "all") tags.push({ label: courseFilter, key: "course" });
    if (yearFilter !== "all") tags.push({ label: yearFilter, key: "year" });
    if (typeFilter !== "all") tags.push({ label: typeFilter.replace("_", " "), key: "type" });
    return tags;
  }, [statusFilter, courseFilter, yearFilter, typeFilter]);

  const removeFilter = (key: string) => {
    if (key === "status") setStatusFilter("all");
    if (key === "course") setCourseFilter("all");
    if (key === "year") setYearFilter("all");
    if (key === "type") setTypeFilter("all");
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCourseFilter("all");
    setYearFilter("all");
    setTypeFilter("all");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    let result = [...applications];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.roll_no.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
      );
    }

    // Filters
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (courseFilter !== "all") result = result.filter((a) => a.course === courseFilter);
    if (yearFilter !== "all") result = result.filter((a) => a.year === yearFilter);
    if (typeFilter !== "all") result = result.filter((a) => a.type === typeFilter);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "submitted_at") {
        cmp = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "roll_no") {
        cmp = a.roll_no.localeCompare(b.roll_no);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [applications, search, statusFilter, courseFilter, yearFilter, typeFilter, sortKey, sortDir]);

  const openRemarkModal = (app: Application, action: "verified" | "rejected") => {
    setRemarkModal({ open: true, appId: app.id, appRollNo: app.roll_no, action });
    setRemark("");
  };

  const handleSubmitRemark = async () => {
    if (!remarkModal) return;
    if (remarkModal.action === "rejected" && !remark.trim()) return;
    setUpdating(true);
    await updateApplicationStatus(remarkModal.appId, remarkModal.action, remark || undefined);
    setUpdating(false);
    setRemarkModal(null);
    setRemark("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold capitalize">
              {filterStatus ? `${filterStatus.replace("_", " ")} Applications` : "All Applications"}
            </h1>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 h-11"
          disabled={loading}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {!filterStatus && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="h-10">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Course" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-10">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Year" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1st Year">1st Year</SelectItem>
            <SelectItem value="2nd Year">2nd Year</SelectItem>
            <SelectItem value="3rd Year">3rd Year</SelectItem>
            <SelectItem value="4th Year">4th Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary + Active Filter Tags */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
                <span className="font-semibold text-foreground">{applications.length}</span> applications
              </span>
              {activeFilterTags.map((tag) => (
                <Badge
                  key={tag.key}
                  variant="secondary"
                  className="gap-1 capitalize cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => removeFilter(tag.key)}
                >
                  {tag.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground">
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>
                  <button onClick={() => handleSort("roll_no")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Roll No <SortIcon column="roll_no" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Name <SortIcon column="name" />
                  </button>
                </TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <button onClick={() => handleSort("submitted_at")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Date <SortIcon column="submitted_at" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="p-4 rounded-full bg-muted/50">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">No applications match your filters</p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>
                          Clear filters
                        </Button>
                      )}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((app, idx) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-mono text-sm">{app.roll_no}</TableCell>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>{app.course}</TableCell>
                    <TableCell className="capitalize">{app.type.replace("_", " ")}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(app.submitted_at), "dd MMM yyyy")}</TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {app.status !== "verified" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => openRemarkModal(app, "verified")}
                            title="Verify"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {app.status !== "rejected" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRemarkModal(app, "rejected")}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remark Modal — untouched */}
      {remarkModal && (
        <Dialog open={remarkModal.open} onOpenChange={() => setRemarkModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {remarkModal.action === "verified" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                {remarkModal.action === "verified" ? "Verify" : "Reject"} Application
              </DialogTitle>
              <DialogDescription>
                Roll No: <span className="font-mono font-medium">{remarkModal.appRollNo}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Remarks {remarkModal.action === "rejected" && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={
                    remarkModal.action === "verified"
                      ? "Optional remarks for verification..."
                      : "Explain why this application is being rejected..."
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRemarkModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant={remarkModal.action === "rejected" ? "destructive" : "default"}
                  disabled={updating || (remarkModal.action === "rejected" && !remark.trim())}
                  onClick={handleSubmitRemark}
                >
                  {updating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : remarkModal.action === "verified" ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {remarkModal.action === "verified" ? "Confirm Verify" : "Confirm Reject"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={updateApplicationStatus}
          mode="admin"
        />
      )}
    </div>
  );
}
