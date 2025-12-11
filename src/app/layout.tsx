import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BlogApp - Modern Blog Platform",
    template: "%s | BlogApp",
  },
  description:
    "A modern blog platform built with Next.js, Firebase, and Tailwind CSS",
  keywords: ["blog", "nextjs", "firebase", "react", "typescript"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "BlogApp - Modern Blog Platform",
    description:
      "A modern blog platform built with Next.js, Firebase, and Tailwind CSS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
