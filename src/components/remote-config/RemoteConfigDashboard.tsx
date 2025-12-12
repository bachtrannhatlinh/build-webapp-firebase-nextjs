'use client';

import { useRemoteConfigContext } from '@/contexts/RemoteConfigContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Settings, Flag, FlaskConical } from 'lucide-react';

export function RemoteConfigDashboard() {
  const { 
    featureFlags, 
    dynamicConfig, 
    abTests,
    isLoading, 
    isInitialized,
    lastFetchTime,
    error,
    refresh 
  } = useRemoteConfigContext();

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Remote Config Dashboard</h2>
          <p className="text-muted-foreground">
            Manage feature flags, A/B tests, and dynamic configuration
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastFetchTime && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={refresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>Toggle features on/off</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <FeatureFlagItem 
                  name="New UI" 
                  enabled={featureFlags.enableNewUI} 
                />
                <FeatureFlagItem 
                  name="Dark Mode" 
                  enabled={featureFlags.enableDarkMode} 
                />
                <FeatureFlagItem 
                  name="Beta Features" 
                  enabled={featureFlags.enableBetaFeatures} 
                />
                <FeatureFlagItem 
                  name="Maintenance Mode" 
                  enabled={featureFlags.enableMaintenanceMode}
                  variant="warning" 
                />
                <FeatureFlagItem 
                  name="Notifications" 
                  enabled={featureFlags.enableNotifications} 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              A/B Test Variants
            </CardTitle>
            <CardDescription>Current variant assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <VariantItem 
                  name="Button Style" 
                  value={featureFlags.buttonVariant} 
                />
                <VariantItem 
                  name="Layout" 
                  value={featureFlags.layoutVariant} 
                />
                <VariantItem 
                  name="Pricing Tier" 
                  value={featureFlags.pricingTier} 
                />
                
                {Object.entries(abTests).map(([key, config]) => (
                  <VariantItem 
                    key={key}
                    name={config.experimentName} 
                    value={config.variant}
                    isControl={config.isControl}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dynamic Config
            </CardTitle>
            <CardDescription>Runtime configuration values</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <ConfigItem 
                  name="App Name" 
                  value={dynamicConfig.appName} 
                />
                <ConfigItem 
                  name="Welcome Message" 
                  value={dynamicConfig.welcomeMessage} 
                />
                <ConfigItem 
                  name="Support Email" 
                  value={dynamicConfig.supportEmail} 
                />
                <ConfigItem 
                  name="Max Upload Size" 
                  value={`${(dynamicConfig.maxUploadSize / 1024 / 1024).toFixed(0)} MB`} 
                />
                <ConfigItem 
                  name="Primary Color" 
                  value={dynamicConfig.primaryColor}
                  showColor 
                />
                <ConfigItem 
                  name="Items Per Page" 
                  value={dynamicConfig.maxItemsPerPage.toString()} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isInitialized ? 'default' : 'secondary'}>
              {isInitialized ? 'Initialized' : 'Not Initialized'}
            </Badge>
            <Badge variant={isLoading ? 'outline' : 'default'}>
              {isLoading ? 'Loading...' : 'Ready'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureFlagItem({ 
  name, 
  enabled,
  variant = 'default' 
}: { 
  name: string; 
  enabled: boolean;
  variant?: 'default' | 'warning';
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium">{name}</span>
      <Badge 
        variant={
          variant === 'warning' && enabled 
            ? 'destructive' 
            : enabled 
              ? 'default' 
              : 'secondary'
        }
      >
        {enabled ? 'ON' : 'OFF'}
      </Badge>
    </div>
  );
}

function VariantItem({ 
  name, 
  value,
  isControl = false 
}: { 
  name: string; 
  value: string;
  isControl?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{value}</Badge>
        {isControl && (
          <Badge variant="secondary" className="text-xs">control</Badge>
        )}
      </div>
    </div>
  );
}

function ConfigItem({ 
  name, 
  value,
  showColor = false 
}: { 
  name: string; 
  value: string;
  showColor?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-2">
        {showColor && (
          <div 
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: value }}
          />
        )}
        <span className="text-sm text-muted-foreground max-w-[150px] truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
