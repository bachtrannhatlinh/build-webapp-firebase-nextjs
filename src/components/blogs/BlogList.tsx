"use client";

import { Blog } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export function BlogList({ blogs, onEdit, onDelete }: BlogListProps) {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
