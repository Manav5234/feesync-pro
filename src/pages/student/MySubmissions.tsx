import { useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];

export default function MySubmissions() {
  const { applications, loading } = useApplications({ studentOnly: true });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Submissions</h1>
        <p className="text-muted-foreground">Track all your submitted applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm">Submit your first application to see it here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(app.submitted_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {app.type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {app.remarks || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          mode="student"
        />
      )}
    </div>
  );
}
