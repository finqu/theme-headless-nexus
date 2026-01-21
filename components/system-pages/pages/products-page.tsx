interface ProductsPageProps {
  locale: string;
}

/**
 * Products catalog page component.
 * TODO: Implement full catalog with Finqu products API and filtering.
 */
export function ProductsPage({ locale }: ProductsPageProps) {
  return (
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            All Products
          </h1>
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              name="sort"
              className="rounded-md border border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Selling</option>
            </select>
          </div>
        </div>

        {/* Products grid placeholder */}
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Product card placeholders */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="group relative rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No image
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              disabled
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-400"
            >
              Previous
            </button>
            <span className="px-4 text-sm text-gray-700">Page 1 of 1</span>
            <button
              disabled
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-400"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
