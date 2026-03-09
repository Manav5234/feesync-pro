import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card py-8">
      <div className="container text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="h-4 w-4 fill-destructive text-destructive" /> by Manav
        </p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} FeeSync — College Fee Management System</p>
      </div>
    </footer>
  );
}
