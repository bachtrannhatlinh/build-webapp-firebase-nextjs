import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================
// Firestore Triggers - React to database changes
// ============================================

/**
 * Khi user mới được tạo
 * - Tạo profile mặc định
 * - Gửi welcome email
 */
export const onUserCreated = onDocumentCreated(
  {
    document: "users/{userId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const userId = event.params.userId;
    const userData = snapshot.data();

    console.log(`New user created: ${userId}`);

    try {
      // Create default user profile
      await db.collection("profiles").doc(userId).set({
        userId,
        displayName: userData.displayName || "Anonymous",
        avatar: null,
        bio: "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user count in stats
      await db.collection("_counters").doc("users").set(
        {
          count: admin.firestore.FieldValue.increment(1),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // TODO: Send welcome email
      // await sendWelcomeEmail(userData.email);

      console.log(`Profile created for user: ${userId}`);
    } catch (error) {
      console.error("Error in onUserCreated:", error);
    }
  }
);

/**
 * Khi blog được tạo
 * - Cập nhật author's blog count
 * - Index cho search (optional)
 */
export const onBlogCreated = onDocumentCreated(
  {
    document: "blogs/{blogId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const blogId = event.params.blogId;
    const blogData = snapshot.data();

    console.log(`New blog created: ${blogId}`);

    try {
      // Update author's blog count
      if (blogData.authorId) {
        await db.collection("profiles").doc(blogData.authorId).update({
          blogCount: admin.firestore.FieldValue.increment(1),
        });
      }

      // Update total blog count
      await db.collection("_counters").doc("blogs").set(
        {
          count: admin.firestore.FieldValue.increment(1),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`Blog stats updated for: ${blogId}`);
    } catch (error) {
      console.error("Error in onBlogCreated:", error);
    }
  }
);

/**
 * Khi blog được cập nhật
 * - Log activity
 * - Re-index cho search
 */
export const onBlogUpdated = onDocumentUpdated(
  {
    document: "blogs/{blogId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    const blogId = event.params.blogId;

    console.log(`Blog updated: ${blogId}`);

    // Log the update
    await db.collection("activityLogs").add({
      type: "blog_updated",
      blogId,
      changes: {
        titleChanged: beforeData.title !== afterData.title,
        contentChanged: beforeData.content !== afterData.content,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

/**
 * Khi blog bị xóa
 * - Cập nhật author's blog count
 * - Xóa related data (comments, likes, etc.)
 */
export const onBlogDeleted = onDocumentDeleted(
  {
    document: "blogs/{blogId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const blogId = event.params.blogId;
    const blogData = snapshot.data();

    console.log(`Blog deleted: ${blogId}`);

    try {
      // Update author's blog count
      if (blogData.authorId) {
        await db.collection("profiles").doc(blogData.authorId).update({
          blogCount: admin.firestore.FieldValue.increment(-1),
        });
      }

      // Update total blog count
      await db.collection("_counters").doc("blogs").set(
        {
          count: admin.firestore.FieldValue.increment(-1),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Delete related comments
      const comments = await db
        .collection("comments")
        .where("blogId", "==", blogId)
        .get();

      const batch = db.batch();
      comments.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`Deleted ${comments.size} comments for blog: ${blogId}`);
    } catch (error) {
      console.error("Error in onBlogDeleted:", error);
    }
  }
);

/**
 * Khi có chat message mới
 * - Gửi push notification
 * - Cập nhật unread count
 */
export const onChatMessage = onDocumentCreated(
  {
    document: "chats/{chatId}/messages/{messageId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const chatId = event.params.chatId;
    const messageData = snapshot.data();

    console.log(`New message in chat: ${chatId}`);

    try {
      // Update chat's last message
      await db.collection("chats").doc(chatId).update({
        lastMessage: messageData.text?.substring(0, 100) || "New message",
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: Send push notification to other participants
      // await sendPushNotification(messageData);
    } catch (error) {
      console.error("Error in onChatMessage:", error);
    }
  }
);
