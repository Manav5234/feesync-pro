import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [dots, setDots] = useState("");

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleGoHome = () => {
    if (profile?.role === "admin") navigate("/admin");
    else if (profile?.role === "student") navigate("/student");
    else navigate("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">

      {/* Animated background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/3 animate-pulse delay-300" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Glowing 404 */}
        <div className="relative mb-6 select-none">
          <div className="text-[160px] font-black leading-none tracking-tighter text-primary/10">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-primary to-primary/40 bg-clip-text text-transparent">
              404
            </div>
          </div>
        </div>

        {/* Terminal-style error box */}
        <div className="w-full mb-8 rounded-xl border border-border bg-muted/50 p-4 text-left font-mono text-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-muted-foreground">feesync — terminal</span>
          </div>
          <p className="text-muted-foreground">
            <span className="text-green-500">feesync</span>
            <span className="text-primary"> ~ </span>
            <span className="text-foreground">cd {location.pathname}</span>
          </p>
          <p className="text-red-400 mt-1">
            error: no such page or directory
          </p>
          <p className="text-muted-foreground mt-1">
            searching for page{dots}
          </p>
          <p className="text-yellow-500 mt-1">
            suggestion: try navigating home instead
          </p>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Lost in the system?</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Don't worry — let's get you back on track.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {profile?.role === "admin"
              ? "Admin Dashboard"
              : profile?.role === "student"
              ? "Student Dashboard"
              : "Back to Home"}
          </Button>
        </div>

        {/* Branding */}
        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">FS</span>
          </div>
          <span><span className="font-semibold text-foreground">FeeSync</span> · IIIT Sonepat</span>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
