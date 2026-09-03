interface PolicyTemplateProps {
  type: 'privacy' | 'shipping' | 'refund' | 'terms';
  locale: string;
}

const policyTitles: Record<PolicyTemplateProps['type'], string> = {
  privacy: 'Privacy Policy',
  shipping: 'Shipping Policy',
  refund: 'Refund Policy',
  terms: 'Terms and Conditions',
};

/**
 * Policy template component.
 * TODO: Fetch actual policy content from Finqu policies API.
 */
export function PolicyTemplate({ type, locale }: PolicyTemplateProps) {
  const title = policyTitles[type];

  return (
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>

        <div className="prose prose-gray mt-8 max-w-none">
          <p className="text-gray-600">Policy content will be loaded from the Finqu API.</p>

          {/* Placeholder content */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-500">
              This policy page will display the {title.toLowerCase()} from your store settings. Make
              sure to configure your policies in the Finqu admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
