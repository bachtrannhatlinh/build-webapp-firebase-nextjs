"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BlogFormDialogProps {
  blog?: Blog | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Blog, "id" | "createAt">) => Promise<void>;
}

const initialFormData = {
  title: "",
  slug: "",
  info: "",
  thrilled: "",
  phoneNumber: 0,
  userId: "",
};

export function BlogFormDialog({
  blog,
  open,
  onClose,
  onSubmit,
}: BlogFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        slug: blog.slug,
        info: blog.info,
        thrilled: blog.thrilled,
        phoneNumber: blog.phoneNumber,
        userId: blog.userId,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [blog, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? Number(value) : value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">
        {/* Header với gradient */}
        <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              {blog ? (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </div>
            <div>
              <span className="font-semibold">
                {blog ? "Edit Blog" : "Create New Blog"}
              </span>
              <p className="text-sm font-normal text-white/70 mt-0.5">
                {blog
                  ? "Update your blog post details"
                  : "Fill in the details to create a new post"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <svg
                className="h-4 w-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Title
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter an engaging title..."
              className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-800"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label
              htmlFor="slug"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <svg
                className="h-4 w-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              URL Slug
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  /blog/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="your-blog-slug"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-14 pr-4 text-base transition-all focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateSlug}
                className="h-12 px-4 rounded-xl border-slate-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-all dark:border-slate-700"
              >
                <svg
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Auto
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <Label
              htmlFor="info"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <svg
                className="h-4 w-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              Description
            </Label>
            <Textarea
              id="info"
              name="info"
              value={formData.info}
              onChange={handleChange}
              placeholder="Write a brief summary of your blog post..."
              rows={3}
              className="rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base resize-none transition-all focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Thrilled */}
          <div className="space-y-2">
            <Label
              htmlFor="thrilled"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <svg
                className="h-4 w-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Additional Content
            </Label>
            <Textarea
              id="thrilled"
              name="thrilled"
              value={formData.thrilled}
              onChange={handleChange}
              placeholder="Any extra details or highlights..."
              rows={2}
              className="rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base resize-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Phone & User ID - 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <svg
                  className="h-4 w-4 text-cyan-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Phone
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="number"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                placeholder="0123456789"
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-all focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="userId"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <svg
                  className="h-4 w-4 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Author ID
              </Label>
              <Input
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="user-123"
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-11 px-6 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {blog ? (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Blog
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Blog
                    </>
                  )}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
