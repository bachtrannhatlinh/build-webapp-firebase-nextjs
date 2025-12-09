"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LoginForm,
  RegisterForm,
  PhoneLoginForm,
  ForgotPasswordForm,
} from "@/components/auth";
import Link from "next/link";

type AuthView = "login" | "register" | "phone" | "forgot-password";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 text-white">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold">BlogApp</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Start your journey with us
          </h1>
          <p className="text-lg text-white/80">
            Create, share, and discover amazing content with our community.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Create and manage blog posts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Connect with other writers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Secure and fast platform</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} BlogApp. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BlogApp
              </span>
            </Link>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
            {view === "login" && (
              <LoginForm
                onSwitchToRegister={() => setView("register")}
                onSwitchToPhone={() => setView("phone")}
                onForgotPassword={() => setView("forgot-password")}
              />
            )}
            {view === "register" && (
              <RegisterForm onSwitchToLogin={() => setView("login")} />
            )}
            {view === "phone" && (
              <PhoneLoginForm onBack={() => setView("login")} />
            )}
            {view === "forgot-password" && (
              <ForgotPasswordForm onBack={() => setView("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
