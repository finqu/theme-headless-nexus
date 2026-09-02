import { CartPage } from '@/components/cart/cart-page';

interface CartTemplateProps {
  locale: string;
}

/**
 * Shopping cart fallback when no published Puck template exists.
 * The shell renders on the server and CartPage handles cookie-backed cart interactions.
 */
export function CartTemplate({ locale }: CartTemplateProps) {
  return (
    <div className="@container min-h-[60vh] px-4 py-8 @sm:px-6 @sm:py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping cart</h1>
        <CartPage locale={locale} />
      </div>
    </div>
  );
}
