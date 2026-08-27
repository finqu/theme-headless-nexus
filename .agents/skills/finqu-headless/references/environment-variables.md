# Environment Variables

Required and optional environment variables for Finqu headless storefronts.

## Required Variables

| Variable                   | Description                                                  | Example                |
| -------------------------- | ------------------------------------------------------------ | ---------------------- |
| `FINQU_STOREFRONT_API_KEY` | Storefront API key from Channel settings (starts with `fq_`) | `fq_OPmgGrIY...`       |
| `FINQU_STORE_DOMAIN`       | Your store's domain                                          | `your-store.finqu.com` |

## Setup

Create a `.env.local` file in the project root (do not commit this file):

```bash
FINQU_STOREFRONT_API_KEY=fq_your_api_key_here
FINQU_STORE_DOMAIN=your-store.finqu.com
```

## Getting Your API Key

1. Log in to the Finqu admin
2. Go to **Channel settings**
3. Find or create a Storefront API key
4. Copy the key (prefixed with `fq_`)

## Security

- **Never commit API keys** to version control
- Add `.env.local` to `.gitignore`
- Use environment-specific configs for staging/production
- For production, set variables in your hosting platform's environment settings

## Full Reference

- [Storefront authentication](https://developers.finqu.com/build-with-finqu/storefront/authentication.md.txt)
