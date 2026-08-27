# Troubleshooting

Common CLI issues and how to resolve them.

## "command not found: finqu"

The CLI is not installed globally.

```bash
npm install -g @finqu/cli
```

If using `npx`:

```bash
npx @finqu/cli --version
```

## Authentication Issues

**Session expired:**

```bash
finqu logout
finqu login
```

**Browser doesn't open:**

- Try a different browser
- Check if a firewall is blocking localhost

## Node.js Version

The CLI requires **Node.js v18+**.

```bash
node --version
```

If too old, update Node.js via nvm, Homebrew, or the official installer.

## Theme Dev Server Issues

**Port already in use:**

```bash
finqu theme dev --port 3001
```

**Changes not syncing:**

- Check network connectivity
- Verify `finqu.config.json` is correct
- Try restarting the dev server

## Deploy Failures

- Verify you're authenticated (`finqu login`)
- Check `finqu.config.json` exists and is valid
- Ensure the theme still exists on the store
- Check for file size limits or invalid file types

## Full Reference

- [CLI overview](https://developers.finqu.com/apis-and-tools/cli/overview.md.txt)
