"use client";

import { HostingDomain } from "@/types/hosting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";

interface DomainsCardProps {
  domains: HostingDomain[];
}

export function DomainsCard({ domains }: DomainsCardProps) {
  const getStatusIcon = (status: HostingDomain["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "REQUIRES_VERIFICATION":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: HostingDomain["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "REQUIRES_VERIFICATION":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="h-3 w-3" />
            Requires Verification
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Connected Domains
            </CardTitle>
            <CardDescription>Manage domains connected to your hosting site</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Domain
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Globe className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-medium text-slate-900 dark:text-white">No custom domains</h3>
            <p className="mt-1 text-sm text-slate-500">Add a custom domain to your hosting site</p>
            <Button className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Domain
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  {getStatusIcon(domain.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://${domain.domainName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                    >
                      {domain.domainName}
                    </a>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {domain.provisioning && (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-green-500" />
                          SSL Active
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3 text-green-500" />
                          DNS Active
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {getStatusBadge(domain.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
