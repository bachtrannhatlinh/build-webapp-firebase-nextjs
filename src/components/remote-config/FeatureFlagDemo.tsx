'use client';

import { FeatureGate, ABTestVariant, useConfig } from '@/contexts/RemoteConfigContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bell, Moon, Wrench, Layout } from 'lucide-react';

export function FeatureFlagDemo() {
  const config = useConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feature Flag Demo</h2>
        <p className="text-muted-foreground">
          These components render conditionally based on Remote Config values
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Beta Features Gate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Beta Features
            </CardTitle>
            <CardDescription>
              This content only shows when beta features are enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureGate 
              flag="enableBetaFeatures"
              fallback={
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Beta features are currently disabled.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable &quot;enableBetaFeatures&quot; in Remote Config to see this content.
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <Badge className="mb-2">Beta</Badge>
                <h3 className="font-semibold">🎉 Welcome to Beta!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You have access to experimental features.
                </p>
                <Button className="mt-3" size="sm">
                  Try New Feature
                </Button>
              </div>
            </FeatureGate>
          </CardContent>
        </Card>

        {/* New UI Gate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              New UI Experience
            </CardTitle>
            <CardDescription>
              Toggle between old and new UI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureGate 
              flag="enableNewUI"
              fallback={
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <h3 className="font-semibold">Classic UI</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re viewing the classic interface.
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border">
                <Badge variant="default" className="mb-2">New</Badge>
                <h3 className="font-semibold">✨ Modern UI</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;re experiencing the new modern interface!
                </p>
              </div>
            </FeatureGate>
          </CardContent>
        </Card>

        {/* Notifications Gate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Notification features visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureGate 
              flag="enableNotifications"
              fallback={
                <p className="text-muted-foreground text-sm">
                  Notifications are disabled by Remote Config.
                </p>
              }
            >
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Notifications Active</p>
                  <p className="text-sm text-muted-foreground">
                    You will receive push notifications
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </FeatureGate>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Shows maintenance banner when enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureGate 
              flag="enableMaintenanceMode"
              fallback={
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ All systems operational
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  ⚠️ Maintenance Mode Active
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Some features may be temporarily unavailable.
                </p>
              </div>
            </FeatureGate>
          </CardContent>
        </Card>
      </div>

      {/* Button Variant Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variant A/B Test</CardTitle>
          <CardDescription>
            Current variant: <Badge variant="outline">{config.buttonVariant}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {config.buttonVariant === 'primary' && (
              <Button>Primary Button</Button>
            )}
            {config.buttonVariant === 'secondary' && (
              <Button variant="secondary">Secondary Button</Button>
            )}
            {config.buttonVariant === 'gradient' && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Gradient Button
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout Variant Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Variant</CardTitle>
          <CardDescription>
            Current layout: <Badge variant="outline">{config.layoutVariant}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config.layoutVariant === 'classic' && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Classic Layout</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          )}
          {config.layoutVariant === 'modern' && (
            <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg">
              <h4 className="font-semibold mb-2">Modern Layout</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-white/50 dark:bg-black/20 rounded-xl" />
                <div className="h-24 bg-white/50 dark:bg-black/20 rounded-xl" />
              </div>
            </div>
          )}
          {config.layoutVariant === 'minimal' && (
            <div className="p-4">
              <h4 className="font-semibold mb-2">Minimal Layout</h4>
              <div className="space-y-2">
                <div className="h-8 bg-muted/50 rounded" />
                <div className="h-8 bg-muted/50 rounded" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Config Display */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Configuration Values</CardTitle>
          <CardDescription>These values are fetched from Remote Config</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="font-bold text-lg">{config.appName}</h3>
              <p className="opacity-90">{config.welcomeMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
