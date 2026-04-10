import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGrievances } from "@/hooks/useGrievances";
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
import { MessageSquare, Loader2, Send, Info, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const CATEGORIES = ["Fee Related", "Certificate", "Academic", "Other"];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400",
  resolved: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function MyGrievances() {
  const { profile } = useAuth();
  const { grievances, loading, createGrievance } = useGrievances({ studentOnly: true });

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !category || !subject.trim() || !description.trim()) return;

    setSubmitting(true);
    await createGrievance({
      roll_no: profile.roll_number || "",
      name: profile.name,
      course: profile.course || "",
      year: profile.year || "",
      category,
      subject: subject.trim(),
      description: description.trim(),
    });
    setCategory("");
    setSubject("");
    setDescription("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Grievances
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Submit and track your complaints</p>
      </motion.div>

      {/* Submit Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit New Grievance
            </CardTitle>
            <CardDescription>Describe your issue and we'll look into it</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input value={profile?.name || ""} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Roll No</Label>
                  <Input value={profile?.roll_number || ""} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Course</Label>
                  <Input value={profile?.course || ""} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Input value={profile?.year || ""} disabled className="bg-muted/50" />
                </div>
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject *</Label>
                <Input
                  placeholder="Brief subject of your grievance"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={submitting || !category || !subject.trim() || !description.trim()}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4 mr-2" /> Submit Grievance</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grievances List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Grievances</CardTitle>
            <CardDescription>{grievances.length} grievance(s) submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No grievances submitted yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grievances.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {g.submitted_at ? format(new Date(g.submitted_at), "dd MMM yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{g.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">{g.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[g.status] || ""}>
                            {STATUS_LABELS[g.status] || g.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {g.admin_response ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-primary cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">{g.admin_response}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-xs text-muted-foreground">Awaiting</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
