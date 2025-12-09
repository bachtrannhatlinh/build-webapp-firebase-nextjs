"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "@/lib/blogs";
import { Blog } from "@/types/blog";

interface UseBlogsReturn {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  createBlogItem: (data: Omit<Blog, "id" | "createAt">) => Promise<void>;
  updateBlogItem: (
    id: string,
    data: Partial<Omit<Blog, "id">>
  ) => Promise<void>;
  deleteBlogItem: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBlogs(): UseBlogsReturn {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogs();
      if (isMountedRef.current) {
        setBlogs(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch blogs");
        console.error("Error fetching blogs:", err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchBlogs();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchBlogs]);

  const createBlogItem = useCallback(
    async (data: Omit<Blog, "id" | "createAt">) => {
      const newId = await createBlog(data);
      const newBlog: Blog = {
        ...data,
        id: newId,
        createAt: Date.now(),
      };
      setBlogs((prev) => [...prev, newBlog]);
    },
    []
  );

  const updateBlogItem = useCallback(
    async (id: string, data: Partial<Omit<Blog, "id">>) => {
      await updateBlog(id, data);
      setBlogs((prev) =>
        prev.map((blog) => (blog.id === id ? { ...blog, ...data } : blog))
      );
    },
    []
  );

  const deleteBlogItem = useCallback(async (id: string) => {
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((blog) => blog.id !== id));
  }, []);

  const refetch = useCallback(async () => {
    fetchedRef.current = false;
    await fetchBlogs();
    fetchedRef.current = true;
  }, [fetchBlogs]);

  return {
    blogs,
    loading,
    error,
    createBlogItem,
    updateBlogItem,
    deleteBlogItem,
    refetch,
  };
}
