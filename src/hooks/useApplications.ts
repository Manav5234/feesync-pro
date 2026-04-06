import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface UseApplicationsOptions {
  status?: ApplicationStatus;
  studentOnly?: boolean;
}

export function useApplications({ status, studentOnly }: UseApplicationsOptions = {}) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from("applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (studentOnly) {
      query = query.eq("student_id", user.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      return;
    }

    setApplications(data || []);
    setLoading(false);
  }, [user, status, studentOnly]);

  const createApplication = async (application: Omit<ApplicationInsert, "student_id">) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("applications")
      .insert({
        ...application,
        student_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit application");
      return { error, data: null };
    }

    toast.success("Application submitted successfully!");
    await fetchApplications();
    return { error: null, data };
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    remarks?: string
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const updateData: Partial<Application> = {
      status: newStatus,
      remarks: remarks || null,
    };

    if (newStatus === "verified" || newStatus === "rejected") {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = user.id;
    }

    const { error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", applicationId);

    if (error) {
      toast.error("Failed to update application status");
      return { error };
    }

    const application = applications.find((a) => a.id === applicationId);
    if (application) {
      const message =
        newStatus === "verified"
          ? `Your application #${applicationId.slice(0, 8)} has been verified ✅`
          : newStatus === "rejected"
          ? `Your application #${applicationId.slice(0, 8)} was rejected ❌${remarks ? `: ${remarks}` : ""}`
          : `Your application #${applicationId.slice(0, 8)} status updated to ${newStatus}`;

      await supabase.from("notifications").insert({
        user_id: application.student_id,
        message,
        application_id: applicationId,
      });
    }

    toast.success(`Application ${newStatus} successfully`);
    await fetchApplications();
    return { error: null };
  };

  const bulkUpdateStatus = async (
    applicationIds: string[],
    newStatus: ApplicationStatus,
    remarks?: string
  ) => {
    for (const id of applicationIds) {
      await updateApplicationStatus(id, newStatus, remarks);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    createApplication,
    updateApplicationStatus,
    bulkUpdateStatus,
    refetch: fetchApplications,
  };
}
