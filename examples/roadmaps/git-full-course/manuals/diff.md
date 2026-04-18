# git diff deep lesson

Inspect line-by-line changes before integrating them into history.

## Mental model

- `git diff` compares working tree vs index.
- `git diff --staged` compares index vs `HEAD`.
- `git diff --stat` gives fast magnitude summary.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git diff` | Unstaged content differences. |
| `git diff --staged` | Staged content differences. |
| `git diff --stat` | Per-file additions/deletions summary. |

## Worked examples

```sh
git diff > patch.txt
git diff --staged > staged.patch
```

## Practice flow

1. Edit file.
2. Inspect unstaged diff.
3. Stage file and inspect staged diff.
