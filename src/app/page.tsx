"use client";

import { useState, useCallback } from "react";
import { useBlogs } from "@/hooks/useBlogs";
import { Blog } from "@/types/blog";
import {
  BlogList,
  BlogFormDialog,
  DeleteConfirmDialog,
  EmptyState,
} from "@/components/blogs";
import { Header, Footer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const {
    blogs,
    loading,
    error,
    createBlogItem,
    updateBlogItem,
    deleteBlogItem,
  } = useBlogs();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = useCallback(
    async (data: Omit<Blog, "id" | "createAt">) => {
      await createBlogItem(data);
    },
    [createBlogItem]
  );

  const handleUpdate = useCallback(
    async (data: Omit<Blog, "id" | "createAt">) => {
      if (editingBlog) {
        await updateBlogItem(editingBlog.id, data);
      }
    },
    [editingBlog, updateBlogItem]
  );

  const handleDelete = useCallback(async () => {
    if (deleteConfirm) {
      setDeleting(true);
      try {
        await deleteBlogItem(deleteConfirm.id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error("Error deleting blog:", error);
      } finally {
        setDeleting(false);
      }
    }
  }, [deleteConfirm, deleteBlogItem]);

  const openCreateForm = useCallback(() => {
    setEditingBlog(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((blog: Blog) => {
    console.log("Editing blog:", blog);
    setEditingBlog(blog);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingBlog(null);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header onCreateClick={openCreateForm} />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            All Blogs
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage and explore your blog posts
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-800"
              >
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <EmptyState onCreateClick={openCreateForm} />
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
              </span>
            </div>

            <BlogList
              blogs={blogs}
              onEdit={openEditForm}
              onDelete={setDeleteConfirm}
            />
          </>
        )}
      </main>

      <Footer />

      {formOpen && (
        <BlogFormDialog
          blog={editingBlog}
          open={formOpen}
          onClose={closeForm}
          onSubmit={editingBlog ? handleUpdate : handleCreate}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmDialog
          blog={deleteConfirm}
          open={!!deleteConfirm}
          loading={deleting}
          onClose={closeDeleteConfirm}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
