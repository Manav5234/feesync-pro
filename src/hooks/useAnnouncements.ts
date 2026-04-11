import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "normal" | "info";
  is_pinned: boolean;
  expires_at: string | null;
  target_audience: string;
  target_course: string | null;
  target_year: string | null;
  created_by: string | null;
  created_at: string;
}

interface CreateAnnouncementData {
  title: string;
  description: string;
  priority: string;
  is_pinned: boolean;
  expires_at?: string | null;
  target_audience?: string;
  target_course?: string | null;
  target_year?: string | null;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
    } else {
      const now = new Date().toISOString();
      const filtered = (data || []).filter(
        (a: any) => !a.expires_at || a.expires_at > now
      ) as Announcement[];
      setAnnouncements(filtered);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const createAnnouncement = async (announcement: CreateAnnouncementData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      ...announcement,
      created_by: user?.id,
    } as any);
    if (error) {
      toast.error("Failed to create announcement");
      throw error;
    }
    toast.success("Announcement created!");
    fetchAnnouncements();
  };

  const updateAnnouncement = async (id: string, updates: Partial<CreateAnnouncementData>) => {
    const { error } = await supabase
      .from("announcements")
      .update(updates as any)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update announcement");
      throw error;
    }
    toast.success("Announcement updated!");
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete announcement");
      throw error;
    }
    toast.success("Announcement deleted!");
    fetchAnnouncements();
  };

  return { announcements, loading, createAnnouncement, updateAnnouncement, deleteAnnouncement, refetch: fetchAnnouncements };
}
