"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export function NotificationTester() {
  const { user } = useAuth();
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState("This is a test notification message");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    if (!user?.uid) {
      toast.error("Please login first");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title,
        body,
        type,
        read: false,
        data: { url: "/blogs" },
        createdAt: Timestamp.now(),
      });

      toast.success("Test notification created!");
      setTitle("Test Notification");
      setBody("This is a test notification message");
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setIsLoading(false);
    }
  };

  const createMultipleNotifications = async () => {
    if (!user?.uid) {
      toast.error("Please login first");
      return;
    }

    setIsLoading(true);
    try {
      const notifications = [
        { title: "Welcome!", body: "Thanks for joining our platform", type: "success" as const },
        { title: "New Feature", body: "Check out our latest blog features", type: "info" as const },
        { title: "Reminder", body: "Don't forget to complete your profile", type: "warning" as const },
        { title: "System Update", body: "Scheduled maintenance tonight at 10 PM", type: "error" as const },
      ];

      for (const notif of notifications) {
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          ...notif,
          read: false,
          data: {},
          createdAt: Timestamp.now(),
        });
      }

      toast.success(`Created ${notifications.length} test notifications!`);
    } catch (error) {
      console.error("Error creating notifications:", error);
      toast.error("Failed to create notifications");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Notification Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Input
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message"
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={sendTestNotification} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Test
          </Button>
          <Button variant="outline" onClick={createMultipleNotifications} disabled={isLoading}>
            Create 4 Samples
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          User ID: {user?.uid || "Not logged in"}
        </p>
      </CardContent>
    </Card>
  );
}
