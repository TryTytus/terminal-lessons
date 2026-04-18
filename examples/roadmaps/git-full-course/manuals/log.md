# git log deep lesson

Navigate history quickly at different levels of detail.

## Mental model

- `--oneline` is the default scan view.
- `--graph --decorate --all` explains branch topology.
- `-n` narrows focus to recent commits.
- `--stat` adds file-level impact summary.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git log --oneline` | Compact history list. |
| `git log --graph --decorate --all` | Multi-branch history map. |
| `git log -n 5` | Latest N commits only. |
| `git log --stat` | Per-commit file change summary. |

## Worked examples

```sh
git log --oneline --graph --decorate --all
```

```sh
git log -n 3 --stat
```

## Practice flow

1. Read recent commits.
2. Expand to graph when branches diverge.
3. Add `--stat` when inspecting change scope.
