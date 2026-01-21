interface SearchPageProps {
  locale: string;
}

/**
 * Search page component.
 * TODO: Implement full search functionality with Finqu products API.
 */
export function SearchPage({ locale }: SearchPageProps) {
  return (
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Search
          </h1>
        </div>

        {/* Search form */}
        <div className="mx-auto mt-8 max-w-xl">
          <form className="relative">
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="block w-full rounded-md border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Results placeholder */}
        <div className="mt-12">
          <p className="text-center text-gray-500">
            Enter a search term to find products.
          </p>
        </div>
      </div>
    </div>
  );
}
