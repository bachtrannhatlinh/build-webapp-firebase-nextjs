"use client";

import { HostingRelease } from "@/types/hosting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Rocket, CheckCircle2, Clock, Tag } from "lucide-react";

interface ReleasesTableProps {
  releases: HostingRelease[];
  loading: boolean;
  onRollback: (releaseId: string) => Promise<void>;
}

export function ReleasesTable({ releases, loading, onRollback }: ReleasesTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTypeIcon = (type: HostingRelease["type"]) => {
    switch (type) {
      case "DEPLOY":
        return <Rocket className="h-4 w-4 text-blue-500" />;
      case "ROLLBACK":
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: HostingRelease["status"]) => {
    switch (status) {
      case "FINALIZED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Live
          </span>
        );
      case "CREATED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          Release History
        </CardTitle>
        <CardDescription>View and manage your deployment releases</CardDescription>
      </CardHeader>
      <CardContent>
        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-medium text-slate-900 dark:text-white">No releases yet</h3>
            <p className="mt-1 text-sm text-slate-500">Deploy your first version to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {releases.map((release, index) => (
              <div
                key={release.id}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  index === 0 ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  {getTypeIcon(release.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      {release.version}
                    </span>
                    {index === 0 && getStatusBadge(release.status)}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {release.message || "No description"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(release.createTime)}
                  </p>
                </div>

                {index !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRollback(release.id)}
                    disabled={loading}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Rollback
                  </Button>
                )}

                {index === 0 && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
