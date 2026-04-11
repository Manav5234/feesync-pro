import {
  LayoutDashboard,
  FileStack,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Send,
  User,
  LogOut,
  Award,
  MessageSquare,
  Megaphone,
} from "lucide-react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "All Applications", url: "/admin/applications", icon: FileStack },
  { title: "Pending Review", url: "/admin/pending", icon: Clock },
  { title: "Verified", url: "/admin/verified", icon: CheckCircle },
  { title: "Rejected", url: "/admin/rejected", icon: XCircle },
  { title: "Certificates", url: "/admin/certificates", icon: Award },
  { title: "Grievances", url: "/admin/grievances", icon: MessageSquare },
  { title: "Export Excel", url: "/admin/export", icon: Download },
  { title: "Send Notifications", url: "/admin/notifications", icon: Send },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Profile", url: "/admin/profile", icon: User },
];

export function AdminSidebar() {
  const { signOut, profile } = useAuth();
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
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(0, 7).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <RouterNavLink
                      to={item.url}
                      end={item.url === "/admin"}
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
                    </RouterNavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(7).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <RouterNavLink
                      to={item.url}
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
            <p className="text-xs text-muted-foreground">Administrator</p>
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
