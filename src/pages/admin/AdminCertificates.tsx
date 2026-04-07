import { useState } from "react";
import { useCertificates } from "@/hooks/useCertificates";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Loader2, Search, Award } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CertificateRequest = Database["public"]["Tables"]["certificate_requests"]["Row"];

export default function AdminCertificates() {
  const { requests, loading, updateRequest } = useCertificates();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = requests.filter((req) => {
    const matchesSearch =
      !search ||
      req.name.toLowerCase().includes(search.toLowerCase()) ||
      req.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      req.certificate_type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const openAction = (req: CertificateRequest, type: "approved" | "rejected") => {
    setSelectedRequest(req);
    setActionType(type);
    setRemarks(req.remarks || "");
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    setRemarks("");
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    if (actionType === "rejected" && !remarks.trim()) return;

    setSubmitting(true);
    await updateRequest(selectedRequest.id, {
      status: actionType,
      remarks: remarks.trim() || null,
    }, {
      studentId: selectedRequest.student_id!,
      certificateType: selectedRequest.certificate_type,
    });
    setSubmitting(false);
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificate Requests</h1>
        <p className="text-muted-foreground">Review and manage student certificate requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {(["all", "pending", "approved", "rejected"] as const).map((key) => (
          <Card
            key={key}
            className={`cursor-pointer transition-colors ${filterStatus === key ? "border-primary" : ""}`}
            onClick={() => setFilterStatus(key)}
          >
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground capitalize">{key === "all" ? "Total" : key}</p>
              <p className="text-2xl font-bold">{counts[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll no, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} certificate requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">No certificate requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="whitespace-nowrap">
                        {req.requested_at ? format(new Date(req.requested_at), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="font-medium">{req.name}</TableCell>
                      <TableCell>{req.roll_no}</TableCell>
                      <TableCell>{req.certificate_type}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{req.purpose}</TableCell>
                      <TableCell>
                        <StatusBadge status={req.status || "pending"} />
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                        {req.remarks || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => openAction(req, "approved")}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => openAction(req, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve" : "Reject"} Certificate Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.certificate_type} for {selectedRequest?.name} ({selectedRequest?.roll_no})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Course:</span>{" "}
                <span className="font-medium">{selectedRequest?.course}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Year:</span>{" "}
                <span className="font-medium">{selectedRequest?.year}</span>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Purpose:</span>{" "}
              <span>{selectedRequest?.purpose}</span>
            </div>

            <div className="space-y-2">
              <Label>
                Remarks {actionType === "rejected" && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  actionType === "approved"
                    ? "Optional remarks..."
                    : "Reason for rejection (required)"
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={submitting || (actionType === "rejected" && !remarks.trim())}
              variant={actionType === "approved" ? "default" : "destructive"}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {actionType === "approved" ? "Approve & Notify Student" : "Reject & Notify Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
