import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  user_id: string;
  role: AppRole;
  roll_number: string | null;
  name: string;
  course: string | null;
  year: string | null;
  email: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (role: "student" | "admin") => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  const checkAndRedirect = async (userEmail: string | undefined) => {
    if (!userEmail) return;

    // ✅ Don't redirect if already on correct page
    const path = window.location.pathname;
    if (
      path.startsWith("/student") ||
      path.startsWith("/admin")
    ) return;

    const email = userEmail.toLowerCase();

    // Check admin first
    const { data: adminData } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (adminData) {
      window.location.href = "/admin";
      return;
    }

    // Check college email for student
    if (!email.endsWith("@iiitsonepat.ac.in")) {
      toast.error("Only college email allowed (@iiitsonepat.ac.in)");
      await supabase.auth.signOut();
      window.location.href = "/";
      return;
    }

    // Valid student
    window.location.href = "/student";
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);

            // ✅ Only redirect on actual sign in, not on every page load
            if (event === "SIGNED_IN") {
              await checkAndRedirect(currentSession.user.email);
            }
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // ✅ Google sign in - redirects back to Vercel
  const signInWithGoogle = async (role: "student" | "admin") => {
    localStorage.setItem("auth_intent", role);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://feesync-pro.vercel.app/",
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
