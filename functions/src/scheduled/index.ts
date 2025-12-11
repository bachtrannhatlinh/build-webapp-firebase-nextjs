import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================
// Scheduled Tasks - Cron Jobs
// ============================================

/**
 * Daily cleanup - Chạy mỗi ngày lúc 2:00 AM (UTC+7)
 * - Xóa các documents cũ
 * - Dọn dẹp temp files
 */
export const dailyCleanup = onSchedule(
  {
    schedule: "0 19 * * *", // 2:00 AM UTC+7 = 19:00 UTC
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    console.log("Starting daily cleanup...");

    try {
      // Delete old webhook logs (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldLogs = await db
        .collection("webhookLogs")
        .where("processedAt", "<", thirtyDaysAgo)
        .limit(500)
        .get();

      const batch = db.batch();
      oldLogs.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`Deleted ${oldLogs.size} old webhook logs`);

      // Delete expired sessions
      const expiredSessions = await db
        .collection("sessions")
        .where("expiresAt", "<", new Date())
        .limit(500)
        .get();

      const sessionBatch = db.batch();
      expiredSessions.docs.forEach((doc) => {
        sessionBatch.delete(doc.ref);
      });
      await sessionBatch.commit();

      console.log(`Deleted ${expiredSessions.size} expired sessions`);
      console.log("Daily cleanup completed");
    } catch (error) {
      console.error("Daily cleanup failed:", error);
    }
  }
);

/**
 * Hourly stats - Chạy mỗi giờ
 * - Tính toán statistics
 * - Cập nhật aggregated data
 */
export const hourlyStats = onSchedule(
  {
    schedule: "0 * * * *", // Every hour
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    console.log("Starting hourly stats calculation...");

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Count new users in the last hour
      const newUsers = await db
        .collection("users")
        .where("createdAt", ">=", oneHourAgo)
        .count()
        .get();

      // Count new blogs in the last hour
      const newBlogs = await db
        .collection("blogs")
        .where("createdAt", ">=", oneHourAgo)
        .count()
        .get();

      // Store stats
      await db.collection("stats").add({
        type: "hourly",
        timestamp: now,
        newUsers: newUsers.data().count,
        newBlogs: newBlogs.data().count,
      });

      console.log(
        `Hourly stats: ${newUsers.data().count} new users, ${newBlogs.data().count} new blogs`
      );
    } catch (error) {
      console.error("Hourly stats failed:", error);
    }
  }
);

/**
 * Weekly report - Chạy mỗi tuần vào Chủ Nhật lúc 8:00 AM
 * - Tạo weekly summary
 * - Gửi email report (optional)
 */
export const weeklyReport = onSchedule(
  {
    schedule: "0 1 * * 0", // 8:00 AM UTC+7 Sunday = 1:00 UTC Sunday
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    console.log("Generating weekly report...");

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get counts
      const [usersSnapshot, blogsSnapshot] = await Promise.all([
        db.collection("users").where("createdAt", ">=", oneWeekAgo).count().get(),
        db.collection("blogs").where("createdAt", ">=", oneWeekAgo).count().get(),
      ]);

      const report = {
        type: "weekly",
        weekEnding: now,
        weekStarting: oneWeekAgo,
        newUsers: usersSnapshot.data().count,
        newBlogs: blogsSnapshot.data().count,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("reports").add(report);

      console.log("Weekly report generated:", report);

      // TODO: Send email notification
      // await sendEmailReport(report);
    } catch (error) {
      console.error("Weekly report failed:", error);
    }
  }
);

/**
 * Every 5 minutes - Health check và monitoring
 */
export const healthMonitor = onSchedule(
  {
    schedule: "*/5 * * * *", // Every 5 minutes
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    try {
      // Simple health check - ensure Firestore is accessible
      await db.collection("_health").doc("ping").set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Health check passed");
    } catch (error) {
      console.error("Health check failed:", error);
      // TODO: Send alert notification
    }
  }
);
