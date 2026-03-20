import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileSpreadsheet, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type AppDocument = Database["public"]["Tables"]["documents"]["Row"];

export default function ExportExcel() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates");
      return;
    }

    if (fromDate > toDate) {
      toast.error("From date must be before To date");
      return;
    }

    setExporting(true);
    try {
      const { data: applications, error } = await supabase
        .from("applications")
        .select("*")
        .gte("submitted_at", startOfDay(fromDate).toISOString())
        .lte("submitted_at", endOfDay(toDate).toISOString())
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      if (!applications || applications.length === 0) {
        toast.error("No applications found in this date range");
        setExporting(false);
        return;
      }

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
        for (let i = 0; i < maxDocs; i++) {
          row[`Document ${i + 1}`] = docs[i] ? docs[i].file_url : "";
        }
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(data);

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
      XLSX.writeFile(
        wb,
        `FeeSync_${format(fromDate, "dd-MM-yyyy")}_to_${format(toDate, "dd-MM-yyyy")}.xlsx`
      );
      toast.success(`Exported ${applications.length} applications`);
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Export Data</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Export to Excel
          </CardTitle>
          <CardDescription>
            Select a date range to export applications submitted during that period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd MMM yyyy") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd MMM yyyy") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    disabled={(date) => date > new Date() || (fromDate ? date < fromDate : false)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {fromDate && toDate && (
            <p className="text-sm text-muted-foreground rounded-lg border p-3 bg-muted/30">
              Exporting applications from{" "}
              <span className="font-medium text-foreground">{format(fromDate, "dd MMM yyyy")}</span>{" "}
              to{" "}
              <span className="font-medium text-foreground">{format(toDate, "dd MMM yyyy")}</span>
            </p>
          )}

          <Button
            onClick={handleExport}
            disabled={exporting || !fromDate || !toDate}
            className="w-full sm:w-auto"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
