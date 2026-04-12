# sort deep lesson

`sort` orders lines. It is useful by itself, but it becomes more powerful when paired with `find`, `grep`, `cut`, and `uniq`.

## Mental model

- Input is a stream of lines.
- By default, lines are sorted as text.
- Flags change the comparison: numeric, reverse, or field-based.
- Output goes to stdout unless you redirect it.

```sh
sort names.txt > sorted-names.txt
```

## Cheat sheet

| Form | Use it when |
| --- | --- |
| `sort file` | Alphabetical text order is enough. |
| `sort -n file` | Lines are numbers. |
| `sort -r file` | You want descending or reverse order. |
| `sort -k2,2 file` | Records should be ordered by the second field only. |

## Alphabetical sorting

```sh
sort names.txt
```

This is the default behavior and works well for filenames, labels, and simple lists.

## Numeric sorting

```sh
sort -n ports.txt
```

Plain text sorting can put `3000` before `443`. Numeric sorting compares number values instead.

## Reverse order

```sh
sort -r names.txt
```

Reverse order is useful for descending lists, latest-looking labels, and quick ranking when paired with numeric sorting.

## Field sorting

```sh
sort -k2,2 scores.txt
```

Fields are whitespace-separated by default. `-k2,2` means "start at field 2 and stop at field 2", so only the second field controls the order.

## Practical habit

Use `sort` before writing files that will be checked, compared, or committed. Stable order makes shell work easier to verify.
