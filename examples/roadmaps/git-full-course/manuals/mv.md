# git mv deep lesson

Track file moves and renames explicitly.

## Mental model

- `git mv` updates filesystem and stages rename in one command.
- Git may detect renames heuristically even without `git mv`, but explicit rename is clearer.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git mv old new` | Rename tracked file. |
| `git mv file dir/` | Move tracked file to directory. |

## Worked examples

```sh
git mv guide.txt guide-v2.txt
git status --short
```

## Practice flow

1. Commit baseline file.
2. Rename with `git mv`.
3. Confirm rename in short status.
