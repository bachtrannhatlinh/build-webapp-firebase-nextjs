"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AppCheck } from "firebase/app-check";
import { initializeAppCheckService, enableDebugMode } from "@/lib/appCheck";

interface AppCheckContextType {
  appCheck: AppCheck | null;
  isInitialized: boolean;
  isDebugMode: boolean;
}

const AppCheckContext = createContext<AppCheckContextType>({
  appCheck: null,
  isInitialized: false,
  isDebugMode: false,
});

export const useAppCheck = () => {
  const context = useContext(AppCheckContext);
  if (!context) {
    throw new Error("useAppCheck must be used within an AppCheckProvider");
  }
  return context;
};

interface AppCheckProviderProps {
  children: ReactNode;
  enableDebug?: boolean;
}

export const AppCheckProvider: React.FC<AppCheckProviderProps> = ({
  children,
  enableDebug = process.env.NODE_ENV === "development",
}) => {
  const [appCheck, setAppCheck] = useState<AppCheck | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (enableDebug) {
      enableDebugMode();
    }

    const instance = initializeAppCheckService();
    setAppCheck(instance);
    setIsInitialized(true);
  }, [enableDebug]);

  return (
    <AppCheckContext.Provider
      value={{
        appCheck,
        isInitialized,
        isDebugMode: enableDebug,
      }}
    >
      {children}
    </AppCheckContext.Provider>
  );
};
