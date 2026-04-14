# mv deep lesson

Rename files, confirm replacement, and avoid clobbering existing paths.

## Mental model

- `mv` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `mv <src> <dest>` | Move or rename a file. |
| `mv -i <src> <dest>` | Prompt before overwrite. |
| `mv -n <src> <dest>` | Do not overwrite existing files. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Rename a file | `mv draft.txt final.txt` |
| Confirm a replacement | `mv -i replacement.txt current.txt` |
| Avoid overwriting a file | `mv -n incoming.txt existing.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
