'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/context-providers/locale-context';
import { useStore } from '@/lib/context-providers/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerCustomer, type CustomerAuthState } from '@/components/auth/customer-auth-actions';

interface RegisterFormProps {
  locale: string;
  termsHref?: string;
  privacyHref?: string;
}

const initialState: CustomerAuthState = {
  status: 'idle',
};

function localizedPath(locale: string, defaultLocale: string, path: string): string {
  const normalizedLocale = locale.toLowerCase();
  const prefix = normalizedLocale === defaultLocale.toLowerCase() ? '' : `/${normalizedLocale}`;
  return `${prefix}${path}`;
}

export function RegisterForm({ locale, termsHref, privacyHref }: RegisterFormProps) {
  const { defaultLocale } = useLocale();
  const { routes } = useStore();
  const [state, formAction, isPending] = useActionState(registerCustomer, initialState);
  const loginHref = routes?.accountLoginUrl || localizedPath(locale, defaultLocale, '/login');
  const accountHref = routes?.accountUrl || localizedPath(locale, defaultLocale, '/account');

  if (state.status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Account created</h1>
          <p role="status" className="text-muted-foreground text-sm">
            {state.message}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={loginHref}>Sign in</Link>
        </Button>
      </div>
    );
  }

  const firstNameError = state.fieldErrors?.firstName;
  const lastNameError = state.fieldErrors?.lastName;
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;
  const passwordConfirmError = state.fieldErrors?.passwordConfirm;
  const acceptTermsError = state.fieldErrors?.acceptTerms;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href={loginHref} className="text-primary hover:text-primary/80 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {state.status === 'error' && state.message ? (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <form action={formAction} className="space-y-4" aria-busy={isPending}>
        <input type="hidden" name="redirectTo" value={accountHref} />
        <input type="hidden" name="language" value={locale} />
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="register-first-name" className="text-sm font-medium">
                First name
              </label>
              <Input
                id="register-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                maxLength={100}
                defaultValue={state.values?.firstName}
                aria-describedby={firstNameError ? 'register-first-name-error' : undefined}
                aria-invalid={Boolean(firstNameError)}
                placeholder="John"
              />
              {firstNameError ? (
                <p id="register-first-name-error" className="text-sm text-red-700">
                  {firstNameError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="register-last-name" className="text-sm font-medium">
                Last name
              </label>
              <Input
                id="register-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                maxLength={100}
                defaultValue={state.values?.lastName}
                aria-describedby={lastNameError ? 'register-last-name-error' : undefined}
                aria-invalid={Boolean(lastNameError)}
                placeholder="Doe"
              />
              {lastNameError ? (
                <p id="register-last-name-error" className="text-sm text-red-700">
                  {lastNameError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              defaultValue={state.values?.email}
              aria-describedby={emailError ? 'register-email-error' : undefined}
              aria-invalid={Boolean(emailError)}
              placeholder="you@example.com"
            />
            {emailError ? (
              <p id="register-email-error" className="text-sm text-red-700">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={256}
              aria-describedby={passwordError ? 'register-password-error' : undefined}
              aria-invalid={Boolean(passwordError)}
              placeholder="Create a password"
            />
            {passwordError ? (
              <p id="register-password-error" className="text-sm text-red-700">
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password-confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <Input
              id="register-password-confirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={256}
              aria-describedby={
                passwordConfirmError ? 'register-password-confirm-error' : undefined
              }
              aria-invalid={Boolean(passwordConfirmError)}
              placeholder="Confirm your password"
            />
            {passwordConfirmError ? (
              <p id="register-password-confirm-error" className="text-sm text-red-700">
                {passwordConfirmError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              id="accept-terms"
              name="acceptTerms"
              type="checkbox"
              required
              defaultChecked={state.values?.acceptsTerms}
              aria-describedby={
                acceptTermsError
                  ? 'registration-policy-links accept-terms-error'
                  : 'registration-policy-links'
              }
              aria-invalid={Boolean(acceptTermsError)}
              className="border-input mt-1 size-4 rounded-sm"
            />
            <div className="space-y-1 text-sm">
              <label htmlFor="accept-terms">I agree to the store policies.</label>
              <p id="registration-policy-links" className="text-muted-foreground">
                {termsHref ? (
                  <Link href={termsHref} className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>
                ) : (
                  'Terms of Service'
                )}
                {' and '}
                {privacyHref ? (
                  <Link href={privacyHref} className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                ) : (
                  'Privacy Policy'
                )}
              </p>
            </div>
          </div>
          {acceptTermsError ? (
            <p id="accept-terms-error" className="text-sm text-red-700">
              {acceptTermsError}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              id="accept-marketing"
              name="acceptsMarketing"
              type="checkbox"
              defaultChecked={state.values?.acceptsMarketing}
              className="border-input size-4 rounded-sm"
            />
            <label htmlFor="accept-marketing" className="text-sm">
              Send me news and promotional emails
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}
