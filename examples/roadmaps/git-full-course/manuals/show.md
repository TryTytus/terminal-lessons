# git show deep lesson

Inspect one Git object with content and metadata.

## Mental model

- `git show HEAD` is commit-focused inspection.
- `--stat` provides compact per-file summary.
- Works with commits, tags, and blobs.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git show HEAD` | Show full latest commit details. |
| `git show --stat --oneline HEAD` | One-line header + stats. |
| `git show <tag>` | Show tag target commit and tag metadata. |

## Worked examples

```sh
git show --name-only --pretty=format: HEAD
```

```sh
git show --stat --oneline HEAD
```

## Practice flow

1. Pick object (`HEAD`, hash, or tag).
2. Inspect details and file list.
3. Use output to confirm what exactly changed.
