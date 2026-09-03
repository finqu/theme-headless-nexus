'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Something went wrong</h1>
        <p className="mt-4 text-gray-600">We apologize for the inconvenience. Please try again.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground rounded-sm px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-sm border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
