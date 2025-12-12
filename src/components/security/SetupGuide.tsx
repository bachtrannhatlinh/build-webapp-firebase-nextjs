"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  content: React.ReactNode;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = "bash" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-300" />
        )}
      </button>
    </div>
  );
};

const steps: Step[] = [
  {
    title: "1. Đăng ký reCAPTCHA v3",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Truy cập Google reCAPTCHA Admin Console để tạo site key mới:
        </p>
        <a
          href="https://www.google.com/recaptcha/admin/create"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          reCAPTCHA Admin Console
          <ExternalLink className="w-4 h-4" />
        </a>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Chọn reCAPTCHA v3</li>
          <li>Thêm domain của bạn (bao gồm localhost cho development)</li>
          <li>Copy Site Key và Secret Key</li>
        </ul>
      </div>
    ),
  },
  {
    title: "2. Kích hoạt App Check trong Firebase Console",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Vào Firebase Console → App Check → Register apps:
        </p>
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          Firebase Console
          <ExternalLink className="w-4 h-4" />
        </a>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Chọn project của bạn</li>
          <li>Vào Build → App Check</li>
          <li>Đăng ký web app với reCAPTCHA v3 provider</li>
          <li>Dán Site Key vào</li>
        </ul>
      </div>
    ),
  },
  {
    title: "3. Thêm environment variables",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Thêm reCAPTCHA Site Key vào file .env.local:
        </p>
        <CodeBlock
          code={`# .env.local
NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY=your_recaptcha_site_key_here`}
          language="bash"
        />
      </div>
    ),
  },
  {
    title: "4. Bật enforcement cho Firebase services",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Trong Firebase Console → App Check, bật enforcement cho:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Cloud Firestore</li>
          <li>Cloud Storage</li>
          <li>Cloud Functions (nếu sử dụng)</li>
          <li>Realtime Database (nếu sử dụng)</li>
        </ul>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Lưu ý:</strong> Chỉ bật enforcement sau khi đã test kỹ trong development mode.
            Nếu bật ngay, có thể block legitimate traffic.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "5. Deploy Firestore & Storage rules",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Deploy security rules đã được cập nhật:
        </p>
        <CodeBlock
          code={`# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage:rules`}
          language="bash"
        />
      </div>
    ),
  },
  {
    title: "6. Test và Monitor",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Kiểm tra App Check đang hoạt động:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>Mở app và kiểm tra console không có errors</li>
          <li>Thử các write operations (create blog, upload file...)</li>
          <li>Kiểm tra Firebase Console → App Check → Metrics</li>
        </ul>
      </div>
    ),
  },
];

export const SetupGuide: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Hướng dẫn cài đặt App Check
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Làm theo các bước sau để kích hoạt bảo vệ cho ứng dụng
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {steps.map((step, index) => (
          <div key={index}>
            <button
              onClick={() => toggleStep(index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="font-medium text-slate-900 dark:text-white text-left">
                {step.title}
              </span>
              {expandedStep === index ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedStep === index && (
              <div className="px-6 pb-6">
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
