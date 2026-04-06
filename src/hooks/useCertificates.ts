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

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, createRequest, refetch: fetchRequests };
}
