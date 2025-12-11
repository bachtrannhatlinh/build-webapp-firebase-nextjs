"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, initAnalytics, setAnalyticsUserId } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

function UserTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setAnalyticsUserId(user.uid);
    } else {
      setAnalyticsUserId(null);
    }
  }, [user]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
      <UserTracker />
      {children}
    </>
  );
}
