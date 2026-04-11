import { useState } from "react";
import { useAnnouncements, type Announcement } from "@/hooks/useAnnouncements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Megaphone, Pin, Trash2, Pencil, AlertTriangle, Info, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const priorityStyles: Record<string, { border: string; bg: string; badge: string }> = {
  urgent: {
    border: "border-l-red-500",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  normal: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50/50 dark:bg-yellow-950/20",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

export default function Announcements() {
  const { announcements, loading, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("normal");
  const [editPinned, setEditPinned] = useState(false);
  const [editExpires, setEditExpires] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        description: description.trim(),
        priority,
        is_pinned: isPinned,
        expires_at: expiresAt || null,
      });
      setTitle("");
      setDescription("");
      setPriority("normal");
      setIsPinned(false);
      setExpiresAt("");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (a: Announcement) => {
    setEditItem(a);
    setEditTitle(a.title);
    setEditDescription(a.description);
    setEditPriority(a.priority);
    setEditPinned(a.is_pinned);
    setEditExpires(a.expires_at ? a.expires_at.slice(0, 16) : "");
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    await updateAnnouncement(editItem.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      is_pinned: editPinned,
      expires_at: editExpires || null,
    });
    setEditItem(null);
  };

  const now = new Date();
  const allAnnouncements = announcements;
  const urgentCount = allAnnouncements.filter((a) => a.priority === "urgent").length;
  const pinnedCount = allAnnouncements.filter((a) => a.is_pinned).length;

  const stats = [
    { label: "Total", value: allAnnouncements.length, icon: Megaphone, color: "text-primary" },
    { label: "Urgent", value: urgentCount, icon: AlertTriangle, color: "text-red-500" },
    { label: "Pinned", value: pinnedCount, icon: Pin, color: "text-yellow-500" },
    { label: "Active", value: allAnnouncements.length, icon: Bell, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground text-sm">Manage college announcements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <div>
                <p className="text-2xl font-bold">{loading ? "-" : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Announcement</CardTitle>
          <CardDescription>Post a new announcement for students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Announcement description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="normal">🟡 Normal</SelectItem>
                  <SelectItem value="info">🔵 Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date (optional)</Label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              <Label>Pin to top</Label>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={submitting || !title.trim() || !description.trim()}>
            {submitting ? "Posting..." : "Post Announcement"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : allAnnouncements.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No announcements yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {allAnnouncements.map((a, i) => {
            const style = priorityStyles[a.priority] || priorityStyles.normal;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn("border-l-4", style.border, style.bg)}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <Badge className={cn("text-[10px]", style.badge)} variant="secondary">{a.priority}</Badge>
                        {a.is_pinned && <Badge variant="outline" className="text-[10px]"><Pin className="h-2.5 w-2.5 mr-1" />Pinned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground/70">
                        <span>{format(new Date(a.created_at), "MMM dd, yyyy h:mm a")}</span>
                        {a.expires_at && <span>Expires: {format(new Date(a.expires_at), "MMM dd, yyyy")}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            <Select value={editPriority} onValueChange={setEditPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="normal">🟡 Normal</SelectItem>
                <SelectItem value="info">🔵 Info</SelectItem>
              </SelectContent>
            </Select>
            <Input type="datetime-local" value={editExpires} onChange={(e) => setEditExpires(e.target.value)} />
            <div className="flex items-center gap-3">
              <Switch checked={editPinned} onCheckedChange={setEditPinned} />
              <Label>Pin to top</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
