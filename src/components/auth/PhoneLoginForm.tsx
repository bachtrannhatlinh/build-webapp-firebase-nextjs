"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupRecaptcha, sendOTP, verifyOTP } from "@/lib/auth";
import { RecaptchaVerifier } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneLoginFormProps {
  onBack: () => void;
}

export function PhoneLoginForm({ onBack }: PhoneLoginFormProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Setup recaptcha on mount
    const verifier = setupRecaptcha("recaptcha-container");
    if (verifier) {
      setRecaptchaVerifier(verifier);
    }
  }, []);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recaptchaVerifier) {
      setError("reCAPTCHA not initialized");
      return;
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+84" + formattedPhone.replace(/^0/, "");
    }

    setLoading(true);

    try {
      await sendOTP(formattedPhone, recaptchaVerifier);
      setStep("otp");
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyOTP(otp);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !recaptchaVerifier) return;

    setLoading(true);
    setError("");

    try {
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+84" + formattedPhone.replace(/^0/, "");
      }
      await sendOTP(formattedPhone, recaptchaVerifier);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {step === "phone" ? "Enter your phone number" : "Verify OTP"}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {step === "phone"
            ? "We'll send you a verification code"
            : `Enter the code sent to ${phoneNumber}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                +84
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="912345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-11 rounded-xl flex-1"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-11 rounded-xl text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">
                Resend OTP in {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Change phone number
          </button>
        </form>
      )}

      {/* Recaptcha container */}
      <div id="recaptcha-container" />

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
