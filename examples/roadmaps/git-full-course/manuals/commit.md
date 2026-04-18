# git commit deep lesson

Create durable snapshots from staged changes.

## Mental model

- Commits capture index state, not unstaged edits.
- `--amend` rewrites latest commit (new hash).
- `--amend --no-edit` keeps message while replacing content.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git commit -m "msg"` | Create new commit. |
| `git commit --amend -m "msg"` | Rewrite latest message/content. |
| `git commit --amend --no-edit` | Append staged changes to latest commit. |

## Worked examples

```sh
git add README.md
git commit -m "add onboarding notes"
```

```sh
git add README.md
git commit --amend --no-edit
```

## Practice flow

1. Stage intended files.
2. Commit with concise message.
3. Inspect with `git log --oneline -n 1`.
