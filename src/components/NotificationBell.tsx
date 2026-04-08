import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function getNotificationRoute(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("certificate")) return "/student/certificates";
  if (lower.includes("application") || lower.includes("verified") || lower.includes("rejected"))
    return "/student/submissions";
  return null;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification.message);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/40" />
              <span className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const route = getNotificationRoute(notification.message);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                      !notification.is_read && "bg-primary/5",
                      route && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {route && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
