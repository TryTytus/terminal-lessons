# awk

Print columns, choose field separators, and match records by pattern.

## Daily forms

- `awk '{print $1}' <file>` - Print a specific column.
- `awk -F, '{print $2}' <file>` - Specify a field separator.
- `awk '/pattern/ {print $0}' <file>` - Print records matching a pattern.

## Example

```sh
awk '{print $1}' people.txt > names.txt
```

## Practice note

Create the requested output file from the command result, then run checks before moving on.
