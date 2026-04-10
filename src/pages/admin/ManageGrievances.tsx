import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGrievances, type Grievance } from "@/hooks/useGrievances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Search, AlertCircle, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400",
  resolved: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400",
};
const STATUS_LABELS: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };

export default function ManageGrievances() {
  const { user } = useAuth();
  const { grievances, loading, updateGrievance } = useGrievances();

  const [selected, setSelected] = useState<Grievance | null>(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const open = grievances.filter((g) => g.status === "open").length;
  const inProgress = grievances.filter((g) => g.status === "in_progress").length;
  const resolved = grievances.filter((g) => g.status === "resolved").length;

  const filtered = grievances.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (g.name?.toLowerCase().includes(q) || g.roll_no?.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  });

  const openDialog = (g: Grievance) => {
    setSelected(g);
    setStatus(g.status);
    setResponse(g.admin_response || "");
  };

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    await updateGrievance(
      selected.id,
      {
        status,
        admin_response: response || null,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
        resolved_by: status === "resolved" ? user.id : null,
      },
      { studentId: selected.student_id!, subject: selected.subject }
    );
    setSelected(null);
    setSaving(false);
  };

  const stats = [
    { label: "Open", count: open, icon: AlertCircle, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "In Progress", count: inProgress, icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Resolved", count: resolved, icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Manage Grievances
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and respond to student complaints</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "—" : s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll no, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Grievances ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No grievances found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {g.submitted_at ? format(new Date(g.submitted_at), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell className="text-xs">{g.roll_no}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{g.category}</Badge></TableCell>
                      <TableCell className="max-w-[180px] truncate">{g.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[g.status] || ""}>{STATUS_LABELS[g.status] || g.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openDialog(g)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Respond
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Grievance</DialogTitle>
            <DialogDescription>Review and respond to the student's complaint</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <strong>{selected.name}</strong></div>
                <div><span className="text-muted-foreground">Roll No:</span> <strong>{selected.roll_no}</strong></div>
                <div><span className="text-muted-foreground">Category:</span> <strong>{selected.category}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>{selected.submitted_at ? format(new Date(selected.submitted_at), "dd MMM yyyy") : "—"}</strong></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selected.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{selected.description}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Admin Response</Label>
                <Textarea placeholder="Type your response..." value={response} onChange={(e) => setResponse(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
