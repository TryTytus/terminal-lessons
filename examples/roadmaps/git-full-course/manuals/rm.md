# git rm deep lesson

Remove tracked files intentionally from repo history progression.

## Mental model

- `git rm` removes from disk and stages deletion.
- `git rm --cached` keeps file on disk but untracks it.
- Pair `--cached` with `.gitignore` for local-only files.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git rm <path>` | Delete tracked file and stage delete. |
| `git rm --cached <path>` | Untrack file only from index. |

## Worked examples

```sh
git rm old.txt
git rm --cached .env.local
```

## Practice flow

1. Commit baseline tracked file.
2. Remove with chosen mode.
3. Inspect staged result in `git status --short`.
