# git mv

Rename or move tracked files while staging the rename.

## Daily forms

- `git mv old.txt new.txt` - Rename tracked file.
- `git mv src/app.js src/legacy/app.js` - Move tracked path.

## Example

```sh
git mv guide.txt guide-v2.txt
```

## Practice note

`git mv` is equivalent to move + add + rm, but clearer in history.
