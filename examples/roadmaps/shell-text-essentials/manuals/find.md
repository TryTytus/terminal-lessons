# find deep lesson

Walk directory trees and filter by name, case, type, age, size, depth, and actions.

## Mental model

- `find` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `find .` | List everything below a directory. |
| `find . -name ...` | Find by exact name. |
| `find . -iname ...` | Find names case-insensitively. |
| `find . -type f ...` | Find files only. |
| `find . -type d ...` | Find directories only. |
| `find . -mtime ...` | Find by modification time. |
| `find . -size ...` | Find by file size. |
| `find . -exec ...` | Execute a command for each found path. |
| `find . -maxdepth ...` | Limit search depth. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| List a project tree | `find project \| sort > tree.txt` |
| Find an exact file name | `find project -name "target.txt" \| sort > targets.txt` |
| Find names ignoring case | `find repo -iname "readme.md" \| sort > readmes.txt` |
| Find regular files only | `find project -type f \| sort > files-only.txt` |
| Find directories only | `find project -type d \| sort > directories.txt` |
| Find old files by modification time | `find logs -type f -mtime +30 \| sort > stale.txt` |
| Find files by size | `find files -type f -size +20c \| sort > large-files.txt` |
| Run a command on matches | `find scratch -name "*.tmp" -exec rm {} \;` |
| Limit search depth | `find project -maxdepth 2 -type f \| sort > shallow-files.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

Build expressions from left to right and quote globs such as `"*.tmp"` so the shell does not expand them first.
