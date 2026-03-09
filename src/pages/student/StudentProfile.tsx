import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Save } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    course: "",
    year: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        roll_number: profile.roll_number || "",
        course: profile.course || "",
        year: profile.year || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        roll_number: form.roll_number,
        course: form.course,
        year: form.year,
        phone: form.phone,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      await refreshProfile();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll_number">Roll Number</Label>
                <Input
                  id="roll_number"
                  value={form.roll_number}
                  onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                  placeholder="e.g. CS2021001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  placeholder="e.g. B.Tech CSE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g. 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={form.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="mt-2">
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
              {profile?.role}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-xs text-muted-foreground font-mono">{user?.id?.slice(0, 8)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
