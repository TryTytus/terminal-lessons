# git reset

Move `HEAD` and optionally reset index and working tree.

## Daily forms

- `git reset --soft HEAD~1` - Move `HEAD`, keep staged changes.
- `git reset --mixed HEAD~1` - Move `HEAD`, keep unstaged changes.
- `git reset --hard HEAD~1` - Move `HEAD` and discard worktree/index changes.
- `git reset HEAD <path>` - Unstage one file.

## Example

```sh
git reset --mixed HEAD~1
```

## Practice note

Use `--hard` only when you are sure you can discard local work.
