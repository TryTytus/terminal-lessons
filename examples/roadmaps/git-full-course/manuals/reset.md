# git reset deep lesson

Move `HEAD` pointer and optionally index/working tree state.

## Mental model

- `--soft`: move `HEAD`, keep staged changes.
- `--mixed` (default): move `HEAD`, unstage changes, keep worktree edits.
- `--hard`: move `HEAD`, reset index and worktree (destructive).
- `git reset HEAD <file>` unstages one file without moving `HEAD`.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git reset --soft HEAD~1` | Undo commit, keep staged diff. |
| `git reset --mixed HEAD~1` | Undo commit, keep unstaged diff. |
| `git reset --hard HEAD~1` | Undo commit and discard local changes. |
| `git reset HEAD <path>` | Unstage selected file. |

## Worked examples

```sh
git reset --soft HEAD~1
git status --short
```

```sh
git reset HEAD notes.txt
git status --short
```

## Safety note

`--hard` is irreversible for uncommitted work unless recoverable via reflog.
