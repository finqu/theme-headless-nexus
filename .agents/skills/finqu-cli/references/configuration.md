# Configuration

The `finqu.config.json` configuration file.

## Location

Created in your project root by `finqu theme configure` or `finqu storefront create`.

## Theme Configuration

```json
{
    "store": "your-store.finqu.com",
    "themeId": "12345"
}
```

| Field     | Description               |
| --------- | ------------------------- |
| `store`   | The store's domain        |
| `themeId` | ID of the connected theme |

## Environment Variables

For sensitive values (API keys, tokens), use environment variables instead of config files:

```bash
FINQU_STORE_URL=your-store.finqu.com
FINQU_API_KEY=your_api_key
```

## .gitignore

Always add sensitive config to `.gitignore`:

```
finqu.config.json
.env
.env.local
```

## Full Reference

- [CLI configuration](https://developers.finqu.com/apis-and-tools/cli/overview.md.txt)
