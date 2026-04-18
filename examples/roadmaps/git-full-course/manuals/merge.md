# git merge deep lesson

Integrate one branch into another while choosing history shape intentionally.

## Mental model

- Merge preserves original branch topology.
- Fast-forward merge only moves a pointer when no divergence exists.
- `--no-ff` forces a merge commit for explicit integration points.
- `--squash` collects branch changes into one staged change set and requires a new commit.

## Merge vs Rebase vs Squash (ASCII)

### Merge (`git merge --no-ff feature`)

```text
A---B---C  main
     \   \
      D---E  feature
           \
            M   (merge commit)
```

### Rebase (`git rebase main` on feature)

```text
A---B---C  main
         \
          D'--E'  feature
```

### Squash merge (`git merge --squash feature` then `git commit`)

```text
A---B---C---S  main
     \     \
      D-----E  feature (original commits not merged as topology)
```

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git merge --ff-only <branch>` | Enforce fast-forward only. |
| `git merge --no-ff <branch>` | Always create merge commit. |
| `git merge --squash <branch>` | Apply branch changes as one commit. |

## Worked examples

```sh
git switch main
git merge --ff-only feature/docs
```

```sh
git switch main
git merge --no-ff feature/api -m "merge feature/api"
```

```sh
git switch main
git merge --squash feature/ui
git commit -m "squash feature/ui"
```

## Practice flow

1. Identify if branch diverged from target.
2. Choose strategy: preserve topology, linearize, or squash.
3. Verify result with `git log --graph --oneline --decorate --all`.
