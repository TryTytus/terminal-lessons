# git bisect

Find the first bad commit with binary search.

## Daily forms

- `git bisect start` - Begin bisect session.
- `git bisect bad` - Mark current commit as bad.
- `git bisect good <commit>` - Mark known good commit.
- `git bisect run <command>` - Automate test command.
- `git bisect reset` - End session and return to original branch.

## Example

```sh
git bisect start
git bisect bad
git bisect good HEAD~3
git bisect run sh check.sh
```

## Practice note

Keep your bisect test command deterministic and fast.
