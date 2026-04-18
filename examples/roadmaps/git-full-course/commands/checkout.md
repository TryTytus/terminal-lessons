# git checkout

Legacy command for switching branches and restoring files.

## Daily forms

- `git checkout -b <branch>` - Create and switch branch.
- `git checkout <branch>` - Switch branch.
- `git checkout -- <path>` - Restore file from `HEAD`.

## Example

```sh
git checkout -- app.conf
```

## Practice note

In new workflows, use `git switch` and `git restore` instead.
