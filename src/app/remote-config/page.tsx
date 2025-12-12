'use client';

import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext';
import { RemoteConfigDashboard, FeatureFlagDemo } from '@/components/remote-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Flag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RemoteConfigPage() {
  return (
    <RemoteConfigProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Firebase Remote Config</h1>
                <p className="text-muted-foreground">
                  Feature Flags, A/B Testing & Dynamic Configuration
                </p>
              </div>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Demo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <RemoteConfigDashboard />
            </TabsContent>

            <TabsContent value="demo">
              <FeatureFlagDemo />
            </TabsContent>
          </Tabs>

          {/* Usage Guide */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📚 Hướng dẫn sử dụng</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">1. Feature Flags</h4>
                <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { FeatureGate } from '@/contexts/RemoteConfigContext';

<FeatureGate flag="enableBetaFeatures">
  <BetaComponent />
</FeatureGate>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Hook Usage</h4>
                <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { useFeatureFlag } from '@/hooks/useRemoteConfig';

const isBeta = useFeatureFlag('enableBetaFeatures');`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Dynamic Config</h4>
                <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { useDynamicConfig } from '@/hooks/useRemoteConfig';

const appName = useDynamicConfig('appName');`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">4. A/B Testing</h4>
                <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { useABTest } from '@/hooks/useRemoteConfig';

const { config, isInVariant } = useABTest('homepage');
if (isInVariant('variant_a')) { ... }`}
                </pre>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                ⚠️ Setup Required
              </h4>
              <p className="text-sm text-muted-foreground">
                Để sử dụng Remote Config, bạn cần:
              </p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
                <li>Vào Firebase Console → Remote Config</li>
                <li>Tạo các parameters tương ứng (enableBetaFeatures, appName, v.v.)</li>
                <li>Publish changes</li>
                <li>Nhấn &quot;Refresh&quot; trên dashboard để fetch config mới</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </RemoteConfigProvider>
  );
}
