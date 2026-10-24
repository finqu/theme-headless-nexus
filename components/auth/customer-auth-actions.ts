'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCustomerAccessToken } from '@finqu/storefront-sdk/server';
import type { CustomerAccessToken, CustomerCreateInput } from '@finqu/storefront-types';
import {
  CUSTOMER_CREATE_MUTATION,
  type CustomerCreateMutationResponse,
  type CustomerCreateMutationVariables,
} from '@/lib/queries/customer';
import { storefrontClient } from '@/lib/storefront';

const CUSTOMER_ACCESS_TOKEN_COOKIE = 'finqu_customer_access_token';
const REDIRECT_BASE_URL = 'https://storefront.invalid';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 256;
const MAX_REDIRECT_LENGTH = 2048;

type CustomerAuthField =
  | 'email'
  | 'password'
  | 'passwordConfirm'
  | 'firstName'
  | 'lastName'
  | 'acceptTerms';

interface CustomerAuthValues {
  email?: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: boolean;
  acceptsTerms?: boolean;
  acceptsMarketing?: boolean;
}

export interface CustomerAuthState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<CustomerAuthField, string>>;
  values?: CustomerAuthValues;
}

interface MutationUserError {
  field?: readonly string[] | null;
  message: string;
  code?: string | null;
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function errorState(
  message: string,
  values: CustomerAuthValues,
  fieldErrors?: CustomerAuthState['fieldErrors']
): CustomerAuthState {
  return {
    status: 'error',
    message,
    values,
    fieldErrors,
  };
}

function mutationErrorState(
  errors: readonly MutationUserError[],
  values: CustomerAuthValues
): CustomerAuthState {
  const fieldErrors: CustomerAuthState['fieldErrors'] = {};
  const knownFields = new Set<CustomerAuthField>([
    'email',
    'password',
    'passwordConfirm',
    'firstName',
    'lastName',
    'acceptTerms',
  ]);

  for (const error of errors) {
    const field = error.field?.at(-1);
    if (field && knownFields.has(field as CustomerAuthField)) {
      fieldErrors[field as CustomerAuthField] ??= error.message;
    }
  }

  const messages = [...new Set(errors.map((error) => error.message))];
  return errorState(
    messages.join(' ') || 'Please check your details and try again.',
    values,
    fieldErrors
  );
}

function loginMutationErrorState(
  errors: readonly MutationUserError[],
  values: CustomerAuthValues
): CustomerAuthState {
  if (errors.some((error) => error.code === 'TOO_MANY_ATTEMPTS')) {
    return errorState('Too many sign-in attempts. Please try again later.', values);
  }
  if (errors.some((error) => error.code === 'LOGIN_DISABLED')) {
    return errorState('Customer sign-in is disabled for this store.', values);
  }
  return errorState('Email or password is incorrect.', values);
}

function registrationMutationErrorState(
  errors: readonly MutationUserError[],
  values: CustomerAuthValues
): CustomerAuthState {
  if (errors.some((error) => error.code === 'EMAIL_TAKEN')) {
    return errorState(
      'Registration could not be completed with these details. Try signing in or recovering your password.',
      values
    );
  }
  return mutationErrorState(errors, values);
}

function safeRedirectPath(formData: FormData): string {
  const redirectTo = readString(formData, 'redirectTo');
  if (!redirectTo.startsWith('/') || redirectTo.length > MAX_REDIRECT_LENGTH) {
    return '/';
  }

  try {
    const url = new URL(redirectTo, REDIRECT_BASE_URL);
    if (url.origin !== REDIRECT_BASE_URL) {
      return '/';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

async function setCustomerAccessTokenCookie(
  token: CustomerAccessToken,
  persistent: boolean
): Promise<void> {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  const expires = new Date(token.expiresAt);

  if (persistent && Number.isFinite(expires.getTime())) {
    cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, token.accessToken, {
      ...options,
      expires,
    });
    return;
  }

  cookieStore.set(CUSTOMER_ACCESS_TOKEN_COOKIE, token.accessToken, options);
}

export async function loginCustomer(
  _previousState: CustomerAuthState,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = readString(formData, 'email').trim();
  const password = readString(formData, 'password');
  const rememberMe = readString(formData, 'rememberMe') === 'on';
  const values = { email, rememberMe };
  const fieldErrors: CustomerAuthState['fieldErrors'] = {};

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    fieldErrors.email = 'Enter a valid email address.';
  }
  if (!password) {
    fieldErrors.password = 'Enter your password.';
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.password = `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState('Please correct the highlighted fields.', values, fieldErrors);
  }

  let result;
  try {
    result = await createCustomerAccessToken(storefrontClient, {
      input: { email, password },
    });
  } catch {
    return errorState('Sign in is temporarily unavailable. Please try again.', values);
  }

  const { customerAccessToken, customerUserErrors } = result.customerAccessTokenCreate;
  if (customerUserErrors.length > 0) {
    return loginMutationErrorState(customerUserErrors, values);
  }
  if (!customerAccessToken) {
    return errorState('Sign in was not completed. Please try again.', values);
  }

  try {
    await setCustomerAccessTokenCookie(customerAccessToken, rememberMe);
  } catch {
    return errorState('Your session could not be saved. Please sign in again.', values);
  }
  redirect(safeRedirectPath(formData));
}

export async function registerCustomer(
  _previousState: CustomerAuthState,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = readString(formData, 'email').trim();
  const password = readString(formData, 'password');
  const passwordConfirm = readString(formData, 'passwordConfirm');
  const language = readString(formData, 'language').trim();
  const firstName = readString(formData, 'firstName').trim();
  const lastName = readString(formData, 'lastName').trim();
  const acceptsTerms = readString(formData, 'acceptTerms') === 'on';
  const acceptsMarketing = readString(formData, 'acceptsMarketing') === 'on';
  const values = { email, firstName, lastName, acceptsTerms, acceptsMarketing };
  const fieldErrors: CustomerAuthState['fieldErrors'] = {};

  if (language.length > 35 || !LANGUAGE_PATTERN.test(language)) {
    return errorState('Registration is temporarily unavailable. Please try again.', values);
  }

  if (!firstName) {
    fieldErrors.firstName = 'Enter your first name.';
  } else if (firstName.length > MAX_NAME_LENGTH) {
    fieldErrors.firstName = `Use ${MAX_NAME_LENGTH} characters or fewer.`;
  }
  if (!lastName) {
    fieldErrors.lastName = 'Enter your last name.';
  } else if (lastName.length > MAX_NAME_LENGTH) {
    fieldErrors.lastName = `Use ${MAX_NAME_LENGTH} characters or fewer.`;
  }
  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    fieldErrors.email = 'Enter a valid email address.';
  }
  if (password.length < 6) {
    fieldErrors.password = 'Use at least 6 characters.';
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.password = `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  }
  if (!passwordConfirm) {
    fieldErrors.passwordConfirm = 'Confirm your password.';
  } else if (passwordConfirm.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.passwordConfirm = `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  } else if (passwordConfirm !== password) {
    fieldErrors.passwordConfirm = 'Passwords do not match.';
  }
  if (!acceptsTerms) {
    fieldErrors.acceptTerms = 'Accept the terms and privacy policy to continue.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState('Please correct the highlighted fields.', values, fieldErrors);
  }

  const input = {
    email,
    password,
    passwordConfirm,
    firstName,
    lastName,
    acceptsMarketing,
  } satisfies CustomerCreateInput;

  let result: CustomerCreateMutationResponse;
  try {
    result = await storefrontClient.mutate<CustomerCreateMutationResponse>(
      CUSTOMER_CREATE_MUTATION,
      {
        input,
        language,
      } satisfies CustomerCreateMutationVariables
    );
  } catch {
    return errorState('Registration is temporarily unavailable. Please try again.', values);
  }

  const { customer, customerAccessToken, customerUserErrors } = result.customerCreate;
  if (customerUserErrors.length > 0) {
    return registrationMutationErrorState(customerUserErrors, values);
  }

  if (customerAccessToken) {
    try {
      await setCustomerAccessTokenCookie(customerAccessToken, false);
    } catch {
      return {
        status: 'success',
        message: 'Your account was created. Sign in to continue.',
      };
    }
    redirect(safeRedirectPath(formData));
  }

  if (customer) {
    return {
      status: 'success',
      message: 'Your account was created. Sign in to continue.',
    };
  }

  return errorState('Registration was not completed. Please try again.', values);
}
