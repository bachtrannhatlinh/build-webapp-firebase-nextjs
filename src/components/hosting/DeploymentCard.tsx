"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeploymentStatus, HostingSite } from "@/types/hosting";
import { Rocket, Loader2, CheckCircle2, XCircle, Globe } from "lucide-react";

interface DeploymentCardProps {
  site: HostingSite;
  deploymentStatus: DeploymentStatus;
  loading: boolean;
  onDeploy: (message?: string) => Promise<void>;
}

export function DeploymentCard({ site, deploymentStatus, loading, onDeploy }: DeploymentCardProps) {
  const [message, setMessage] = useState("");

  const handleDeploy = async () => {
    await onDeploy(message || undefined);
    setMessage("");
  };

  const getStatusIcon = () => {
    switch (deploymentStatus.status) {
      case "building":
      case "deploying":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Rocket className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (deploymentStatus.status) {
      case "building":
      case "deploying":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-orange-500" />
          Deploy to Firebase Hosting
        </CardTitle>
        <CardDescription>
          Deploy your Next.js application to Firebase Hosting with SSR support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
          <Globe className="h-10 w-10 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">{site.name}</p>
            <a
              href={site.defaultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {site.defaultUrl}
            </a>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deploy-message">Deployment Message (optional)</Label>
          <Input
            id="deploy-message"
            placeholder="Enter a description for this deployment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={`flex items-center gap-3 rounded-lg border p-4 ${getStatusColor()}`}>
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">{deploymentStatus.message}</p>
            {deploymentStatus.progress !== undefined && deploymentStatus.status !== "idle" && (
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${deploymentStatus.progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleDeploy} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy Now
            </>
          )}
        </Button>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Tip:</strong> Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-800">npm run build</code> locally
            before deploying to catch any build errors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
