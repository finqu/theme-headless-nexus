---
name: finqu-cli
description: 'Finqu CLI — theme development, storefront scaffolding, authentication, and local development workflow'
---

# Finqu CLI

## When to use

Use this skill when:

- Installing or configuring the Finqu CLI (`@finqu/cli`)
- Authenticating with the Finqu platform via CLI
- Developing Liquid themes locally (configure, dev, deploy)
- Creating or managing headless storefronts via CLI
- Troubleshooting CLI issues

## Inputs required

- **Node.js**: v18+ installed
- **Finqu account**: Valid merchant or partner credentials
- **Store access**: Store URL and credentials for the target store

## Procedure

### 0) Install the CLI

```bash
npm install -g @finqu/cli
```

Verify installation:

```bash
finqu --version
```

### 1) Authenticate

```bash
finqu login
```

Opens a browser for authentication. After logging in, your session is saved locally.

Read: `references/authentication.md`

### 2) Choose your workflow

**Liquid theme development:**

1. Configure the theme connection
2. Start local development server
3. Edit and preview changes
4. Deploy when ready

→ Steps 3–5 below

**Headless storefront:**

1. Create a new storefront project
2. Start development server
3. Deploy

→ Step 6 below

### 3) Configure a theme

```bash
finqu theme configure
```

This connects your local directory to a specific theme on a specific store. Creates/updates `finqu.config.json` with:

- Store URL
- Theme ID
- API credentials

Read: `references/theme-commands.md`

### 4) Develop the theme locally

```bash
finqu theme dev
```

Starts a local development server that:

- Watches for file changes
- Syncs changes to the connected store
- Provides a preview URL

### 5) Deploy the theme

```bash
finqu theme deploy
```

Uploads the current theme files to the connected store. The theme becomes live (or updates the draft, depending on settings).

### 6) Create a storefront (headless)

```bash
finqu storefront create
```

Scaffolds a new headless storefront project. Follow the interactive prompts to configure the project.

Read: `references/storefront-commands.md`

### 7) Configure your project

After setup, your project has a `finqu.config.json`:

```json
{
    "store": "your-store.finqu.com",
    "themeId": "12345"
}
```

Read: `references/configuration.md`

## Verification

- `finqu --version` outputs the installed version
- `finqu login` completes successfully
- `finqu theme configure` creates `finqu.config.json`
- `finqu theme dev` starts the dev server and opens a preview
- `finqu theme deploy` uploads files without errors
- `finqu storefront create` scaffolds a new project

## Failure modes / debugging

- **"command not found: finqu"**: Not installed globally — run `npm install -g @finqu/cli`
- **Authentication fails**: Try `finqu logout` then `finqu login` again
- **Theme configure fails**: Verify store URL and that you have access
- **Dev server errors**: Check Node.js version (v18+ required), check port availability
- **Deploy fails**: Verify config, check network, ensure theme exists on the store

Read: `references/troubleshooting.md`

## Escalation

- See [CLI overview](https://developers.finqu.com/apis-and-tools/cli/overview.md.txt)
- See [CLI reference](https://developers.finqu.com/apis-and-tools/cli.md.txt)
- See [Theme development guide](https://developers.finqu.com/build-with-finqu/themes.md.txt)
