"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listFiles, FileInfo } from "@/lib/storage";
import { FileUpload, FileGallery } from "@/components/storage";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FilesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const fetchFiles = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userFiles = await listFiles(`uploads/${user.uid}`);
      setFiles(userFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error: any) {
      // CORS error hoặc folder chưa tồn tại - ignore
      if (error?.code === "storage/unauthorized" || error?.message?.includes("CORS")) {
        console.warn("Storage not configured or empty");
      } else {
        console.error("Error fetching files:", error);
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Tạm disable auto-fetch vì CORS chưa được config
  // Uncomment sau khi đã apply CORS config cho Storage bucket
  // useEffect(() => {
  //   if (user) {
  //     fetchFiles();
  //   }
  // }, [user, fetchFiles]);

  const handleUploadComplete = (urls: string[]) => {
    fetchFiles();
  };

  const handleDelete = (file: FileInfo) => {
    setFiles((prev) => prev.filter((f) => f.path !== file.path));
  };

  const filteredFiles = files.filter((file) => {
    if (activeTab === "all") return true;
    if (activeTab === "images") return file.type.startsWith("image/");
    if (activeTab === "videos") return file.type.startsWith("video/");
    if (activeTab === "documents") {
      return (
        file.type.includes("pdf") ||
        file.type.includes("document") ||
        file.type.includes("text")
      );
    }
    return true;
  });

  const stats = {
    total: files.length,
    images: files.filter((f) => f.type.startsWith("image/")).length,
    videos: files.filter((f) => f.type.startsWith("video/")).length,
    documents: files.filter(
      (f) =>
        f.type.includes("pdf") ||
        f.type.includes("document") ||
        f.type.includes("text")
    ).length,
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            My Files
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Upload and manage your files
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-slate-500">Total Files</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stats.images}
                </p>
                <p className="text-sm text-slate-500">Images</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <svg
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stats.videos}
                </p>
                <p className="text-sm text-slate-500">Videos</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stats.documents}
                </p>
                <p className="text-sm text-slate-500">Documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
            Upload Files
          </h2>
          <FileUpload
            folder="uploads"
            maxSizeMB={50}
            onUploadComplete={handleUploadComplete}
            onUploadError={(error) => console.error(error)}
          />
        </div>

        {/* Files Gallery */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Your Files
              </h2>
              <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="images">Images ({stats.images})</TabsTrigger>
                <TabsTrigger value="videos">Videos ({stats.videos})</TabsTrigger>
                <TabsTrigger value="documents">Docs ({stats.documents})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <FileGallery
                files={filteredFiles}
                loading={loading}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
