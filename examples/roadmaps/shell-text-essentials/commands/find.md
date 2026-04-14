# find

Walk directory trees and filter by name, case, type, age, size, depth, and actions.

## Daily forms

- `find .` - List everything below a directory.
- `find . -name ...` - Find by exact name.
- `find . -iname ...` - Find names case-insensitively.
- `find . -type f ...` - Find files only.
- `find . -type d ...` - Find directories only.
- `find . -mtime ...` - Find by modification time.
- `find . -size ...` - Find by file size.
- `find . -exec ...` - Execute a command for each found path.

## Example

```sh
find project | sort > tree.txt
```

## Practice note

Build expressions from left to right and quote globs such as `"*.tmp"` so the shell does not expand them first.
