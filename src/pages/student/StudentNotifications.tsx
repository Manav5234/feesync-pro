import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

function getNotificationRoute(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("certificate")) return "/student/certificates";
  if (lower.includes("application") || lower.includes("verified") || lower.includes("rejected"))
    return "/student/submissions";
  return null;
}

function getLeftBorderClass(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("certificate")) return "border-l-4 border-l-blue-500";
  if (lower.includes("verified")) return "border-l-4 border-l-green-500";
  if (lower.includes("rejected")) return "border-l-4 border-l-red-500";
  return "border-l-4 border-l-muted-foreground/30";
}

export default function StudentNotifications() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification.message);
    if (route) navigate(route);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mb-3" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm">We'll notify you when your application status changes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const route = getNotificationRoute(notification.message);
            return (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-colors cursor-pointer hover:bg-muted/60",
                  getLeftBorderClass(notification.message),
                  !notification.is_read && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "mt-1.5 flex h-2 w-2 rounded-full flex-shrink-0",
                      notification.is_read ? "bg-muted" : "bg-primary"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {route && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
