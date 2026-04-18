# git branch deep lesson

Manage local branch lifecycle cleanly.

## Mental model

- Branches are movable pointers to commits.
- Creating branch does not switch branch.
- Rename with `-m` to keep branch history under new name.
- Delete with `-d` only after merge.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git branch` | List local branches. |
| `git branch <name>` | Create branch pointer. |
| `git branch -m <old> <new>` | Rename branch. |
| `git branch -d <name>` | Delete merged branch. |

## Worked examples

```sh
git branch feature/billing
git branch -m feature/billing feature/invoices
```

## Practice flow

1. Create branch.
2. Switch to it and do work.
3. Merge back and delete safely.
