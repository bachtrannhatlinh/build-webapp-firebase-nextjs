import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

// Types
export interface FileInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: "running" | "paused" | "success" | "canceled" | "error";
}

// ============ UPLOAD ============

// Simple upload (for small files)
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  return await getDownloadURL(snapshot.ref);
}

// Upload with progress tracking
export function uploadFileWithProgress(
  file: File,
  path: string,
  callbacks: {
    onProgress?: (progress: UploadProgress) => void;
    onComplete?: (url: string) => void;
    onError?: (error: Error) => void;
  }
): UploadTask {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      callbacks.onProgress?.({
        progress,
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        state: snapshot.state as UploadProgress["state"],
      });
    },
    (error) => {
      callbacks.onError?.(error);
    },
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      callbacks.onComplete?.(url);
    }
  );

  return uploadTask;
}

// Upload multiple files
export async function uploadMultipleFiles(
  files: File[],
  basePath: string,
  onFileProgress?: (index: number, progress: number) => void
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    return new Promise<string>((resolve, reject) => {
      const path = `${basePath}/${Date.now()}_${file.name}`;
      uploadFileWithProgress(file, path, {
        onProgress: (p) => onFileProgress?.(index, p.progress),
        onComplete: resolve,
        onError: reject,
      });
    });
  });

  return Promise.all(uploadPromises);
}

// ============ DOWNLOAD ============

export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

// ============ DELETE ============

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function deleteFileByURL(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}

// ============ LIST FILES ============

export async function listFiles(path: string): Promise<FileInfo[]> {
  const listRef = ref(storage, path);
  const result = await listAll(listRef);

  const filesPromises = result.items.map(async (item) => {
    const [url, metadata] = await Promise.all([
      getDownloadURL(item),
      getMetadata(item),
    ]);

    return {
      name: item.name,
      path: item.fullPath,
      url,
      size: metadata.size,
      type: metadata.contentType || "unknown",
      createdAt: new Date(metadata.timeCreated),
    };
  });

  return Promise.all(filesPromises);
}

// ============ HELPERS ============

export function generateFilePath(
  userId: string,
  folder: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${folder}/${userId}/${timestamp}_${sanitizedName}`;
}

export function getFileType(file: File): "image" | "video" | "document" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type.includes("pdf") ||
    file.type.includes("document") ||
    file.type.includes("sheet") ||
    file.type.includes("presentation") ||
    file.type.includes("text")
  ) {
    return "document";
  }
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(
    (type) => file.type.includes(type) || file.name.endsWith(type)
  );
}

export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
