"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/functions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AVAILABLE_TOPICS = [
  { id: "announcements", name: "Announcements", description: "Important updates and news" },
  { id: "promotions", name: "Promotions", description: "Special offers and discounts" },
  { id: "updates", name: "Product Updates", description: "New features and improvements" },
];

export function NotificationSettings() {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    fcmToken,
    isLoading,
    requestPermission,
    unsubscribe,
  } = useNotifications();

  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [topicLoading, setTopicLoading] = useState<string | null>(null);

  const handleTopicToggle = async (topicId: string, enabled: boolean) => {
    if (!user) return;

    setTopicLoading(topicId);
    try {
      if (enabled) {
        const subscribeToTopic = httpsCallable(functions, "subscribeToTopic");
        await subscribeToTopic({ topic: topicId });
        setSubscribedTopics((prev) => [...prev, topicId]);
        toast.success(`Subscribed to ${topicId}`);
      } else {
        const unsubscribeFromTopic = httpsCallable(functions, "unsubscribeFromTopic");
        await unsubscribeFromTopic({ topic: topicId });
        setSubscribedTopics((prev) => prev.filter((t) => t !== topicId));
        toast.success(`Unsubscribed from ${topicId}`);
      }
    } catch (error) {
      console.error("Error toggling topic:", error);
      toast.error("Failed to update subscription");
    } finally {
      setTopicLoading(null);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser does not support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permission === "granted"
                ? "Notifications are enabled"
                : permission === "denied"
                ? "Notifications are blocked by browser"
                : "Enable to receive push notifications"}
            </p>
          </div>
          {permission === "granted" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribe}
              disabled={isLoading || !fcmToken}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Disable"
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={requestPermission}
              disabled={isLoading || permission === "denied"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enable"
              )}
            </Button>
          )}
        </div>

        {permission === "granted" && (
          <>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">Notification Topics</h4>
              <div className="space-y-4">
                {AVAILABLE_TOPICS.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor={topic.id}>{topic.name}</Label>
                      <p className="text-xs text-muted-foreground">
                        {topic.description}
                      </p>
                    </div>
                    <Switch
                      id={topic.id}
                      checked={subscribedTopics.includes(topic.id)}
                      onCheckedChange={(checked) =>
                        handleTopicToggle(topic.id, checked)
                      }
                      disabled={topicLoading === topic.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {permission === "denied" && (
          <p className="text-sm text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
