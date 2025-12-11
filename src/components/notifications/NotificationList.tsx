"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";

export function NotificationList() {
  const {
    notifications,
    isLoading,
    markAllAsRead,
    unreadCount,
    refreshNotifications,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium">Notifications</span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 text-xs"
          >
            <Check className="mr-1 h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>
      <Separator />
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshNotifications}
          className="w-full text-xs"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
