# git restore

Recover file content from index, `HEAD`, or another commit.

## Daily forms

- `git restore <path>` - Discard unstaged edits.
- `git restore --staged <path>` - Unstage file.
- `git restore --source=HEAD~1 <path>` - Restore from older commit.

## Example

```sh
git restore --staged notes.md
```

## Practice note

Use restore when you want to undo file state without moving commits.
