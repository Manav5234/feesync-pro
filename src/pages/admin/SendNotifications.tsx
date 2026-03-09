import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SendNotifications() {
  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [rollNo, setRollNo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Please enter a message"); return; }
    if (mode === "single" && !rollNo.trim()) { toast.error("Please enter a roll number"); return; }
    
    setSending(true);
    try {
      if (mode === "single") {
        const { data: profile } = await supabase.from("profiles").select("user_id").eq("roll_number", rollNo).single();
        if (!profile) { toast.error("Student not found"); setSending(false); return; }
        await supabase.from("notifications").insert({ user_id: profile.user_id, message });
        toast.success("Notification sent!");
      } else {
        const { data: profiles } = await supabase.from("profiles").select("user_id").eq("role", "student");
        if (profiles && profiles.length > 0) {
          await supabase.from("notifications").insert(profiles.map((p) => ({ user_id: p.user_id, message })));
          toast.success(`Broadcast sent to ${profiles.length} students!`);
        }
      }
      setMessage(""); setRollNo("");
    } catch (e) { toast.error("Failed to send notification"); }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Send Notifications</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Compose Notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "single" | "broadcast")}>
            <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="single" /><Label htmlFor="single">Single Student</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="broadcast" id="broadcast" /><Label htmlFor="broadcast">Broadcast to All</Label></div>
          </RadioGroup>
          {mode === "single" && (
            <div className="space-y-2"><Label>Roll Number</Label><Input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. CS2021001" /></div>
          )}
          <div className="space-y-2"><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your notification message..." rows={4} /></div>
          <Button onClick={handleSend} disabled={sending}>{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send Notification</Button>
        </CardContent>
      </Card>
    </div>
  );
}
