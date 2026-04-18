# git rm

Remove tracked files from index and optionally from disk.

## Daily forms

- `git rm <path>` - Delete tracked file from index and working tree.
- `git rm --cached <path>` - Untrack file but keep local copy.

## Example

```sh
git rm --cached .env.local
```

## Practice note

Combine `--cached` with `.gitignore` for local-only files.
