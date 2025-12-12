"use client";

import React, { useState } from "react";
import { Shield, ShieldCheck, ShieldX, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppCheckStatus } from "@/hooks/useAppCheck";

export const AppCheckStatus: React.FC = () => {
  const { status, refreshToken, verifyProtection } = useAppCheckStatus();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyProtection();
      setVerificationResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefresh = async () => {
    await refreshToken();
  };

  const getStatusIcon = () => {
    if (!status.isInitialized) {
      return <ShieldX className="w-8 h-8 text-red-500" />;
    }
    if (status.isTokenValid) {
      return <ShieldCheck className="w-8 h-8 text-green-500" />;
    }
    return <Shield className="w-8 h-8 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!status.isInitialized) {
      return "Not Initialized";
    }
    if (status.isTokenValid) {
      return "Protected";
    }
    return "Pending Verification";
  };

  const getStatusColor = () => {
    if (!status.isInitialized) return "text-red-600";
    if (status.isTokenValid) return "text-green-600";
    return "text-yellow-600";
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          App Check Status
        </h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <span className="text-sm text-slate-600 dark:text-slate-300">Status</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <span className="text-sm text-slate-600 dark:text-slate-300">Initialized</span>
          <span className={status.isInitialized ? "text-green-600" : "text-red-600"}>
            {status.isInitialized ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <span className="text-sm text-slate-600 dark:text-slate-300">Token Valid</span>
          <span className={status.isTokenValid ? "text-green-600" : "text-yellow-600"}>
            {status.isTokenValid ? "Yes" : "Not Verified"}
          </span>
        </div>

        {status.lastTokenRefresh && (
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-300">Last Refresh</span>
            <span className="text-slate-900 dark:text-white">
              {status.lastTokenRefresh.toLocaleTimeString()}
            </span>
          </div>
        )}

        {status.error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-400">Error</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{status.error}</p>
            </div>
          </div>
        )}

        {verificationResult !== null && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            verificationResult 
              ? "bg-green-50 dark:bg-green-900/20" 
              : "bg-red-50 dark:bg-red-900/20"
          }`}>
            {verificationResult ? (
              <ShieldCheck className="w-5 h-5 text-green-500" />
            ) : (
              <ShieldX className="w-5 h-5 text-red-500" />
            )}
            <span className={verificationResult ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
              {verificationResult 
                ? "Verification successful! Your app is protected." 
                : "Verification failed. Check your configuration."}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !status.isInitialized}
            className="flex-1"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 mr-2" />
            )}
            Verify Protection
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={!status.isInitialized}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
