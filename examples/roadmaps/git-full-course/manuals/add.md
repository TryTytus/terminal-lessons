# git add deep lesson

Stage exactly the content that should appear in the next commit.

## Mental model

- Index (staging area) is the commit preview.
- `git add <file>` is precise and predictable.
- `git add .` includes new files under current path.
- `git add -u` updates tracked files (including deletions), not new untracked files.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git add <path>` | Stage one path. |
| `git add .` | Stage everything under current directory. |
| `git add -u` | Stage tracked-file updates and deletions only. |

## Worked examples

```sh
git add app.txt
git status --short
```

```sh
git add -u
git status --short
```

## Practice flow

1. Edit or create files.
2. Stage with chosen add mode.
3. Verify with `git status --short`.
