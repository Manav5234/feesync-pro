import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, X, CheckCircle, XCircle, Sparkles, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type AppDocument = Database["public"]["Tables"]["documents"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Props {
  application: Application;
  onClose: () => void;
  onStatusChange?: (id: string, status: ApplicationStatus, remarks?: string) => Promise<{ error: Error | null } | void>;
  mode?: "admin" | "student";
}

export function ApplicationDetailModal({ application, onClose, onStatusChange, mode = "admin" }: Props) {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [remarks, setRemarks] = useState(application.remarks || "");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase
      .from("documents")
      .select("*")
      .eq("application_id", application.id)
      .then(({ data }) => {
        setDocuments(data || []);
        setDocsLoading(false);
      });
  }, [application.id]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!onStatusChange) return;
    if (status === "rejected" && !remarks.trim()) {
      setShowRejectForm(true);
      return;
    }
    setUpdating(true);
    await onStatusChange(application.id, status, remarks || undefined);
    setUpdating(false);
    onClose();
  };

  const extractedData = application.extracted_data as Record<string, string> | null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Application Details</span>
            <StatusBadge status={application.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Application Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Roll No.", value: application.roll_no },
              { label: "Name", value: application.name },
              { label: "Course", value: application.course },
              { label: "Year", value: `Year ${application.year}` },
              { label: "Type", value: application.type.replace("_", " "), className: "capitalize" },
              { label: "Submitted", value: format(new Date(application.submitted_at), "dd MMM yyyy, HH:mm") },
            ].map(({ label, value, className }) => (
              <div key={label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-sm font-medium mt-0.5 ${className || ""}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {application.description && (
            <div>
              <Label>Description</Label>
              <p className="mt-1 text-sm rounded-lg border p-3 bg-muted/30">{application.description}</p>
            </div>
          )}

          {/* Remarks */}
          {application.remarks && (
            <div>
              <Label>Remarks</Label>
              <p className="mt-1 text-sm rounded-lg border p-3 bg-destructive/5 text-destructive">
                {application.remarks}
              </p>
            </div>
          )}

          {/* AI Extracted Data */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary flex items-center gap-1 mb-3">
                <Sparkles className="h-4 w-4" /> AI Extracted Data
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</p>
                    <p className="text-sm font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <Label className="mb-2 block">Uploaded Documents</Label>
            {docsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium truncate">{doc.file_name}</span>
                      </div>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                    {/* Inline preview */}
                    {doc.file_type.startsWith("image/") ? (
                      <img
                        src={doc.file_url}
                        alt={doc.file_name}
                        className="w-full max-h-64 object-contain bg-muted"
                      />
                    ) : doc.file_type === "application/pdf" ? (
                      <iframe
                        src={doc.file_url}
                        className="w-full h-64"
                        title={doc.file_name}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          {mode === "admin" && (
            <div className="border-t pt-4 space-y-3">
              {showRejectForm ? (
                <div className="space-y-3">
                  <Label htmlFor="reject-reason">Rejection Reason (required)</Label>
                  <Textarea
                    id="reject-reason"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Explain why this application is being rejected..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      disabled={!remarks.trim() || updating}
                      onClick={() => handleStatusChange("rejected")}
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleStatusChange("verified")}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Verify
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleStatusChange("under_review")}
                    disabled={updating}
                  >
                    Mark Under Review
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowRejectForm(true)}
                    disabled={updating}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
