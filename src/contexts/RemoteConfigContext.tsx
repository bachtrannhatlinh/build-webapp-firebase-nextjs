'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  FeatureFlags,
  DynamicConfig,
  ABTestConfig,
  RemoteConfigState,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_DYNAMIC_CONFIG,
} from '@/types/remoteConfig';
import { useRemoteConfig } from '@/hooks/useRemoteConfig';

interface RemoteConfigContextType extends RemoteConfigState {
  refresh: () => Promise<void>;
  getFeatureFlag: <K extends keyof FeatureFlags>(key: K) => FeatureFlags[K];
  getDynamicConfigValue: <K extends keyof DynamicConfig>(key: K) => DynamicConfig[K];
  getABTestConfig: (experimentKey: string) => ABTestConfig | null;
  isInVariant: (experimentKey: string, variant: string) => boolean;
}

const RemoteConfigContext = createContext<RemoteConfigContextType | null>(null);

interface RemoteConfigProviderProps {
  children: ReactNode;
}

export function RemoteConfigProvider({ children }: RemoteConfigProviderProps) {
  const remoteConfig = useRemoteConfig();

  return (
    <RemoteConfigContext.Provider value={remoteConfig}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

export function useRemoteConfigContext(): RemoteConfigContextType {
  const context = useContext(RemoteConfigContext);
  
  if (!context) {
    throw new Error('useRemoteConfigContext must be used within a RemoteConfigProvider');
  }
  
  return context;
}

// HOC for feature flag gating
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  flagKey: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { featureFlags, isLoading } = useRemoteConfigContext();
    
    if (isLoading) {
      return <div className="animate-pulse">Loading...</div>;
    }
    
    const flagValue = featureFlags[flagKey];
    
    if (typeof flagValue === 'boolean' && !flagValue) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Component for conditional rendering based on feature flag
interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { featureFlags, isLoading } = useRemoteConfigContext();
  
  if (isLoading) {
    return <div className="animate-pulse h-8 bg-muted rounded" />;
  }
  
  const flagValue = featureFlags[flag];
  
  if (typeof flagValue === 'boolean' && !flagValue) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Component for A/B test variants
interface ABTestVariantProps {
  experimentKey: string;
  variant: string;
  children: ReactNode;
}

export function ABTestVariant({ experimentKey, variant, children }: ABTestVariantProps) {
  const { isInVariant, isLoading } = useRemoteConfigContext();
  
  if (isLoading) {
    return <div className="animate-pulse h-8 bg-muted rounded" />;
  }
  
  if (!isInVariant(experimentKey, variant)) {
    return null;
  }
  
  return <>{children}</>;
}

// Utility hook to get specific config with type safety
export function useConfig() {
  const context = useRemoteConfigContext();
  
  return {
    // Feature flags shortcuts
    isNewUIEnabled: context.featureFlags.enableNewUI,
    isDarkModeEnabled: context.featureFlags.enableDarkMode,
    isBetaEnabled: context.featureFlags.enableBetaFeatures,
    isMaintenanceMode: context.featureFlags.enableMaintenanceMode,
    isNotificationsEnabled: context.featureFlags.enableNotifications,
    
    // Variants
    buttonVariant: context.featureFlags.buttonVariant,
    layoutVariant: context.featureFlags.layoutVariant,
    pricingTier: context.featureFlags.pricingTier,
    
    // Dynamic config
    appName: context.dynamicConfig.appName,
    welcomeMessage: context.dynamicConfig.welcomeMessage,
    primaryColor: context.dynamicConfig.primaryColor,
    
    // State
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    refresh: context.refresh,
  };
}
