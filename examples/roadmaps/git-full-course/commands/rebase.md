# git rebase

Replay commits on top of another base commit.

## Daily forms

- `git rebase main` - Replay current branch commits on top of `main`.
- `git rebase --onto main old-base topic` - Move a commit range.
- `git rebase --abort` - Cancel an in-progress rebase.
- `git rebase --continue` - Continue after conflict resolution.

## Example

```sh
git rebase main
```

## Practice note

Rebase rewrites commit hashes. Avoid rebasing shared published branches.
