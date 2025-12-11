"use client";

import { useState, useCallback } from "react";
import { HostingRelease, DeploymentStatus, HostingDomain, HostingSite } from "@/types/hosting";

const mockReleases: HostingRelease[] = [
  {
    id: "release-1",
    version: "v1.0.3",
    status: "FINALIZED",
    createTime: new Date("2024-12-10T10:30:00"),
    finalizeTime: new Date("2024-12-10T10:32:00"),
    message: "Deploy production build with new features",
    type: "DEPLOY",
  },
  {
    id: "release-2",
    version: "v1.0.2",
    status: "FINALIZED",
    createTime: new Date("2024-12-09T14:20:00"),
    finalizeTime: new Date("2024-12-09T14:22:00"),
    message: "Bug fixes and performance improvements",
    type: "DEPLOY",
  },
  {
    id: "release-3",
    version: "v1.0.1",
    status: "FINALIZED",
    createTime: new Date("2024-12-08T09:15:00"),
    finalizeTime: new Date("2024-12-08T09:18:00"),
    message: "Initial deployment",
    type: "DEPLOY",
  },
];

const mockDomains: HostingDomain[] = [
  {
    id: "domain-1",
    domainName: "myapp.web.app",
    status: "ACTIVE",
    updateTime: new Date("2024-12-01"),
    provisioning: {
      certStatus: "CERT_ACTIVE",
      dnsStatus: "DNS_ACTIVE",
    },
  },
  {
    id: "domain-2",
    domainName: "myapp.firebaseapp.com",
    status: "ACTIVE",
    updateTime: new Date("2024-12-01"),
    provisioning: {
      certStatus: "CERT_ACTIVE",
      dnsStatus: "DNS_ACTIVE",
    },
  },
];

const mockSite: HostingSite = {
  id: "site-1",
  name: "build-webapp-firebase-nextjs",
  defaultUrl: "https://build-webapp-firebase-nextjs.web.app",
  type: "DEFAULT_SITE",
};

export function useHosting() {
  const [releases, setReleases] = useState<HostingRelease[]>(mockReleases);
  const [domains] = useState<HostingDomain[]>(mockDomains);
  const [site] = useState<HostingSite>(mockSite);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: "idle",
    message: "Ready to deploy",
  });
  const [loading, setLoading] = useState(false);

  const deploy = useCallback(async (message?: string) => {
    setLoading(true);
    setDeploymentStatus({ status: "building", message: "Building Next.js application...", progress: 0 });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDeploymentStatus({ status: "building", message: "Optimizing for production...", progress: 30 });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDeploymentStatus({ status: "deploying", message: "Uploading to Firebase Hosting...", progress: 60 });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDeploymentStatus({ status: "deploying", message: "Finalizing deployment...", progress: 90 });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRelease: HostingRelease = {
      id: `release-${Date.now()}`,
      version: `v1.0.${releases.length + 1}`,
      status: "FINALIZED",
      createTime: new Date(),
      finalizeTime: new Date(),
      message: message || "New deployment",
      type: "DEPLOY",
    };

    setReleases((prev) => [newRelease, ...prev]);
    setDeploymentStatus({ status: "success", message: "Deployment successful!", progress: 100 });
    setLoading(false);

    setTimeout(() => {
      setDeploymentStatus({ status: "idle", message: "Ready to deploy" });
    }, 3000);
  }, [releases.length]);

  const rollback = useCallback(async (releaseId: string) => {
    setLoading(true);
    setDeploymentStatus({ status: "deploying", message: "Rolling back to previous version...", progress: 50 });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const targetRelease = releases.find((r) => r.id === releaseId);
    if (targetRelease) {
      const newRelease: HostingRelease = {
        id: `release-${Date.now()}`,
        version: `${targetRelease.version}-rollback`,
        status: "FINALIZED",
        createTime: new Date(),
        finalizeTime: new Date(),
        message: `Rollback to ${targetRelease.version}`,
        type: "ROLLBACK",
      };
      setReleases((prev) => [newRelease, ...prev]);
    }

    setDeploymentStatus({ status: "success", message: "Rollback completed!", progress: 100 });
    setLoading(false);

    setTimeout(() => {
      setDeploymentStatus({ status: "idle", message: "Ready to deploy" });
    }, 3000);
  }, [releases]);

  return {
    releases,
    domains,
    site,
    deploymentStatus,
    loading,
    deploy,
    rollback,
  };
}
