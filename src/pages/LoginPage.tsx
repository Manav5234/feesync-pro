import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function LoginPage() {
  const { role } = useParams<{ role: "student" | "admin" }>();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const isAdmin = role === "admin";

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ id: "", email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = isAdmin ? form.id : form.email;

    if (isSignUp) {
      const { error } = await signUp(email, form.password, {
        name: form.name || form.id,
        role: isAdmin ? "admin" : "student",
        roll_number: isAdmin ? null : form.id,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    } else {
      const { error } = await signIn(email, form.password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate(isAdmin ? "/admin" : "/student");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute left-4 top-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
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
          <CardTitle className="font-heading text-2xl">
            {isAdmin ? "Admin Login" : "Student Login"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Access the admin dashboard to manage applications"
              : "Login to submit and track your fee applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">{isAdmin ? "Admin Email" : "Roll Number"}</Label>
              <Input
                id="id"
                type={isAdmin ? "email" : "text"}
                placeholder={isAdmin ? "admin@feesync.com" : "Enter Roll Number"}
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                required
              />
            </div>

            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => navigate(`/forgot-password/${role}`)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
