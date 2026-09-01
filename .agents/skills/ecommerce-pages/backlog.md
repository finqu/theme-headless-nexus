# Storefront page backlog

Statuses: `done` (usable GraphQL-backed UI), `partial` (shell or unused components), `todo`.

Ship the next `todo`/`partial` in **priority order**. One slice per PR.

## P0 — shopper path

| Status  | Slice             | ResourceKind    | Notes                                                                                                                                                            |
| ------- | ----------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| partial | Product PDP       | `PRODUCT`       | `ProductTemplate` fetches via `getProduct`. Gallery, variants, add-to-cart exist. Fill SEO metadata from product fields; wire breadcrumbs to real category URLs. |
| done    | Category          | `PRODUCT_GROUP` | `ProductGroupTemplate` fetches via `GET_PRODUCT_GROUP` / `GET_PRODUCT_GROUP_WITH_PRODUCTS`. Grid, sort, pagination, SEO. Next slice is the live cart page.       |
| partial | Cart page         | `CART`          | `CartProvider` + drawer already call cart mutations. Replace stub `CartTemplate` with live lines, totals, discount code, checkout button → `checkoutUrl`.        |
| todo    | CMS page fallback | `PAGE`          | Queries exist (`PAGE_BY_ID_QUERY`). Render title + HTML content when no Puck config is published.                                                                |
| partial | Catalog           | `PRODUCTS`      | `ProductsTemplate` works. Keep improving sort/filter/pagination against `getCatalogProducts`.                                                                    |

## P1 — find and account

| Status  | Slice                         | ResourceKind                                                    | Notes                                                                         |
| ------- | ----------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| partial | Search                        | `SEARCH`                                                        | Client fetch today. Move listing to RSC + `getCatalogProducts({ query })`.    |
| partial | Login / register              | `LOGIN`, `REGISTER`                                             | Forms are static. Use `customerAccessTokenCreate` / customer create mutation. |
| todo    | Password recover/reset/change | `RECOVER_PASSWORD`, `RESET_PASSWORD`, `CHANGE_PASSWORD`         | Placeholders.                                                                 |
| partial | Account                       | `ACCOUNT`, `ACCOUNT_EDIT`, `ACCOUNT_ORDERS`, `ACCOUNT_WISHLIST` | Shell only. Server helpers: `getCustomerByToken`, `getCustomerOrders`.        |
| todo    | Logout                        | `LOGOUT`                                                        | `customerAccessTokenDelete` + cookie clear.                                   |

## P2 — content

| Status | Slice        | ResourceKind                                                                 | Notes                                                        |
| ------ | ------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| done   | Policies     | `PRIVACY_POLICY`, `SHIPPING_POLICY`, `REFUND_POLICY`, `TERMS_AND_CONDITIONS` | `PolicyTemplate` + `POLICY_QUERY`.                           |
| todo   | Article      | `ARTICLE`                                                                    | `ARTICLE_BY_ID_QUERY`.                                       |
| todo   | Blog index   | `BLOG`                                                                       | Placeholder.                                                 |
| todo   | Manufacturer | `MANUFACTURER`                                                               | Placeholder.                                                 |
| n/a    | Home         | `HOME`                                                                       | `app/page.tsx` + Puck home config.                           |
| n/a    | Checkout     | `CHECKOUT`                                                                   | External. Keep the placeholder or redirect to `checkoutUrl`. |
