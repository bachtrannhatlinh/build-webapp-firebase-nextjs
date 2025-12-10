"use client";

import { useState } from "react";
import { FileInfo, formatFileSize, deleteFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileGalleryProps {
  files: FileInfo[];
  loading?: boolean;
  onDelete?: (file: FileInfo) => void;
  onSelect?: (file: FileInfo) => void;
  selectable?: boolean;
}

export function FileGallery({
  files,
  loading,
  onDelete,
  onSelect,
  selectable = false,
}: FileGalleryProps) {
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Delete "${file.name}"?`)) return;

    setDeletingPath(file.path);
    try {
      await deleteFile(file.path);
      onDelete?.(file);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingPath(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return (
        <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.startsWith("video/")) {
      return (
        <svg className="h-12 w-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.includes("pdf")) {
      return (
        <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
        <svg
          className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-slate-500 dark:text-slate-400">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {files.map((file) => (
          <div
            key={file.path}
            className={`
              group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all
              dark:border-slate-700 dark:bg-slate-800
              ${selectable ? "cursor-pointer hover:ring-2 hover:ring-blue-500" : ""}
              ${deletingPath === file.path ? "opacity-50" : ""}
            `}
            onClick={() => selectable && onSelect?.(file)}
          >
            {/* Preview */}
            <div className="aspect-square">
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-full w-full object-cover"
                  onClick={(e) => {
                    if (!selectable) {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }
                  }}
                />
              ) : file.type.startsWith("video/") ? (
                <video
                  src={file.url}
                  className="h-full w-full object-cover"
                  onClick={(e) => {
                    if (!selectable) {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="w-full p-3">
                <p className="truncate text-sm font-medium text-white">
                  {file.name}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 rounded-lg p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.url, "_blank");
                }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  disabled={deletingPath === file.path}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewFile?.type.startsWith("image/") && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-h-[70vh] rounded-lg object-contain"
              />
            )}
            {previewFile?.type.startsWith("video/") && (
              <video
                src={previewFile.url}
                controls
                className="max-h-[70vh] rounded-lg"
              />
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{previewFile && formatFileSize(previewFile.size)}</span>
            <span>{previewFile?.createdAt.toLocaleDateString()}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
