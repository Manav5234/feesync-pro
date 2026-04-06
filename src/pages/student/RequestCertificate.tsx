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
import { FileText, Download, Loader2 } from "lucide-react";
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

  const handleDownloadPDF = (req: typeof requests[0]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${req.certificate_type}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 60px; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #333; padding-bottom: 20px; }
          .header h1 { font-size: 24px; letter-spacing: 2px; margin-bottom: 4px; }
          .header h2 { font-size: 14px; font-weight: normal; color: #555; }
          .cert-title { text-align: center; margin: 30px 0; font-size: 22px; text-decoration: underline; letter-spacing: 1px; }
          .body-text { font-size: 16px; line-height: 2; margin: 20px 0; text-align: justify; }
          .detail { margin: 8px 0; }
          .detail strong { display: inline-block; min-width: 140px; }
          .footer { margin-top: 80px; display: flex; justify-content: space-between; font-size: 14px; }
          .footer div { text-align: center; }
          .stamp { border-top: 1px solid #333; padding-top: 8px; min-width: 160px; }
          @media print { body { padding: 40px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INDIAN INSTITUTE OF INFORMATION TECHNOLOGY, SONEPAT</h1>
          <h2>An Institute of National Importance under MoE, Govt. of India</h2>
        </div>
        <div class="cert-title">${req.certificate_type.toUpperCase()}</div>
        <div class="body-text">
          <p>This is to certify that <strong>${req.name}</strong>, bearing Roll No. <strong>${req.roll_no}</strong>,
          is a bonafide student of <strong>${req.course}</strong>, Year <strong>${req.year}</strong>,
          at the Indian Institute of Information Technology, Sonepat.</p>
          <br/>
          <p><strong>Purpose:</strong> ${req.purpose}</p>
          <br/>
          <p>This certificate is issued upon the request of the student for the above-mentioned purpose.</p>
        </div>
        <div class="detail"><strong>Date of Issue:</strong> ${format(new Date(), "dd MMMM yyyy")}</div>
        <div class="detail"><strong>Reference No:</strong> IIITS/${new Date().getFullYear()}/${req.id.slice(0, 6).toUpperCase()}</div>
        <div class="footer">
          <div><div class="stamp">Student's Signature</div></div>
          <div><div class="stamp">Authorized Signatory</div><div style="margin-top:4px;font-size:12px;">IIIT Sonepat</div></div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
                  <Input
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter certificate type"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. For scholarship, bank loan, visa..."
                required
              />
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
        <CardContent>
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
                    <TableCell>
                      <StatusBadge status={req.status as any} />
                    </TableCell>
                    <TableCell>
                      {req.status === "approved" ? (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)}>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
