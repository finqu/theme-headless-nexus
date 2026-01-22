'use client';

import type { Product, ProductVariant, CustomField } from '@finqu/storefront-types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function formatPrice(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

interface ProductInfoProps {
  product: Product;
  selectedVariant?: ProductVariant;
  currency?: string;
}

export function ProductInfo({ product, selectedVariant, currency = 'EUR' }: ProductInfoProps) {
  const variant = selectedVariant || product.defaultOrSelectedVariant;
  const price = variant?.price;
  const originalPrice = variant?.originalPrice;
  const isOnSale = originalPrice && price && originalPrice > price;
  const discountPercent = isOnSale
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Title and badges */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {isOnSale && (
            <Badge variant="destructive" className="uppercase">
              Sale {discountPercent}% off
            </Badge>
          )}
          {variant?.isNew && <Badge variant="secondary">New</Badge>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {product.title}
        </h1>
      </div>

      {/* Price */}
      {price != null && (
        <div className="flex items-baseline gap-3">
          <span className={`text-2xl font-semibold ${isOnSale ? 'text-red-600' : 'text-gray-900'}`}>
            {formatPrice(price, currency)}
          </span>
          {isOnSale && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(originalPrice, currency)}
            </span>
          )}
        </div>
      )}

      {/* SKU */}
      {variant?.sku && (
        <p className="text-sm text-gray-500">
          SKU: <span className="font-medium">{variant.sku}</span>
        </p>
      )}

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-base text-gray-700">{product.shortDescription}</p>
      )}

      {/* Availability */}
      <div className="flex items-center gap-2">
        {product.isAvailable ? (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">In stock</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Out of stock</span>
          </>
        )}
      </div>
    </div>
  );
}

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const hasDescription = !!product.description;
  const hasSpecifications = product.customFields && product.customFields.length > 0;

  if (!hasDescription && !hasSpecifications) {
    return null;
  }

  // Use accordion on mobile, tabs on desktop
  return (
    <>
      {/* Desktop: Tabs */}
      <div className="hidden sm:block">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            {hasDescription && (
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none"
              >
                Description
              </TabsTrigger>
            )}
            {hasSpecifications && (
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none"
              >
                Specifications
              </TabsTrigger>
            )}
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none"
            >
              Shipping & Returns
            </TabsTrigger>
          </TabsList>

          {hasDescription && (
            <TabsContent value="description" className="pt-4">
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </TabsContent>
          )}

          {hasSpecifications && (
            <TabsContent value="specifications" className="pt-4">
              <SpecificationsTable customFields={product.customFields} />
            </TabsContent>
          )}

          <TabsContent value="shipping" className="pt-4">
            <ShippingInfo />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile: Accordion */}
      <div className="sm:hidden">
        <Accordion type="single" collapsible className="w-full">
          {hasDescription && (
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {hasSpecifications && (
            <AccordionItem value="specifications">
              <AccordionTrigger>Specifications</AccordionTrigger>
              <AccordionContent>
                <SpecificationsTable customFields={product.customFields} />
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping & Returns</AccordionTrigger>
            <AccordionContent>
              <ShippingInfo />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}

function SpecificationsTable({ customFields }: { customFields?: CustomField[] | null }) {
  if (!customFields || customFields.length === 0) return null;

  const entries = customFields.filter(
    (field) => field.value !== null && field.value !== undefined && field.value !== ''
  );

  if (entries.length === 0) return null;

  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-200">
        {entries.map((field, index) => (
          <tr key={field.handle || index}>
            <td className="py-2 pr-4 font-medium text-gray-900">{field.title}</td>
            <td className="py-2 text-gray-600">{field.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ShippingInfo() {
  return (
    <div className="space-y-4 text-sm text-gray-600">
      <div>
        <h4 className="font-medium text-gray-900">Shipping</h4>
        <p>Free shipping on orders over $100. Standard shipping 3-5 business days.</p>
      </div>
      <div>
        <h4 className="font-medium text-gray-900">Returns</h4>
        <p>Free returns within 30 days. Items must be unworn and in original packaging.</p>
      </div>
    </div>
  );
}
