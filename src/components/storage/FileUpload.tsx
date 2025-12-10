"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  uploadFileWithProgress,
  generateFilePath,
  formatFileSize,
  getFileType,
  isValidFileSize,
  UploadProgress,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

export function FileUpload({
  folder = "uploads",
  maxSizeMB = 10,
  acceptedTypes = ["image/*", "video/*", "application/pdf"],
  multiple = true,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [user]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [user]
  );

  const handleFiles = async (files: File[]) => {
    if (!user) {
      onUploadError?.("Please login to upload files");
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!isValidFileSize(file, maxSizeMB)) {
        onUploadError?.(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading",
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Upload files
    const completedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const path = generateFilePath(user.uid, folder, file.name);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadFileWithProgress(file, path, {
            onProgress: (progress) => {
              setUploadingFiles((prev) =>
                prev.map((uf) =>
                  uf.file === file
                    ? { ...uf, progress: progress.progress }
                    : uf
                )
              );
            },
            onComplete: (url) => {
              completedUrls.push(url);
              setUploadingFiles((prev) =>
                prev.map((uf) =>
                  uf.file === file
                    ? { ...uf, status: "completed", url, progress: 100 }
                    : uf
                )
              );
              resolve();
            },
            onError: (error) => {
              setUploadingFiles((prev) =>
                prev.map((uf) =>
                  uf.file === file
                    ? { ...uf, status: "error", error: error.message }
                    : uf
                )
              );
              reject(error);
            },
          });
        });
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    if (completedUrls.length > 0) {
      onUploadComplete?.(completedUrls);
    }
  };

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case "image":
        return (
          <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "video":
        return (
          <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "document":
        return (
          <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`mb-4 rounded-full p-4 ${
              isDragging
                ? "bg-blue-100 dark:bg-blue-900/40"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <svg
              className={`h-8 w-8 ${
                isDragging ? "text-blue-500" : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-200">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            or click to browse
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Max file size: {maxSizeMB}MB • Supported: Images, Videos, PDF
          </p>
        </div>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 dark:text-slate-200">
            Uploading Files
          </h4>
          {uploadingFiles.map((uf, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              {/* File Icon / Preview */}
              <div className="flex-shrink-0">
                {uf.file.type.startsWith("image/") && uf.status === "completed" && uf.url ? (
                  <img
                    src={uf.url}
                    alt={uf.file.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  getFileIcon(uf.file)
                )}
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-700 dark:text-slate-200">
                  {uf.file.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(uf.file.size)}
                </p>

                {/* Progress Bar */}
                {uf.status === "uploading" && (
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${uf.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {Math.round(uf.progress)}%
                    </p>
                  </div>
                )}

                {/* Status */}
                {uf.status === "completed" && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    ✓ Upload complete
                  </p>
                )}
                {uf.status === "error" && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    ✗ {uf.error}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(uf.file)}
                className="flex-shrink-0 text-slate-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
