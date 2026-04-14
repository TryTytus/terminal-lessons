# grep

Find matching lines, ignore case, invert matches, recurse, print line numbers, count matches, and use extended patterns.

## Daily forms

- `grep "pattern"` - Search exact text without flags.
- `grep -i pattern <file>` - Match text regardless of case.
- `grep -v pattern <file>` - Keep everything except matching lines.
- `grep -r pattern <file>` - Search recursively in a directory.
- `grep -n pattern <file>` - Show matching line numbers.
- `grep -c pattern <file>` - Count matching lines.
- `grep -E pattern <file>` - Match one of several patterns.

## Example

```sh
grep ERROR app.log > errors.txt
```

## Practice note

Create the requested output file from the command result, then run checks before moving on.
