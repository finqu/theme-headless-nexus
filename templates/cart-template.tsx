interface CartTemplateProps {
  locale: string;
}

/**
 * Shopping cart template component.
 * TODO: Implement full cart functionality with Finqu cart API.
 */
export function CartTemplate({ locale }: CartTemplateProps) {
  return (
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Cart items */}
          <section className="lg:col-span-7">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-center text-gray-500">Your cart is empty.</p>
              <div className="mt-6 text-center">
                <a href="/" className="text-primary hover:text-primary/80 text-sm font-medium">
                  Continue Shopping
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </section>

          {/* Order summary */}
          <section className="mt-16 rounded-lg border border-gray-200 bg-white px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">$0.00</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">$0.00</dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="button"
                disabled
                className="bg-primary text-primary-foreground w-full rounded-sm px-3 py-3 text-base font-medium opacity-50"
              >
                Checkout
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
