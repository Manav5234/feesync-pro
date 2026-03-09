import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user?.email) {
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase
        .from("admin_emails")
        .select("email")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      setIsAdmin(!!data);
      setCheckingRole(false);
    };

    if (user) {
      checkRole();
    } else {
      setCheckingRole(false);
    }
  }, [user]);

  if (loading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access using admin_emails table
  if (allowedRoles && isAdmin !== null) {
    const userRole = isAdmin ? "admin" : "student";
    if (!allowedRoles.includes(userRole)) {
      const redirectPath = isAdmin ? "/admin" : "/student";
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}
