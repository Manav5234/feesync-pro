import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type CertificateRequest = Database["public"]["Tables"]["certificate_requests"]["Row"];
type CertificateInsert = Database["public"]["Tables"]["certificate_requests"]["Insert"];

export function useCertificates({ studentOnly = false }: { studentOnly?: boolean } = {}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from("certificate_requests")
      .select("*")
      .order("requested_at", { ascending: false });

    if (studentOnly) {
      query = query.eq("student_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching certificate requests:", error);
      toast.error("Failed to load certificate requests");
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  }, [user, studentOnly]);

  const createRequest = async (
    request: Omit<CertificateInsert, "student_id">
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("certificate_requests")
      .insert({ ...request, student_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit certificate request");
      return { error, data: null };
    }

    toast.success("Certificate request submitted!");
    await fetchRequests();
    return { error: null, data };
  };

  const updateRequest = async (
    id: string,
    updates: {
      status: string;
      remarks: string | null;
      file_url?: string | null;
      approved_at?: string | null;
      approved_by?: string | null;
    },
    notifyInfo: { studentId: string; certificateType: string }
  ) => {
    if (!user) return;

    const updatePayload: Record<string, unknown> = {
      status: updates.status,
      remarks: updates.remarks,
    };

    if (updates.file_url !== undefined) {
      updatePayload.file_url = updates.file_url;
    }
    if (updates.approved_at !== undefined) {
      updatePayload.approved_at = updates.approved_at;
    }
    if (updates.approved_by !== undefined) {
      updatePayload.approved_by = updates.approved_by;
    }

    const { error } = await supabase
      .from("certificate_requests")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Error updating certificate request:", error);
      toast.error("Failed to update request");
      return;
    }

    // Send notification to student
    const statusLabel = updates.status === "approved" ? "approved ✅" : "rejected ❌";
    const message =
      updates.status === "approved"
        ? `Your ${notifyInfo.certificateType} is ready! Click to download. ✅`
        : `Your ${notifyInfo.certificateType} request has been ${statusLabel}.${
            updates.remarks ? ` Remarks: ${updates.remarks}` : ""
          }`;

    await supabase.from("notifications").insert({
      user_id: notifyInfo.studentId,
      message,
    });

    toast.success(`Request ${updates.status} successfully`);
    await fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, createRequest, updateRequest, refetch: fetchRequests };
}
