import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
        >
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
