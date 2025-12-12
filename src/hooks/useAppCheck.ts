"use client";

import { useState, useEffect, useCallback } from "react";
import { getAppCheckToken, initializeAppCheckService } from "@/lib/appCheck";
import type { AppCheck } from "firebase/app-check";

interface AppCheckStatus {
  isInitialized: boolean;
  isTokenValid: boolean;
  lastTokenRefresh: Date | null;
  error: string | null;
}

interface UseAppCheckReturn {
  status: AppCheckStatus;
  appCheck: AppCheck | null;
  refreshToken: () => Promise<string | null>;
  verifyProtection: () => Promise<boolean>;
}

export const useAppCheckStatus = (): UseAppCheckReturn => {
  const [appCheck, setAppCheck] = useState<AppCheck | null>(null);
  const [status, setStatus] = useState<AppCheckStatus>({
    isInitialized: false,
    isTokenValid: false,
    lastTokenRefresh: null,
    error: null,
  });

  useEffect(() => {
    const instance = initializeAppCheckService();
    setAppCheck(instance);
    
    if (instance) {
      setStatus(prev => ({
        ...prev,
        isInitialized: true,
      }));
    } else {
      setStatus(prev => ({
        ...prev,
        isInitialized: false,
        error: "App Check not configured. Add NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY to .env",
      }));
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAppCheckToken();
      if (token) {
        setStatus(prev => ({
          ...prev,
          isTokenValid: true,
          lastTokenRefresh: new Date(),
          error: null,
        }));
        return token;
      } else {
        setStatus(prev => ({
          ...prev,
          isTokenValid: false,
          error: "Failed to get App Check token",
        }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(prev => ({
        ...prev,
        isTokenValid: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const verifyProtection = useCallback(async (): Promise<boolean> => {
    const token = await refreshToken();
    return token !== null;
  }, [refreshToken]);

  return {
    status,
    appCheck,
    refreshToken,
    verifyProtection,
  };
};
