/**
 * Cloud Functions Client Utilities
 * Dùng để gọi các Cloud Functions từ frontend
 */

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || 
  `https://asia-southeast1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function callFunction<T>(
  functionName: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return { error: "Network error" };
  }
}

// ============================================
// API Client Methods
// ============================================

export const functionsApi = {
  // Health check
  health: () => callFunction<{ status: string; timestamp: string }>("health"),

  // Users API
  users: {
    getAll: () => callFunction<{ users: unknown[] }>("users"),
    
    getById: (id: string) => 
      callFunction<{ id: string }>(`users?id=${id}`),
    
    create: (data: { email: string; displayName?: string }) =>
      callFunction<{ id: string }>("users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Blogs API
  blogs: {
    getAll: (limit = 20) => 
      callFunction<{ blogs: unknown[] }>(`blogs?limit=${limit}`),
    
    getById: (id: string) => 
      callFunction<{ id: string }>(`blogs?id=${id}`),
    
    create: (data: { title: string; content: string; authorId?: string }) =>
      callFunction<{ id: string }>("blogs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: { title?: string; content?: string }) =>
      callFunction<{ message: string }>(`blogs?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      callFunction<{ message: string }>(`blogs?id=${id}`, {
        method: "DELETE",
      }),
  },
};

export default functionsApi;
