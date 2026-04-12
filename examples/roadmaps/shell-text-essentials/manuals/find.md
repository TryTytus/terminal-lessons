# find deep lesson

`find` walks a directory tree and prints paths that match an expression. It answers questions like "where are the Markdown files?" or "which regular files are near the project root?"

## Mental model

- Start with a directory, often `.` or a project folder.
- Add filters such as `-name`, `-type`, and `-maxdepth`.
- Pipe into `sort` when the exact order matters.

```sh
find project -type f -name "*.md" | sort
```

This walks `project`, keeps regular files whose names end in `.md`, and sorts the resulting paths.

## Cheat sheet

| Form | Use it when |
| --- | --- |
| `find .` | You want to see everything below the current directory. |
| `find . -name "*.txt"` | You know the file name or extension pattern. |
| `find . -type f` | You only want regular files. |
| `find . -type d` | You only want directories. |
| `find . -maxdepth 2 -type f` | You only want shallow matches. |

## Name patterns

`-name` uses shell-style glob patterns, not full regular expressions.

```sh
find . -name "*.txt"
```

The quotes matter. Without quotes, the shell may expand `*.txt` before `find` receives it.

## File type filters

```sh
find project -type f
```

Use `-type f` for regular files and `-type d` for directories. This prevents directory names from mixing into file lists.

## Depth filters

```sh
find project -maxdepth 2 -type f
```

Depth limits are useful when a nested dependency folder or build output would make the result too large.

## Practical habit

Build `find` expressions from left to right: start path, depth limit, type filter, then name pattern. Add `| sort` when the result becomes a lesson answer or a saved report.
