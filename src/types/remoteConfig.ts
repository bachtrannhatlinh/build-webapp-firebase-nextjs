// Remote Config Types

export interface FeatureFlags {
  // Feature toggles
  enableNewUI: boolean;
  enableDarkMode: boolean;
  enableBetaFeatures: boolean;
  enableMaintenanceMode: boolean;
  enableNotifications: boolean;
  
  // A/B Testing variants
  buttonVariant: 'primary' | 'secondary' | 'gradient';
  layoutVariant: 'classic' | 'modern' | 'minimal';
  pricingTier: 'basic' | 'premium' | 'enterprise';
}

export interface DynamicConfig {
  // App settings
  appName: string;
  welcomeMessage: string;
  supportEmail: string;
  maxUploadSize: number;
  
  // API settings
  apiTimeout: number;
  maxRetries: number;
  
  // UI settings
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  
  // Limits
  maxItemsPerPage: number;
  sessionTimeout: number;
}

export interface ABTestConfig {
  experimentId: string;
  experimentName: string;
  variant: string;
  isControl: boolean;
}

export interface RemoteConfigState {
  featureFlags: FeatureFlags;
  dynamicConfig: DynamicConfig;
  abTests: Record<string, ABTestConfig>;
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchTime: Date | null;
  error: string | null;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableNewUI: false,
  enableDarkMode: true,
  enableBetaFeatures: false,
  enableMaintenanceMode: false,
  enableNotifications: true,
  buttonVariant: 'primary',
  layoutVariant: 'classic',
  pricingTier: 'basic',
};

export const DEFAULT_DYNAMIC_CONFIG: DynamicConfig = {
  appName: 'My Firebase App',
  welcomeMessage: 'Welcome to our application!',
  supportEmail: 'support@example.com',
  maxUploadSize: 10485760, // 10MB
  apiTimeout: 30000,
  maxRetries: 3,
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  logoUrl: '/logo.png',
  maxItemsPerPage: 20,
  sessionTimeout: 3600000, // 1 hour
};
