"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackFormSubmit,
  trackSearch,
  trackError,
  trackUserAction,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  initAnalytics,
} from "@/lib/analytics";

export const usePageTracking = () => {
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
};

export const useInitAnalytics = () => {
  useEffect(() => {
    initAnalytics();
  }, []);
};

export const useEventTracking = () => {
  const trackCustomEvent = useCallback(
    (eventName: string, params?: Record<string, string | number | boolean>) => {
      trackEvent(eventName, params);
    },
    []
  );

  const trackClick = useCallback((buttonName: string, location?: string) => {
    trackButtonClick(buttonName, location);
  }, []);

  const trackForm = useCallback((formName: string, success: boolean) => {
    trackFormSubmit(formName, success);
  }, []);

  const trackSearchQuery = useCallback((term: string, resultsCount?: number) => {
    trackSearch(term, resultsCount);
  }, []);

  const trackErrorEvent = useCallback((message: string, code?: string) => {
    trackError(message, code);
  }, []);

  const trackAction = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      trackUserAction(action, category, label, value);
    },
    []
  );

  return {
    trackCustomEvent,
    trackClick,
    trackForm,
    trackSearchQuery,
    trackErrorEvent,
    trackAction,
  };
};

export const useUserTracking = () => {
  const setUserId = useCallback((userId: string | null) => {
    setAnalyticsUserId(userId);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, string>) => {
    setAnalyticsUserProperties(properties);
  }, []);

  return {
    setUserId,
    setUserProperties,
  };
};
