import type {
  Customer,
  CustomerAccessToken,
  CustomerCreateInput,
  CustomerUserError,
  Policy,
} from '@finqu/storefront-types';

/**
 * Registration is not exposed as a typed operation by the current Storefront SDK.
 */
export const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!, $language: String!)
  @storeContext(language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export interface CustomerCreateMutationVariables {
  input: CustomerCreateInput;
  language: string;
}

export interface CustomerCreateMutationResponse {
  customerCreate: {
    customer: Pick<Customer, 'id'> | null;
    customerAccessToken: CustomerAccessToken | null;
    customerUserErrors: CustomerUserError[];
  };
}

/**
 * Fetch the legal policy URLs shown alongside account registration consent.
 */
export const REGISTRATION_POLICIES_QUERY = /* GraphQL */ `
  query RegistrationPolicies($language: String!) @storeContext(language: $language) {
    policies {
      termsAndConditions {
        url
      }
      privacyPolicy {
        url
      }
    }
  }
`;

export interface RegistrationPoliciesQueryVariables {
  language: string;
}

export interface RegistrationPoliciesQueryResponse {
  policies: {
    termsAndConditions: Pick<Policy, 'url'> | null;
    privacyPolicy: Pick<Policy, 'url'> | null;
  } | null;
}
