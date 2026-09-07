import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

interface LoginTemplateProps {
  locale: string;
}

/**
 * Server-rendered login shell with an interactive customer sign-in form.
 */
export function LoginTemplate({ locale }: LoginTemplateProps) {
  return (
    <AuthLayout
      marketingTitle="Welcome back"
      marketingDescription="Sign in to access your account, track orders, and enjoy a personalized shopping experience."
      marketingFeatures={[
        'Quick order tracking and history',
        'Saved addresses for faster checkout',
        'Personalized product recommendations',
        'Exclusive member discounts',
      ]}
    >
      <LoginForm locale={locale} />
    </AuthLayout>
  );
}
