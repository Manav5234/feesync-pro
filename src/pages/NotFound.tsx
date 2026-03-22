import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileSearch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoHome = () => {
    if (profile?.role === "admin") {
      navigate("/admin");
    } else if (profile?.role === "student") {
      navigate("/student");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">

        {/* Animated 404 */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="text-[120px] font-black text-muted/40 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <FileSearch className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-2">
          The page <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{location.pathname}</span> doesn't exist.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          It may have been moved, deleted, or you may have typed the wrong URL.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {profile?.role === "admin"
              ? "Admin Dashboard"
              : profile?.role === "student"
              ? "Student Dashboard"
              : "Go to Home"}
          </Button>
        </div>

        {/* FeeSync branding */}
        <div className="mt-12 text-xs text-muted-foreground">
          <span className="font-semibold text-primary">FeeSync</span> · IIIT Sonepat
        </div>

      </div>
    </div>
  );
};

export default NotFound;
