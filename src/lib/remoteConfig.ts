import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  getBoolean,
  getString,
  getNumber,
  getAll,
  isSupported,
  RemoteConfig,
} from 'firebase/remote-config';
import app from './firebase';
import {
  FeatureFlags,
  DynamicConfig,
  ABTestConfig,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_DYNAMIC_CONFIG,
} from '@/types/remoteConfig';

let remoteConfig: RemoteConfig | null = null;

export async function initRemoteConfig(): Promise<RemoteConfig | null> {
  if (typeof window === 'undefined') return null;
  
  const supported = await isSupported();
  if (!supported) {
    console.warn('Remote Config is not supported in this environment');
    return null;
  }

  if (remoteConfig) return remoteConfig;

  remoteConfig = getRemoteConfig(app);
  
  // Settings
  remoteConfig.settings.minimumFetchIntervalMillis = 
    process.env.NODE_ENV === 'development' ? 0 : 3600000; // 0 for dev, 1 hour for prod
  remoteConfig.settings.fetchTimeoutMillis = 60000;

  // Set default values
  remoteConfig.defaultConfig = {
    // Feature flags
    enableNewUI: DEFAULT_FEATURE_FLAGS.enableNewUI,
    enableDarkMode: DEFAULT_FEATURE_FLAGS.enableDarkMode,
    enableBetaFeatures: DEFAULT_FEATURE_FLAGS.enableBetaFeatures,
    enableMaintenanceMode: DEFAULT_FEATURE_FLAGS.enableMaintenanceMode,
    enableNotifications: DEFAULT_FEATURE_FLAGS.enableNotifications,
    buttonVariant: DEFAULT_FEATURE_FLAGS.buttonVariant,
    layoutVariant: DEFAULT_FEATURE_FLAGS.layoutVariant,
    pricingTier: DEFAULT_FEATURE_FLAGS.pricingTier,
    
    // Dynamic config
    appName: DEFAULT_DYNAMIC_CONFIG.appName,
    welcomeMessage: DEFAULT_DYNAMIC_CONFIG.welcomeMessage,
    supportEmail: DEFAULT_DYNAMIC_CONFIG.supportEmail,
    maxUploadSize: DEFAULT_DYNAMIC_CONFIG.maxUploadSize,
    apiTimeout: DEFAULT_DYNAMIC_CONFIG.apiTimeout,
    maxRetries: DEFAULT_DYNAMIC_CONFIG.maxRetries,
    primaryColor: DEFAULT_DYNAMIC_CONFIG.primaryColor,
    secondaryColor: DEFAULT_DYNAMIC_CONFIG.secondaryColor,
    logoUrl: DEFAULT_DYNAMIC_CONFIG.logoUrl,
    maxItemsPerPage: DEFAULT_DYNAMIC_CONFIG.maxItemsPerPage,
    sessionTimeout: DEFAULT_DYNAMIC_CONFIG.sessionTimeout,
    
    // A/B Test configs (JSON strings)
    abtest_homepage: JSON.stringify({
      experimentId: 'homepage_v1',
      experimentName: 'Homepage Layout Test',
      variant: 'control',
      isControl: true,
    }),
  };

  return remoteConfig;
}

export async function fetchRemoteConfig(): Promise<boolean> {
  if (!remoteConfig) {
    await initRemoteConfig();
  }
  
  if (!remoteConfig) return false;

  try {
    const activated = await fetchAndActivate(remoteConfig);
    console.log('Remote Config fetched and activated:', activated);
    return activated;
  } catch (error) {
    console.error('Error fetching Remote Config:', error);
    return false;
  }
}

export function getFeatureFlag<K extends keyof FeatureFlags>(
  key: K
): FeatureFlags[K] {
  if (!remoteConfig) {
    return DEFAULT_FEATURE_FLAGS[key];
  }

  const booleanKeys: (keyof FeatureFlags)[] = [
    'enableNewUI',
    'enableDarkMode',
    'enableBetaFeatures',
    'enableMaintenanceMode',
    'enableNotifications',
  ];

  if (booleanKeys.includes(key)) {
    return getBoolean(remoteConfig, key) as FeatureFlags[K];
  }

  return getString(remoteConfig, key) as FeatureFlags[K];
}

export function getAllFeatureFlags(): FeatureFlags {
  return {
    enableNewUI: getFeatureFlag('enableNewUI'),
    enableDarkMode: getFeatureFlag('enableDarkMode'),
    enableBetaFeatures: getFeatureFlag('enableBetaFeatures'),
    enableMaintenanceMode: getFeatureFlag('enableMaintenanceMode'),
    enableNotifications: getFeatureFlag('enableNotifications'),
    buttonVariant: getFeatureFlag('buttonVariant'),
    layoutVariant: getFeatureFlag('layoutVariant'),
    pricingTier: getFeatureFlag('pricingTier'),
  };
}

export function getDynamicConfigValue<K extends keyof DynamicConfig>(
  key: K
): DynamicConfig[K] {
  if (!remoteConfig) {
    return DEFAULT_DYNAMIC_CONFIG[key];
  }

  const numberKeys: (keyof DynamicConfig)[] = [
    'maxUploadSize',
    'apiTimeout',
    'maxRetries',
    'maxItemsPerPage',
    'sessionTimeout',
  ];

  if (numberKeys.includes(key)) {
    return getNumber(remoteConfig, key) as DynamicConfig[K];
  }

  return getString(remoteConfig, key) as DynamicConfig[K];
}

export function getAllDynamicConfig(): DynamicConfig {
  return {
    appName: getDynamicConfigValue('appName'),
    welcomeMessage: getDynamicConfigValue('welcomeMessage'),
    supportEmail: getDynamicConfigValue('supportEmail'),
    maxUploadSize: getDynamicConfigValue('maxUploadSize'),
    apiTimeout: getDynamicConfigValue('apiTimeout'),
    maxRetries: getDynamicConfigValue('maxRetries'),
    primaryColor: getDynamicConfigValue('primaryColor'),
    secondaryColor: getDynamicConfigValue('secondaryColor'),
    logoUrl: getDynamicConfigValue('logoUrl'),
    maxItemsPerPage: getDynamicConfigValue('maxItemsPerPage'),
    sessionTimeout: getDynamicConfigValue('sessionTimeout'),
  };
}

export function getABTestConfig(experimentKey: string): ABTestConfig | null {
  if (!remoteConfig) return null;

  try {
    const value = getString(remoteConfig, `abtest_${experimentKey}`);
    if (!value) return null;
    return JSON.parse(value) as ABTestConfig;
  } catch (error) {
    console.error(`Error parsing A/B test config for ${experimentKey}:`, error);
    return null;
  }
}

export function getAllABTests(): Record<string, ABTestConfig> {
  if (!remoteConfig) return {};

  const allConfigs = getAll(remoteConfig);
  const abTests: Record<string, ABTestConfig> = {};

  Object.keys(allConfigs).forEach((key) => {
    if (key.startsWith('abtest_')) {
      const experimentKey = key.replace('abtest_', '');
      const config = getABTestConfig(experimentKey);
      if (config) {
        abTests[experimentKey] = config;
      }
    }
  });

  return abTests;
}

export function isInVariant(experimentKey: string, variant: string): boolean {
  const config = getABTestConfig(experimentKey);
  return config?.variant === variant;
}

export function getRemoteConfigInstance(): RemoteConfig | null {
  return remoteConfig;
}

export function getAllRemoteConfigValues(): Record<string, string> {
  if (!remoteConfig) return {};
  
  const allValues = getAll(remoteConfig);
  const result: Record<string, string> = {};
  
  Object.entries(allValues).forEach(([key, value]) => {
    result[key] = value.asString();
  });
  
  return result;
}
