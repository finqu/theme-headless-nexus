import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';
import {
  REGISTRATION_POLICIES_QUERY,
  type RegistrationPoliciesQueryResponse,
  type RegistrationPoliciesQueryVariables,
} from '@/lib/queries/customer';
import { cachePresets, storefrontClient, withLocale } from '@/lib/storefront';

interface RegisterTemplateProps {
  locale: string;
}

/**
 * Server-rendered registration shell with an interactive customer account form.
 */
export async function RegisterTemplate({ locale }: RegisterTemplateProps) {
  const policies = await storefrontClient
    .query<RegistrationPoliciesQueryResponse>(
      REGISTRATION_POLICIES_QUERY,
      {
        language: locale,
      } satisfies RegistrationPoliciesQueryVariables,
      withLocale(locale, cachePresets.static)
    )
    .catch(() => ({
      policies: {
        termsAndConditions: null,
        privacyPolicy: null,
      },
    }));

  return (
    <AuthLayout
      marketingTitle="Start your journey"
      marketingDescription="Create an account to unlock the full potential of your shopping experience."
      marketingFeatures={[
        'One-click checkout with saved details',
        'Order tracking and delivery updates',
        'Wishlist and favorites management',
        'Early access to sales and promotions',
      ]}
    >
      <RegisterForm
        locale={locale}
        termsHref={policies.policies?.termsAndConditions?.url}
        privacyHref={policies.policies?.privacyPolicy?.url}
      />
    </AuthLayout>
  );
}
