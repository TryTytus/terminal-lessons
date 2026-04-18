# git show

Display details of commits, tags, and other Git objects.

## Daily forms

- `git show HEAD` - Show latest commit details.
- `git show --stat --oneline HEAD` - Compact header + file stats.
- `git show <tag>` - Show commit pointed by tag.

## Example

```sh
git show --stat --oneline HEAD
```

## Practice note

`git show` is the fastest way to inspect exactly one object.
