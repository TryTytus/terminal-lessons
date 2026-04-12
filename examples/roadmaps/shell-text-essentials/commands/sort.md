# sort

`sort` orders lines from a file or pipeline. It is often paired with `grep`, `find`, `cut`, and `uniq` to make output deterministic and easier to compare.

## Daily forms

- `sort names.txt` sorts lines alphabetically.
- `sort -n scores.txt` sorts numbers by numeric value.
- `sort -r names.txt` reverses the sorted order.
- `sort -k2 roster.txt` sorts by the second whitespace-separated field.

## Example

```sh
sort -k2,2 -n sales.tsv
```

```text
west 9
north 12
south 27
```

Short flags such as `-n`, `-r`, and `-k` are reliable across common Unix environments. GNU sort also has long aliases such as `--numeric-sort` and `--reverse`.
