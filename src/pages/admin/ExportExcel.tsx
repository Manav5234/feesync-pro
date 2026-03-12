import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppDocument = Database["public"]["Tables"]["documents"]["Row"];

export default function ExportExcel() {
  const { applications, loading } = useApplications();
  const [docsMap, setDocsMap] = useState<Record<string, AppDocument[]>>({});
  const [exporting, setExporting] = useState(false);

  // Fetch all documents for all applications
  useEffect(() => {
    if (applications.length === 0) return;
    const fetchDocs = async () => {
      const appIds = applications.map((a) => a.id);
      const { data } = await supabase
        .from("documents")
        .select("*")
        .in("application_id", appIds);
      if (data) {
        const map: Record<string, AppDocument[]> = {};
        data.forEach((doc) => {
          if (!map[doc.application_id]) map[doc.application_id] = [];
          map[doc.application_id].push(doc);
        });
        setDocsMap(map);
      }
    };
    fetchDocs();
  }, [applications]);

  const handleExport = () => {
    setExporting(true);
    try {
      const data = applications.map((app) => {
        const docs = docsMap[app.id] || [];
        const docLinks = docs.map((d, i) => d.file_url).join(" | ");
        const docNames = docs.map((d) => d.file_name).join(" | ");

        return {
          "Roll No": app.roll_no,
          "Name": app.name,
          "Course": app.course,
          "Year": app.year,
          "Application Type": app.type.replace("_", " "),
          "Description": app.description || "",
          "Date Submitted": format(new Date(app.submitted_at), "dd/MM/yyyy"),
          "Status": app.status,
          "Verified At": app.verified_at ? format(new Date(app.verified_at), "dd/MM/yyyy") : "",
          "Remarks": app.remarks || "",
          "Document Names": docNames,
          "Document Links": docLinks,
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);

      // Make document links clickable hyperlinks
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      const linkColIndex = Object.keys(data[0] || {}).indexOf("Document Links");
      if (linkColIndex >= 0 && data.length > 0) {
        for (let row = 1; row <= data.length; row++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: linkColIndex });
          const cell = ws[cellRef];
          if (cell && cell.v) {
            // For single links, add hyperlink
            const links = String(cell.v).split(" | ").filter(Boolean);
            if (links.length === 1) {
              cell.l = { Target: links[0], Tooltip: "Download Document" };
            }
          }
        }
      }

      // Auto-size columns
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Applications");
      XLSX.writeFile(wb, `FeeSync_Applications_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success("Excel file exported with document links!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Export Data</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> Export to Excel</CardTitle>
          <CardDescription>Download all application data with document links as an Excel spreadsheet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Total records: {applications.length} • Documents will be included as clickable links
          </p>
          <Button onClick={handleExport} disabled={loading || exporting || applications.length === 0}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}