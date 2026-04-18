# git status deep lesson

Read the exact state of your working tree and index.

## Mental model

- First column in short status is staged state.
- Second column is unstaged working-tree state.
- `??` means untracked path.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git status` | Human-friendly full state output. |
| `git status --short` | Two-column machine-friendly summary. |
| `git status -sb` | Branch header plus short summary. |

## Worked examples

```sh
git status --short
# M notes.txt   -> unstaged edit
#M  notes.txt   -> staged edit
#?? draft.txt   -> untracked
```

## Practice flow

1. Run status before any change.
2. Stage files.
3. Re-run status and verify transitions.
