# git rebase deep lesson

Replay commits onto a new base to linearize history.

## Mental model

- Rebase copies commits and changes hashes.
- Safe for local/private branches; risky for already-shared branches.
- Conflict loop: resolve files -> `git add` -> `git rebase --continue`.
- `--abort` restores branch to pre-rebase state.

## Core patterns

| Form | Practice target |
| --- | --- |
| `git rebase main` | Replay current branch onto `main`. |
| `git rebase --onto <newbase> <oldbase> <branch>` | Move selected commit range. |
| `git rebase --abort` | Cancel and roll back current rebase session. |
| `git rebase --continue` | Continue after conflict resolution. |

## `--onto` shape (ASCII)

```text
Before:
A---B---C---D main
     \
      E---F---G topic

Command:
git rebase --onto D B topic

After:
A---B---C---D main
             \
              E'--F'--G' topic
```

## Rebase vs merge quick contrast

```text
merge:   preserves branching history with merge commit M
rebase:  rewrites feature commits (D,E -> D',E') on new base
```

## Worked examples

```sh
git switch feature/search
git rebase main
```

```sh
# during conflict
# edit files, remove conflict markers
git add app.txt
git rebase --continue
```

## Practice flow

1. Rebase only clean working tree.
2. Resolve conflicts commit-by-commit.
3. Inspect rewritten history with `git log --oneline --graph --all`.
