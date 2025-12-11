"use client";

import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/lib/messaging";
import { cn } from "@/lib/utils";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const Icon = typeIcons[notification.type] || Info;
  const iconColor = typeColors[notification.type] || "text-blue-500";

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const formatTime = (timestamp: { toDate: () => Date } | undefined) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
        !notification.read && "bg-muted/30"
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            !notification.read && "font-semibold"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}
