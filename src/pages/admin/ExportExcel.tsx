import { useApplications } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function ExportExcel() {
  const { applications, loading } = useApplications();

  const handleExport = () => {
    const data = applications.map((app) => ({
      "Roll No": app.roll_no,
      "Name": app.name,
      "Course": app.course,
      "Year": app.year,
      "Application Type": app.type.replace("_", " "),
      "Date Submitted": format(new Date(app.submitted_at), "dd/MM/yyyy"),
      "Status": app.status,
      "Verified At": app.verified_at ? format(new Date(app.verified_at), "dd/MM/yyyy") : "",
      "Remarks": app.remarks || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, `FeeSync_Applications_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel file exported successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Export Data</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> Export to Excel</CardTitle>
          <CardDescription>Download all application data as an Excel spreadsheet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Total records: {applications.length}</p>
          <Button onClick={handleExport} disabled={loading || applications.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
