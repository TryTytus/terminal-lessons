# sort deep lesson

Sort lines alphabetically, numerically, in reverse, and by a chosen field.

## Mental model

- `sort` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `sort <file>` | Default alphabetical sort. |
| `sort -n <file>` | Numerical sort. |
| `sort -r <file>` | Reverse sort. |
| `sort -k <file>` | Sort records by a specific field. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Sort alphabetically | `sort names.txt > sorted-names.txt` |
| Sort numbers numerically | `sort -n ports.txt > sorted-ports.txt` |
| Sort in reverse order | `sort -r names.txt > reverse-names.txt` |
| Sort by a field | `sort -k2,2 scores.txt > by-name.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
