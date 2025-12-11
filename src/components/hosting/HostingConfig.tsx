"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Copy, Check, FileCode, Server, GitBranch } from "lucide-react";
import { useState } from "react";

export function HostingConfigCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const configSnippets = {
    firebase: `{
  "hosting": {
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}`,
    next: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig`,
    deploy: `# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting`,
  };

  const handleCopy = async (key: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-500" />
          Configuration Guide
        </CardTitle>
        <CardDescription>
          Setup instructions for deploying Next.js to Firebase Hosting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Server className="h-5 w-5" />
              <span className="font-medium">SSR Support</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Server-side rendering via Cloud Functions
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <FileCode className="h-5 w-5" />
              <span className="font-medium">Static Generation</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Pre-built pages served from CDN
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <GitBranch className="h-5 w-5" />
              <span className="font-medium">Preview Channels</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Test changes before going live
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-slate-900 dark:text-white">firebase.json</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("firebase", configSnippets.firebase)}
              >
                {copied === "firebase" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              <code>{configSnippets.firebase}</code>
            </pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-slate-900 dark:text-white">next.config.js (for SSR)</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("next", configSnippets.next)}
              >
                {copied === "next" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              <code>{configSnippets.next}</code>
            </pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-slate-900 dark:text-white">Deploy Commands</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("deploy", configSnippets.deploy)}
              >
                {copied === "deploy" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              <code>{configSnippets.deploy}</code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
