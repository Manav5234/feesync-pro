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

  const handleExport = async () => {
    setExporting(true);
    try {
      const appIds = applications.map((a) => a.id);
      const { data: allDocs } = await supabase
        .from("documents")
        .select("*")
        .in("application_id", appIds);

      const freshDocsMap: Record<string, AppDocument[]> = {};
      let maxDocs = 0;
      (allDocs || []).forEach((doc) => {
        if (!freshDocsMap[doc.application_id]) freshDocsMap[doc.application_id] = [];
        freshDocsMap[doc.application_id].push(doc);
        maxDocs = Math.max(maxDocs, freshDocsMap[doc.application_id].length);
      });

      const data = applications.map((app) => {
        const docs = freshDocsMap[app.id] || [];
        const row: Record<string, string> = {
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
        };
        // Add each document as a separate column
        for (let i = 0; i < maxDocs; i++) {
          row[`Document ${i + 1}`] = docs[i] ? docs[i].file_url : "";
        }
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(data);

      // Make each document column a clickable hyperlink
      if (data.length > 0) {
        const keys = Object.keys(data[0]);
        keys.forEach((key, colIdx) => {
          if (!key.startsWith("Document ")) return;
          for (let row = 1; row <= data.length; row++) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: colIdx });
            const cell = ws[cellRef];
            if (cell && cell.v) {
              cell.l = { Target: String(cell.v), Tooltip: `Download ${key}` };
            }
          }
        });
      }

      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: key.startsWith("Document") ? 50 : Math.max(key.length, 15),
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