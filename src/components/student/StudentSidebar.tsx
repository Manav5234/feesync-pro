import { Home, FileText, List, Bell, User, LogOut, Menu, Award, MessageSquare, Megaphone } from "lucide-react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Home", url: "/student", icon: Home },
  { title: "Submit Application", url: "/student/submit", icon: FileText },
  { title: "My Submissions", url: "/student/submissions", icon: List },
  { title: "Certificates", url: "/student/certificates", icon: Award },
  { title: "Grievances", url: "/student/grievances", icon: MessageSquare },
  { title: "Announcements", url: "/student/announcements", icon: Megaphone },
  { title: "Notifications", url: "/student/notifications", icon: Bell },
  { title: "Profile", url: "/student/profile", icon: User },
];

export function StudentSidebar() {
  const { signOut, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-heading text-sm font-bold">FeeSync</span>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <RouterNavLink
                      to={item.url}
                      end={item.url === "/student"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.title === "Notifications" && unreadCount > 0 && !collapsed && (
                        <span className="relative ml-auto flex h-5 min-w-[20px] items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/40" />
                          <span className="relative inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                            {unreadCount}
                          </span>
                        </span>
                      )}
                    </RouterNavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!collapsed && profile && (
          <div className="mb-3 text-sm">
            <p className="font-medium truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.roll_number}</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
