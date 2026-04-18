# git merge

Integrate changes from one branch into another.

## Daily forms

- `git merge --ff-only <branch>` - Only fast-forward.
- `git merge --no-ff <branch>` - Always create merge commit.
- `git merge --squash <branch>` - Combine branch changes into one commit.

## Example

```sh
git merge --no-ff feature/auth -m "merge feature/auth"
```

## Practice note

Choose strategy intentionally: topology preservation vs linear history.
