# ls deep lesson

Inspect directory contents with default, detailed, hidden, human-readable, recursive, and time-sorted listings.

## Mental model

- `ls` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `ls` | Default directory listing. |
| `ls -l` | Long listing format. |
| `ls -a` | Show hidden files. |
| `ls -lh` | Human-readable sizes. |
| `ls -R` | Recursive listing. |
| `ls -t` | Sort listings by time. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| List visible files | `ls pantry > pantry-list.txt` |
| Use long format | `ls -l details > long-listing.txt` |
| Include hidden files | `ls -a config > all-files.txt` |
| Show human-readable sizes | `ls -lh sizes > human-sizes.txt` |
| List directories recursively | `ls -R tree > recursive-listing.txt` |
| Sort by modification time | `touch -t 202001010000 timeline/old.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
