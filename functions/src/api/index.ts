import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================
// API Endpoints - HTTP Callable Functions
// ============================================

/**
 * GET /api/users - Lấy danh sách users
 * GET /api/users/:id - Lấy thông tin user theo ID
 */
export const users = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    try {
      if (req.method === "GET") {
        const userId = req.query.id as string;

        if (userId) {
          // Get single user
          const userDoc = await db.collection("users").doc(userId).get();
          if (!userDoc.exists) {
            res.status(404).json({ error: "User not found" });
            return;
          }
          res.json({ id: userDoc.id, ...userDoc.data() });
        } else {
          // Get all users
          const snapshot = await db.collection("users").limit(50).get();
          const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.json({ users });
        }
      } else if (req.method === "POST") {
        // Create new user
        const { email, displayName } = req.body;
        if (!email) {
          res.status(400).json({ error: "Email is required" });
          return;
        }

        const newUser = {
          email,
          displayName: displayName || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection("users").add(newUser);
        res.status(201).json({ id: docRef.id, ...newUser });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      console.error("Error in users API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * API endpoint cho blogs
 */
export const blogs = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    try {
      if (req.method === "GET") {
        const blogId = req.query.id as string;
        const limit = parseInt(req.query.limit as string) || 20;

        if (blogId) {
          const blogDoc = await db.collection("blogs").doc(blogId).get();
          if (!blogDoc.exists) {
            res.status(404).json({ error: "Blog not found" });
            return;
          }
          res.json({ id: blogDoc.id, ...blogDoc.data() });
        } else {
          const snapshot = await db
            .collection("blogs")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();
          const blogs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.json({ blogs });
        }
      } else if (req.method === "POST") {
        const { title, content, authorId } = req.body;
        if (!title || !content) {
          res.status(400).json({ error: "Title and content are required" });
          return;
        }

        const newBlog = {
          title,
          content,
          authorId: authorId || "anonymous",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection("blogs").add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog });
      } else if (req.method === "PUT") {
        const blogId = req.query.id as string;
        if (!blogId) {
          res.status(400).json({ error: "Blog ID is required" });
          return;
        }

        const { title, content } = req.body;
        const updates: Record<string, unknown> = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (title) updates.title = title;
        if (content) updates.content = content;

        await db.collection("blogs").doc(blogId).update(updates);
        res.json({ message: "Blog updated successfully" });
      } else if (req.method === "DELETE") {
        const blogId = req.query.id as string;
        if (!blogId) {
          res.status(400).json({ error: "Blog ID is required" });
          return;
        }

        await db.collection("blogs").doc(blogId).delete();
        res.json({ message: "Blog deleted successfully" });
      } else {
        res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      console.error("Error in blogs API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Health check endpoint
 */
export const health = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      region: "asia-southeast1",
    });
  }
);
