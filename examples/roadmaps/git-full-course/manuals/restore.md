# git restore deep lesson

Undo file-level state in working tree or index.

## Mental model

- `git restore <path>` resets working tree file to index state.
- `git restore --staged <path>` unstages while keeping file edits.
- `git restore --source=<rev> <path>` pulls content from another commit.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git restore <path>` | Discard unstaged edits. |
| `git restore --staged <path>` | Remove staged copy from index. |
| `git restore --source=HEAD~1 <path>` | Restore file from prior commit. |

## Worked examples

```sh
git restore README.md
git restore --staged README.md
git restore --source=HEAD~1 README.md
```

## Practice flow

1. Make edits.
2. Stage and unstage intentionally.
3. Restore from specific source revision.
