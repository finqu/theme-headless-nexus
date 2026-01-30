import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-primary text-sm font-semibold">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">Page not found</h1>
        <p className="mt-4 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="bg-primary text-primary-foreground inline-block rounded-sm px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
