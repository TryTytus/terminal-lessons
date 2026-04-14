# grep deep lesson

Find matching lines, ignore case, invert matches, recurse, print line numbers, count matches, and use extended patterns.

## Mental model

- `grep` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `grep "pattern"` | Search exact text without flags. |
| `grep -i pattern <file>` | Match text regardless of case. |
| `grep -v pattern <file>` | Keep everything except matching lines. |
| `grep -r pattern <file>` | Search recursively in a directory. |
| `grep -n pattern <file>` | Show matching line numbers. |
| `grep -c pattern <file>` | Count matching lines. |
| `grep -E pattern <file>` | Match one of several patterns. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Search exact text | `grep ERROR app.log > errors.txt` |
| Ignore letter case | `grep -i api requests.log > api-lines.txt` |
| Exclude matching lines | `grep -v DEBUG app.log > clean.log` |
| Search recursively | `grep -r TODO notes > todos.txt` |
| Show line numbers | `grep -n timeout service.log > timeout-lines.txt` |
| Count matching lines | `grep -c ERROR app.log > error-count.txt` |
| Match one of several patterns | `grep -E "WARN\|ERROR" app.log > alerts.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
