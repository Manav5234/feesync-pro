import { useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import { Eye, Search, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export default function AllApplications({ filterStatus }: { filterStatus?: ApplicationStatus }) {
  const { applications, loading, updateApplicationStatus, bulkUpdateStatus } = useApplications({ status: filterStatus });
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState("");

  const filtered = applications.filter((a) =>
    a.roll_no.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold capitalize">
          {filterStatus ? `${filterStatus.replace("_", " ")} Applications` : "All Applications"}
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by roll no or name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {selected.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm">{selected.length} selected</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { bulkUpdateStatus(selected, "verified"); setSelected([]); }}>
                <CheckCircle className="mr-1 h-4 w-4" /> Bulk Verify
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { bulkUpdateStatus(selected, "rejected", "Bulk rejection"); setSelected([]); }}>
                <XCircle className="mr-1 h-4 w-4" /> Bulk Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
              ) : filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell><Checkbox checked={selected.includes(app.id)} onCheckedChange={() => toggleSelect(app.id)} /></TableCell>
                  <TableCell className="font-mono text-sm">{app.roll_no}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.course}</TableCell>
                  <TableCell className="capitalize">{app.type.replace("_", " ")}</TableCell>
                  <TableCell>{format(new Date(app.submitted_at), "dd MMM yyyy")}</TableCell>
                  <TableCell><StatusBadge status={app.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedApp && (
        <ApplicationDetailModal application={selectedApp} onClose={() => setSelectedApp(null)} onStatusChange={updateApplicationStatus} mode="admin" />
      )}
    </div>
  );
}
