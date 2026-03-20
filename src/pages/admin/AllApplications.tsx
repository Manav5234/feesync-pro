import { useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import { Eye, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export default function AllApplications({ filterStatus }: { filterStatus?: ApplicationStatus }) {
  const { applications, loading, updateApplicationStatus } = useApplications({ status: filterStatus });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState("");

  // Remark modal state
  const [remarkModal, setRemarkModal] = useState<{
    open: boolean;
    appId: string;
    appRollNo: string;
    action: "verified" | "rejected";
  } | null>(null);
  const [remark, setRemark] = useState("");
  const [updating, setUpdating] = useState(false);

  const filtered = applications.filter((a) =>
    a.roll_no.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold capitalize">
          {filterStatus ? `${filterStatus.replace("_", " ")} Applications` : "All Applications"}
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by roll no or name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
              ) : filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.roll_no}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.course}</TableCell>
                  <TableCell className="capitalize">{app.type.replace("_", " ")}</TableCell>
                  <TableCell>{format(new Date(app.submitted_at), "dd MMM yyyy")}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remark Modal */}
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
        <ApplicationDetailModal application={selectedApp} onClose={() => setSelectedApp(null)} onStatusChange={updateApplicationStatus} mode="admin" />
      )}
    </div>
  );
}
