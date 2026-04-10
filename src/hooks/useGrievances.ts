import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Grievance {
  id: string;
  student_id: string | null;
  roll_no: string | null;
  name: string | null;
  course: string | null;
  year: string | null;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string | null;
  submitted_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export function useGrievances({ studentOnly = false }: { studentOnly?: boolean } = {}) {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrievances = useCallback(async () => {
    if (!user) return;
    let query = supabase
      .from("grievances" as any)
      .select("*")
      .order("submitted_at", { ascending: false });

    if (studentOnly) {
      query = query.eq("student_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching grievances:", error);
      toast.error("Failed to load grievances");
      setLoading(false);
      return;
    }
    setGrievances((data as any as Grievance[]) || []);
    setLoading(false);
  }, [user, studentOnly]);

  const createGrievance = async (data: {
    roll_no: string;
    name: string;
    course: string;
    year: string;
    category: string;
    subject: string;
    description: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("grievances" as any)
      .insert({ ...data, student_id: user.id } as any);

    if (error) {
      toast.error("Failed to submit grievance");
      return { error };
    }
    toast.success("Grievance submitted successfully!");
    await fetchGrievances();
    return { error: null };
  };

  const updateGrievance = async (
    id: string,
    updates: { status: string; admin_response: string | null; resolved_at?: string | null; resolved_by?: string | null },
    notifyInfo: { studentId: string; subject: string }
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from("grievances" as any)
      .update(updates as any)
      .eq("id", id);

    if (error) {
      console.error("Error updating grievance:", error);
      toast.error("Failed to update grievance");
      return;
    }

    const statusLabel = updates.status === "resolved" ? "resolved ✅" : updates.status === "in_progress" ? "being reviewed 🔄" : "open";
    const message = `Your grievance regarding "${notifyInfo.subject}" is now ${statusLabel}.${updates.admin_response ? ` Admin response: ${updates.admin_response}` : ""}`;

    await supabase.from("notifications").insert({
      user_id: notifyInfo.studentId,
      message,
    });

    toast.success("Grievance updated successfully");
    await fetchGrievances();
  };

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  return { grievances, loading, createGrievance, updateGrievance, refetch: fetchGrievances };
}
