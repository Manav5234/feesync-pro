import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const { role } = useParams<{ role: "student" | "admin" }>();
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  const [idOrEmail, setIdOrEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = isAdmin ? `${idOrEmail}@admin.feesync.com` : idOrEmail;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset instructions sent to your email.");
      setIdOrEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute left-4 top-4">
        <Button variant="ghost" onClick={() => navigate(`/login/${role}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>
      </div>
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-heading text-xl font-bold">FeeSync</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {isAdmin ? <ShieldCheck className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="font-heading text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your {isAdmin ? "Admin ID" : "Email"} to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idOrEmail">{isAdmin ? "Admin ID" : "Email"}</Label>
              <Input
                id="idOrEmail"
                type={isAdmin ? "text" : "email"}
                placeholder={isAdmin ? "Enter Admin ID" : "you@college.edu"}
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}