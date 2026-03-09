import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type ApplicationType = Database["public"]["Enums"]["application_type"];
type JsonExtractedData = Database["public"]["Tables"]["applications"]["Insert"]["extracted_data"];

type ExtractedData = Record<string, string>;

interface UploadedFile {
  file: File;
  url?: string;
  id?: string;
  uploading?: boolean;
}

export default function SubmitApplication() {
  const { user, profile } = useAuth();
  const { createApplication } = useApplications();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    roll_no: profile?.roll_number || "",
    name: profile?.name || "",
    course: profile?.course || "",
    year: profile?.year || "",
    type: "" as ApplicationType | "",
    description: "",
  });

  const [feeReceipt, setFeeReceipt] = useState<UploadedFile | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dropzone for fee receipt
  const onFeeReceiptDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFeeReceipt({ file, uploading: true });
    setExtracting(true);

    try {
      // Upload to storage
      const ext = file.name.split(".").pop();
      const path = `${user?.id}/receipts/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);
      setFeeReceipt({ file, url: publicUrl });

      // Extract data with AI
      try {
        const { data: extractResult, error: extractError } = await supabase.functions.invoke("extract-document", {
          body: { fileUrl: publicUrl, fileType: file.type },
        });

        if (!extractError && extractResult) {
          setExtractedData(extractResult);
          toast.success("Data extracted from receipt ✨");
        }
      } catch (e) {
        console.error("Extraction failed:", e);
        // Non-fatal, continue without extraction
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setFeeReceipt(null);
    } finally {
      setExtracting(false);
    }
  }, [user]);

  const { getRootProps: getReceiptProps, getInputProps: getReceiptInputProps, isDragActive: isReceiptDragActive } =
    useDropzone({
      onDrop: onFeeReceiptDrop,
      accept: { "image/*": [], "application/pdf": [] },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
    });

  // Dropzone for supporting docs
  const onSupportingDocsDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((f) => ({ file: f, uploading: true }));
    setSupportingDocs((prev) => [...prev, ...newFiles]);

    for (const uploadFile of newFiles) {
      try {
        const ext = uploadFile.file.name.split(".").pop();
        const path = `${user?.id}/docs/${Date.now()}-${uploadFile.file.name}`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(path, uploadFile.file, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);
        setSupportingDocs((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file ? { ...f, url: publicUrl, uploading: false } : f
          )
        );
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${uploadFile.file.name}`);
        setSupportingDocs((prev) => prev.filter((f) => f.file !== uploadFile.file));
      }
    }
  }, [user]);

  const { getRootProps: getDocsProps, getInputProps: getDocsInputProps, isDragActive: isDocsDragActive } =
    useDropzone({
      onDrop: onSupportingDocsDrop,
      accept: { "image/*": [], "application/pdf": [] },
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) {
      toast.error("Please select an application type");
      return;
    }
    if (!feeReceipt?.url) {
      toast.error("Please upload a fee receipt");
      return;
    }

    setSubmitting(true);
    try {
      const { data: appData, error } = await createApplication({
        roll_no: form.roll_no,
        name: form.name,
        course: form.course,
        year: form.year,
        type: form.type as ApplicationType,
        description: form.description,
        extracted_data: extractedData,
      });

      if (error || !appData) throw error;

      // Save documents
      const docsToSave = [
        { file: feeReceipt, type: "fee_receipt" },
        ...supportingDocs.map((d) => ({ file: d, type: "supporting_doc" })),
      ].filter((d) => d.file?.url);

      for (const doc of docsToSave) {
        if (!doc.file?.url) continue;
        await supabase.from("documents").insert({
          application_id: appData.id,
          file_url: doc.file.url,
          file_name: doc.file.file.name,
          file_type: doc.file.file.type || doc.type,
          extracted_data: doc.type === "fee_receipt" ? extractedData : null,
        });
      }

      navigate("/student/submissions");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Submit Application</h1>
        <p className="text-muted-foreground">Fill in the details and upload your documents</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input
                id="roll_no"
                value={form.roll_no}
                onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                placeholder="e.g. CS2021001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="e.g. B.Tech CSE"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4"].map((y) => (
                    <SelectItem key={y} value={y}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Application Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ApplicationType })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee_receipt">Fee Receipt</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                  <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe your application..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fee Receipt Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Receipt</CardTitle>
            <CardDescription>Upload your fee receipt (PDF or image). AI will auto-extract data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!feeReceipt ? (
              <div
                {...getReceiptProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isReceiptDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
                )}
              >
                <input {...getReceiptInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Drop your fee receipt here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF or image, max 10MB</p>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{feeReceipt.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(feeReceipt.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setFeeReceipt(null); setExtractedData(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {extracting && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Extracting data with AI...
                  </div>
                )}

                {extractedData && (
                  <div className="mt-3 rounded-lg bg-primary/5 p-3 border border-primary/20">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
                      <Sparkles className="h-3 w-3" /> AI Extracted Data
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {extractedData.amount && (
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-sm font-medium">{extractedData.amount}</p>
                        </div>
                      )}
                      {extractedData.date && (
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm font-medium">{extractedData.date}</p>
                        </div>
                      )}
                      {extractedData.receipt_number && (
                        <div>
                          <p className="text-xs text-muted-foreground">Receipt No.</p>
                          <p className="text-sm font-medium">{extractedData.receipt_number}</p>
                        </div>
                      )}
                      {extractedData.bank && (
                        <div>
                          <p className="text-xs text-muted-foreground">Bank/Mode</p>
                          <p className="text-sm font-medium">{extractedData.bank}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supporting Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supporting Documents</CardTitle>
            <CardDescription>Upload additional supporting documents (optional, max 5 files)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              {...getDocsProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDocsDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
              )}
            >
              <input {...getDocsInputProps()} />
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop additional documents here</p>
            </div>
            {supportingDocs.length > 0 && (
              <div className="space-y-2">
                {supportingDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded border p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">{doc.file.name}</span>
                      {doc.uploading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSupportingDocs((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </div>
  );
}
