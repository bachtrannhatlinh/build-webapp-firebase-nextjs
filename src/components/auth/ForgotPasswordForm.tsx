"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-7 w-7 text-green-600 dark:text-green-400"
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
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We've sent a password reset link to{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {email}
            </span>
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full h-11 rounded-xl"
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <svg
            className="h-7 w-7 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No worries, we'll send you reset instructions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={loading}
        >
          {loading ? "Sending..." : "Reset password"}
        </Button>
      </form>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to login
      </button>
    </div>
  );
}
