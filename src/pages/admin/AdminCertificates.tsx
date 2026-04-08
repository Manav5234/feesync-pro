import { useState, useRef } from "react";
import { useCertificates } from "@/hooks/useCertificates";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Loader2, Search, Award, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CertificateRequest = Database["public"]["Tables"]["certificate_requests"]["Row"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminCertificates() {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useCertificates();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Approve dialog state
  const [approveRequest, setApproveRequest] = useState<CertificateRequest | null>(null);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reject dialog state
  const [rejectRequest, setRejectRequest] = useState<CertificateRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejecting, setRejecting] = useState(false);

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

  const openApprove = (req: CertificateRequest) => {
    setApproveRequest(req);
    setApproveRemarks(req.remarks || "");
    setSelectedFile(null);
  };

  const closeApprove = () => {
    setApproveRequest(null);
    setApproveRemarks("");
    setSelectedFile(null);
  };

  const handleApprove = async () => {
    if (!approveRequest || !selectedFile || !user) return;

    setUploading(true);
    try {
      const filePath = `${approveRequest.id}/${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload file: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);

      await updateRequest(
        approveRequest.id,
        {
          status: "approved",
          remarks: approveRemarks.trim() || null,
          file_url: urlData.publicUrl,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        },
        {
          studentId: approveRequest.student_id!,
          certificateType: approveRequest.certificate_type,
        }
      );

      closeApprove();
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  const openReject = (req: CertificateRequest) => {
    setRejectRequest(req);
    setRejectRemarks(req.remarks || "");
  };

  const closeReject = () => {
    setRejectRequest(null);
    setRejectRemarks("");
  };

  const handleReject = async () => {
    if (!rejectRequest || !rejectRemarks.trim()) return;

    setRejecting(true);
    await updateRequest(
      rejectRequest.id,
      { status: "rejected", remarks: rejectRemarks.trim() },
      {
        studentId: rejectRequest.student_id!,
        certificateType: rejectRequest.certificate_type,
      }
    );
    setRejecting(false);
    closeReject();
  };

  const renderActions = (req: CertificateRequest) => {
    if (req.status === "approved" && req.file_url) {
      return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">Uploaded ✅</Badge>;
    }
    if (req.status === "approved" && !req.file_url) {
      return (
        <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50" onClick={() => openApprove(req)}>
          <Upload className="h-3.5 w-3.5 mr-1" /> Upload File
        </Button>
      );
    }
    if (req.status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => openApprove(req)}>
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => openReject(req)}>
          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
        </Button>
      </div>
    );
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
          <Card key={key} className={`cursor-pointer transition-colors ${filterStatus === key ? "border-primary" : ""}`} onClick={() => setFilterStatus(key)}>
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
        <Input placeholder="Search by name, roll no, type..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                      <TableCell><StatusBadge status={req.status || "pending"} /></TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">{req.remarks || "—"}</TableCell>
                      <TableCell>{renderActions(req)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve / Upload Dialog */}
      <Dialog open={!!approveRequest} onOpenChange={(open) => !open && closeApprove()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve & Upload Certificate</DialogTitle>
            <DialogDescription>
              {approveRequest?.certificate_type} for {approveRequest?.name} ({approveRequest?.roll_no})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{approveRequest?.course}</span></div>
              <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{approveRequest?.year}</span></div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Purpose:</span> <span>{approveRequest?.purpose}</span>
            </div>

            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea value={approveRemarks} onChange={(e) => setApproveRemarks(e.target.value)} placeholder="Optional remarks..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Upload Signed Certificate (PDF)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <FileText className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to select PDF file</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeApprove} disabled={uploading}>Cancel</Button>
            <Button onClick={handleApprove} disabled={uploading || !selectedFile}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Uploading...</> : "Upload & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectRequest} onOpenChange={(open) => !open && closeReject()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Certificate Request</DialogTitle>
            <DialogDescription>
              {rejectRequest?.certificate_type} for {rejectRequest?.name} ({rejectRequest?.roll_no})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Purpose:</span> <span>{rejectRequest?.purpose}</span>
            </div>
            <div className="space-y-2">
              <Label>Reason for Rejection <span className="text-destructive">*</span></Label>
              <Textarea value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)} placeholder="Reason for rejection (required)" rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReject}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting || !rejectRemarks.trim()}>
              {rejecting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Reject & Notify Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
