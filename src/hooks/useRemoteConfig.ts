'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FeatureFlags,
  DynamicConfig,
  ABTestConfig,
  RemoteConfigState,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_DYNAMIC_CONFIG,
} from '@/types/remoteConfig';
import {
  initRemoteConfig,
  fetchRemoteConfig,
  getAllFeatureFlags,
  getAllDynamicConfig,
  getAllABTests,
  getFeatureFlag,
  getDynamicConfigValue,
  getABTestConfig,
  isInVariant,
} from '@/lib/remoteConfig';

export function useRemoteConfig() {
  const [state, setState] = useState<RemoteConfigState>({
    featureFlags: DEFAULT_FEATURE_FLAGS,
    dynamicConfig: DEFAULT_DYNAMIC_CONFIG,
    abTests: {},
    isLoading: true,
    isInitialized: false,
    lastFetchTime: null,
    error: null,
  });

  const initialize = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await initRemoteConfig();
      await fetchRemoteConfig();

      setState({
        featureFlags: getAllFeatureFlags(),
        dynamicConfig: getAllDynamicConfig(),
        abTests: getAllABTests(),
        isLoading: false,
        isInitialized: true,
        lastFetchTime: new Date(),
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Remote Config',
      }));
    }
  }, []);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await fetchRemoteConfig();

      setState((prev) => ({
        ...prev,
        featureFlags: getAllFeatureFlags(),
        dynamicConfig: getAllDynamicConfig(),
        abTests: getAllABTests(),
        isLoading: false,
        lastFetchTime: new Date(),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh Remote Config',
      }));
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    refresh,
    getFeatureFlag,
    getDynamicConfigValue,
    getABTestConfig,
    isInVariant,
  };
}

export function useFeatureFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
  const [value, setValue] = useState<FeatureFlags[K]>(DEFAULT_FEATURE_FLAGS[key]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAndGet = async () => {
      await initRemoteConfig();
      await fetchRemoteConfig();
      setValue(getFeatureFlag(key));
      setIsLoading(false);
    };

    initAndGet();
  }, [key]);

  return isLoading ? DEFAULT_FEATURE_FLAGS[key] : value;
}

export function useDynamicConfig<K extends keyof DynamicConfig>(key: K): DynamicConfig[K] {
  const [value, setValue] = useState<DynamicConfig[K]>(DEFAULT_DYNAMIC_CONFIG[key]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAndGet = async () => {
      await initRemoteConfig();
      await fetchRemoteConfig();
      setValue(getDynamicConfigValue(key));
      setIsLoading(false);
    };

    initAndGet();
  }, [key]);

  return isLoading ? DEFAULT_DYNAMIC_CONFIG[key] : value;
}

export function useABTest(experimentKey: string): {
  config: ABTestConfig | null;
  isInVariant: (variant: string) => boolean;
  isLoading: boolean;
} {
  const [config, setConfig] = useState<ABTestConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAndGet = async () => {
      await initRemoteConfig();
      await fetchRemoteConfig();
      setConfig(getABTestConfig(experimentKey));
      setIsLoading(false);
    };

    initAndGet();
  }, [experimentKey]);

  return {
    config,
    isInVariant: (variant: string) => config?.variant === variant,
    isLoading,
  };
}
