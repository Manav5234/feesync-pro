import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCertificates } from "@/hooks/useCertificates";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Download, Loader2, Clock, XCircle, Info } from "lucide-react";
import { format } from "date-fns";

const CERTIFICATE_TYPES = [
  "Bonafide Certificate",
  "Character Certificate",
  "Migration Certificate",
  "Other",
];

export default function RequestCertificate() {
  const { profile } = useAuth();
  const { requests, loading, createRequest } = useCertificates({ studentOnly: true });

  const [certificateType, setCertificateType] = useState("");
  const [customType, setCustomType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const type = certificateType === "Other" ? customType.trim() : certificateType;
    if (!type || !purpose.trim()) return;

    setSubmitting(true);
    await createRequest({
      certificate_type: type,
      purpose: purpose.trim(),
      name: profile.name,
      roll_no: profile.roll_number || "",
      course: profile.course || "",
      year: profile.year || "",
    });
    setCertificateType("");
    setCustomType("");
    setPurpose("");
    setSubmitting(false);
  };

  const renderAction = (req: typeof requests[0]) => {
    if (req.status === "pending") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" /> Under Review
        </Badge>
      );
    }

    if (req.status === "approved" && req.file_url) {
      return (
        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => window.open(req.file_url!, "_blank")}>
          <Download className="h-3.5 w-3.5 mr-1" /> Download
        </Button>
      );
    }

    if (req.status === "approved" && !req.file_url) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Preparing...
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Admin is preparing your certificate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (req.status === "rejected") {
      return (
        <div className="space-y-1">
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
          {req.remarks && (
            <p className="text-xs text-muted-foreground max-w-[160px] truncate">{req.remarks}</p>
          )}
        </div>
      );
    }

    return <span className="text-xs text-muted-foreground">—</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Certificate</h1>
        <p className="text-muted-foreground">Apply for official college certificates</p>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Request</CardTitle>
          <CardDescription>Fill in the details to request a certificate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Select value={certificateType} onValueChange={setCertificateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {certificateType === "Other" && (
                <div className="space-y-2">
                  <Label>Custom Type</Label>
                  <Input value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Enter certificate type" required />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. For scholarship, bank loan, visa..." required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile?.name || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Roll No</Label>
                <Input value={profile?.roll_number || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={profile?.course || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={profile?.year || ""} readOnly className="bg-muted" />
              </div>
            </div>

            <Button type="submit" disabled={submitting || !certificateType || !purpose.trim()}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Track the status of your certificate requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Certificates are prepared and uploaded by the admin. You will be notified when ready to download.</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">No certificate requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      {req.requested_at ? format(new Date(req.requested_at), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>{req.certificate_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.purpose}</TableCell>
                    <TableCell><StatusBadge status={req.status as any} /></TableCell>
                    <TableCell>{renderAction(req)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
