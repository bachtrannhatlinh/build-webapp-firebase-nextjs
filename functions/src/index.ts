import * as admin from "firebase-admin";

admin.initializeApp();

// API Endpoints
export * from "./api";

// Webhooks
export * from "./webhooks";

// Scheduled Tasks
export * from "./scheduled";

// Firestore Triggers
export * from "./triggers";
