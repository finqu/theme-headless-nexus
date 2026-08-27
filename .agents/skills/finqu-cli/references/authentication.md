# Authentication

How to authenticate with the Finqu platform using the CLI.

## Login

```bash
finqu login
```

This opens a browser window for authentication. After successful login, your credentials are stored locally for subsequent commands.

## Logout

```bash
finqu logout
```

Clears stored credentials.

## Session Management

- Sessions persist across terminal sessions
- If a session expires, re-run `finqu login`
- Each machine/environment needs its own login

## Full Reference

- [CLI authentication](https://developers.finqu.com/apis-and-tools/cli/overview.md.txt)
