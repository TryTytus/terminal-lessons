# sed

Replace text, edit files in place, and delete matching lines.

## Daily forms

- `sed 's/old/new/' <file>` - Replace first occurrence on each line.
- `sed 's/old/new/g' <file>` - Replace all occurrences on each line.
- `sed -i '' 's/old/new/' <file>` - Edit a file in place.
- `sed '/pattern/d' <file>` - Delete matching lines.

## Example

```sh
sed 's/old/new/' words.txt > first-replace.txt
```

## Practice note

macOS/BSD sed uses `sed -i "" ...`; GNU sed commonly accepts `sed -i ...`.
