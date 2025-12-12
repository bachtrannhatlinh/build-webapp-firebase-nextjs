"use client";

import React from "react";
import { 
  Shield, 
  Bot, 
  Lock, 
  Fingerprint, 
  Eye, 
  Database,
  CheckCircle2
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "App Check Protection",
    description: "Xác thực rằng requests đến từ ứng dụng hợp lệ của bạn",
    benefits: [
      "Chặn requests từ sources không được phép",
      "Bảo vệ backend resources",
      "Tự động refresh tokens",
    ],
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Bot Protection",
    description: "reCAPTCHA v3 tự động phát hiện và chặn bot traffic",
    benefits: [
      "Invisible verification - không ảnh hưởng UX",
      "Risk analysis scoring",
      "Adaptive protection",
    ],
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Firestore Security",
    description: "Security rules yêu cầu App Check token cho write operations",
    benefits: [
      "Chống data tampering",
      "Rate limiting protection",
      "Audit logging",
    ],
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Storage Security",
    description: "Chỉ cho phép upload từ verified app instances",
    benefits: [
      "Prevent unauthorized uploads",
      "Protect storage quota",
      "Content validation",
    ],
  },
  {
    icon: <Fingerprint className="w-6 h-6" />,
    title: "Device Attestation",
    description: "Xác thực device/browser thực sự đang chạy app",
    benefits: [
      "Hardware-backed attestation",
      "Platform-specific checks",
      "Fraud detection",
    ],
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Monitoring & Analytics",
    description: "Theo dõi App Check metrics trong Firebase Console",
    benefits: [
      "Real-time monitoring",
      "Abuse detection alerts",
      "Usage analytics",
    ],
  },
];

export const SecurityFeatures: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {feature.title}
            </h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {feature.description}
          </p>
          
          <ul className="space-y-2">
            {feature.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
