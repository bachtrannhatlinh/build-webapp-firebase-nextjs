import { onRequest } from "firebase-functions/v2/https";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

interface SendNotificationData {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  type?: "info" | "success" | "warning" | "error";
  data?: Record<string, string>;
  imageUrl?: string;
}

interface SendToTopicData {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Gửi notification đến một user cụ thể
 */
export const sendNotification = onCall<SendNotificationData>(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userId, title, body, type = "info", data, imageUrl } = request.data;

    if (!userId || !title || !body) {
      throw new HttpsError(
        "invalid-argument",
        "userId, title, and body are required"
      );
    }

    try {
      // Lưu notification vào Firestore
      const notificationRef = await db.collection("notifications").add({
        userId,
        title,
        body,
        type,
        data: data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Lấy FCM tokens của user
      const tokensSnapshot = await db
        .collection("fcmTokens")
        .where("userId", "==", userId)
        .get();

      if (tokensSnapshot.empty) {
        console.log(`No FCM tokens found for user: ${userId}`);
        return { success: true, notificationId: notificationRef.id, sent: 0 };
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

      // Gửi push notification
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
          imageUrl,
        },
        data: {
          ...data,
          notificationId: notificationRef.id,
          type,
          url: data?.url || "/notifications",
        },
        webpush: {
          fcmOptions: {
            link: data?.url || "/notifications",
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      // Xử lý tokens không hợp lệ
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token: ${tokens[idx]}`, resp.error);
          }
        });

        // Xóa các tokens không hợp lệ
        for (const token of failedTokens) {
          const tokenDocs = await db
            .collection("fcmTokens")
            .where("token", "==", token)
            .get();
          for (const doc of tokenDocs.docs) {
            await doc.ref.delete();
          }
        }
      }

      return {
        success: true,
        notificationId: notificationRef.id,
        sent: response.successCount,
        failed: response.failureCount,
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new HttpsError("internal", "Failed to send notification");
    }
  }
);

/**
 * Gửi notification đến nhiều users
 */
export const sendBulkNotification = onCall<SendNotificationData>(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userIds, title, body, type = "info", data, imageUrl } = request.data;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new HttpsError("invalid-argument", "userIds array is required");
    }

    if (!title || !body) {
      throw new HttpsError("invalid-argument", "title and body are required");
    }

    try {
      const batch = db.batch();
      const notificationIds: string[] = [];

      // Tạo notifications cho tất cả users
      for (const userId of userIds) {
        const notificationRef = db.collection("notifications").doc();
        batch.set(notificationRef, {
          userId,
          title,
          body,
          type,
          data: data || {},
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        notificationIds.push(notificationRef.id);
      }

      await batch.commit();

      // Lấy tất cả FCM tokens
      const tokensSnapshot = await db
        .collection("fcmTokens")
        .where("userId", "in", userIds.slice(0, 10)) // Firestore giới hạn 10 items trong "in"
        .get();

      if (tokensSnapshot.empty) {
        return { success: true, notificationIds, sent: 0 };
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

      // Gửi push notifications
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
          imageUrl,
        },
        data: {
          ...data,
          type,
          url: data?.url || "/notifications",
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      return {
        success: true,
        notificationIds,
        sent: response.successCount,
        failed: response.failureCount,
      };
    } catch (error) {
      console.error("Error sending bulk notification:", error);
      throw new HttpsError("internal", "Failed to send bulk notification");
    }
  }
);

/**
 * Gửi notification đến một topic
 */
export const sendToTopic = onCall<SendToTopicData>(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { topic, title, body, data, imageUrl } = request.data;

    if (!topic || !title || !body) {
      throw new HttpsError(
        "invalid-argument",
        "topic, title, and body are required"
      );
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
          imageUrl,
        },
        data: {
          ...data,
          url: data?.url || "/notifications",
        },
      };

      const response = await messaging.send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error("Error sending to topic:", error);
      throw new HttpsError("internal", "Failed to send to topic");
    }
  }
);

/**
 * Subscribe user to a topic
 */
export const subscribeToTopic = onCall<{ topic: string }>(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { topic } = request.data;
    const userId = request.auth.uid;

    if (!topic) {
      throw new HttpsError("invalid-argument", "topic is required");
    }

    try {
      const tokensSnapshot = await db
        .collection("fcmTokens")
        .where("userId", "==", userId)
        .get();

      if (tokensSnapshot.empty) {
        throw new HttpsError("not-found", "No FCM tokens found for user");
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);
      await messaging.subscribeToTopic(tokens, topic);

      // Lưu subscription vào Firestore
      await db.collection("topicSubscriptions").doc(`${userId}_${topic}`).set({
        userId,
        topic,
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, topic };
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      throw new HttpsError("internal", "Failed to subscribe to topic");
    }
  }
);

/**
 * Unsubscribe user from a topic
 */
export const unsubscribeFromTopic = onCall<{ topic: string }>(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { topic } = request.data;
    const userId = request.auth.uid;

    if (!topic) {
      throw new HttpsError("invalid-argument", "topic is required");
    }

    try {
      const tokensSnapshot = await db
        .collection("fcmTokens")
        .where("userId", "==", userId)
        .get();

      if (!tokensSnapshot.empty) {
        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);
        await messaging.unsubscribeFromTopic(tokens, topic);
      }

      await db.collection("topicSubscriptions").doc(`${userId}_${topic}`).delete();

      return { success: true, topic };
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      throw new HttpsError("internal", "Failed to unsubscribe from topic");
    }
  }
);

/**
 * REST API endpoint cho notifications (admin use)
 */
export const notificationsApi = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    try {
      if (req.method === "POST") {
        const { userId, userIds, title, body, type, data, imageUrl } = req.body;

        if (!title || !body) {
          res.status(400).json({ error: "title and body are required" });
          return;
        }

        const targetUserIds = userIds || (userId ? [userId] : null);
        if (!targetUserIds) {
          res.status(400).json({ error: "userId or userIds is required" });
          return;
        }

        const results = [];

        for (const uid of targetUserIds) {
          // Lưu notification
          const notificationRef = await db.collection("notifications").add({
            userId: uid,
            title,
            body,
            type: type || "info",
            data: data || {},
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Lấy tokens
          const tokensSnapshot = await db
            .collection("fcmTokens")
            .where("userId", "==", uid)
            .get();

          if (!tokensSnapshot.empty) {
            const tokens = tokensSnapshot.docs.map(
              (doc) => doc.data().token as string
            );

            const message: admin.messaging.MulticastMessage = {
              tokens,
              notification: { title, body, imageUrl },
              data: { ...data, notificationId: notificationRef.id },
            };

            const response = await messaging.sendEachForMulticast(message);
            results.push({
              userId: uid,
              notificationId: notificationRef.id,
              sent: response.successCount,
              failed: response.failureCount,
            });
          } else {
            results.push({
              userId: uid,
              notificationId: notificationRef.id,
              sent: 0,
              failed: 0,
            });
          }
        }

        res.status(201).json({ success: true, results });
      } else if (req.method === "GET") {
        const userId = req.query.userId as string;
        const limitCount = parseInt(req.query.limit as string) || 50;

        if (!userId) {
          res.status(400).json({ error: "userId is required" });
          return;
        }

        const snapshot = await db
          .collection("notifications")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limitCount)
          .get();

        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.json({ notifications });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      console.error("Error in notifications API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
