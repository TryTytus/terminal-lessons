# find

`find` walks directories and prints paths that match conditions. It is useful when a file name, extension, or location is more important than the file contents.

## Daily forms

- `find .` lists everything below the current directory.
- `find . -name "*.txt"` matches names with a shell-style pattern.
- `find . -type f` keeps only regular files.
- `find . -type d` keeps only directories.
- `find . -maxdepth 2 -type f` limits the search depth before filtering.

## Example

```sh
find . -maxdepth 2 -type f -name "*.md" | sort
```

```text
./docs/architecture.md
./docs/lesson-authoring.md
./README.md
```

`find` uses expression-style parameters. Patterns for `-name` are shell globs, so `*.txt` means names ending with `.txt`.
