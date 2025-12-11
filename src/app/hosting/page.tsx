"use client";

import { useHosting } from "@/hooks/useHosting";
import { Header, Footer } from "@/components/layout";
import {
  DeploymentCard,
  ReleasesTable,
  DomainsCard,
  HostingConfigCard,
} from "@/components/hosting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, History, Globe, Settings } from "lucide-react";

export default function HostingPage() {
  const { releases, domains, site, deploymentStatus, loading, deploy, rollback } = useHosting();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Firebase Hosting
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Deploy and manage your Next.js web application with Firebase Hosting
          </p>
        </div>

        <Tabs defaultValue="deploy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Deploy</span>
            </TabsTrigger>
            <TabsTrigger value="releases" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Releases</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Domains</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-6">
            <DeploymentCard
              site={site}
              deploymentStatus={deploymentStatus}
              loading={loading}
              onDeploy={deploy}
            />
            <ReleasesTable
              releases={releases.slice(0, 3)}
              loading={loading}
              onRollback={rollback}
            />
          </TabsContent>

          <TabsContent value="releases">
            <ReleasesTable releases={releases} loading={loading} onRollback={rollback} />
          </TabsContent>

          <TabsContent value="domains">
            <DomainsCard domains={domains} />
          </TabsContent>

          <TabsContent value="config">
            <HostingConfigCard />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
