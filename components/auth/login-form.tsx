'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/context-providers/locale-context';
import { useStore } from '@/lib/context-providers/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginCustomer, type CustomerAuthState } from '@/components/auth/customer-auth-actions';

interface LoginFormProps {
  locale: string;
}

const initialState: CustomerAuthState = {
  status: 'idle',
};

function localizedPath(locale: string, defaultLocale: string, path: string): string {
  const normalizedLocale = locale.toLowerCase();
  const prefix = normalizedLocale === defaultLocale.toLowerCase() ? '' : `/${normalizedLocale}`;
  return `${prefix}${path}`;
}

export function LoginForm({ locale }: LoginFormProps) {
  const { defaultLocale } = useLocale();
  const { routes } = useStore();
  const [state, formAction, isPending] = useActionState(loginCustomer, initialState);
  const registerHref =
    routes?.accountRegisterUrl || localizedPath(locale, defaultLocale, '/register');
  const recoverPasswordHref =
    routes?.accountPasswordRecoverUrl || localizedPath(locale, defaultLocale, '/recover-password');
  const accountHref = routes?.accountUrl || localizedPath(locale, defaultLocale, '/account');
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link href={registerHref} className="text-primary hover:text-primary/80 font-medium">
            Create one
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              defaultValue={state.values?.email}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              aria-invalid={Boolean(emailError)}
              placeholder="you@example.com"
            />
            {emailError ? (
              <p id="login-email-error" className="text-sm text-red-700">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              aria-describedby={passwordError ? 'login-password-error' : undefined}
              aria-invalid={Boolean(passwordError)}
              placeholder="Enter your password"
            />
            {passwordError ? (
              <p id="login-password-error" className="text-sm text-red-700">
                {passwordError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              defaultChecked={state.values?.rememberMe}
              className="border-input size-4 rounded-sm"
            />
            <label htmlFor="remember-me" className="text-sm">
              Remember me
            </label>
          </div>

          <Link
            href={recoverPasswordHref}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
