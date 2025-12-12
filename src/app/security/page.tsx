"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppCheckStatus } from "@/components/security/AppCheckStatus";
import { SecurityFeatures } from "@/components/security/SecurityFeatures";
import { SetupGuide } from "@/components/security/SetupGuide";

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Firebase App Check - Security
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Chống abuse, bot protection & security monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <AppCheckStatus />
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                App Check là gì?
              </h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Firebase App Check</strong> giúp bảo vệ backend resources của bạn 
                  (Firestore, Storage, Cloud Functions) khỏi abuse bằng cách xác thực rằng 
                  incoming traffic đến từ ứng dụng hợp lệ của bạn.
                </p>
                <p>
                  App Check sử dụng các attestation providers như <strong>reCAPTCHA v3</strong> 
                  (cho web), <strong>SafetyNet</strong> (cho Android), và <strong>DeviceCheck</strong> 
                  (cho iOS) để xác thực device/browser.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Tip:</strong> App Check hoạt động invisible - người dùng không 
                    thấy captcha challenges. reCAPTCHA v3 tự động đánh giá risk score dựa trên 
                    user behavior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Security Features
          </h2>
          <SecurityFeatures />
        </div>

        <div className="mb-8">
          <SetupGuide />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Security Rules đã được cập nhật
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Firestore Rules
              </h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
{`function hasValidAppCheck() {
  return request.appCheckToken != null;
}

// Example usage:
allow write: if request.auth != null 
  && hasValidAppCheck();`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Storage Rules
              </h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
{`function hasValidAppCheck() {
  return request.appCheckToken != null;
}

// Example usage:
allow write: if request.auth != null 
  && hasValidAppCheck();`}
              </pre>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
