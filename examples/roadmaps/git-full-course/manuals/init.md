# git init deep lesson

Initialize a directory as a Git repository and set a clean starting point.

## Mental model

- `git init` creates `.git/` metadata and starts history tracking.
- No files are tracked until you run `git add` and `git commit`.
- `git init -b main` makes the first branch name explicit.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git init` | Create repository with system default branch. |
| `git init -b main` | Create repository with `main` as first branch. |

## Worked examples

```sh
git init
git status
```

```sh
git init -b main
git symbolic-ref --short HEAD
```

## Practice flow

1. Initialize repository.
2. Confirm `.git/` exists.
3. Confirm current branch and clean status.
