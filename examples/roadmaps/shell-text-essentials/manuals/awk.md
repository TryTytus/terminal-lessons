# awk deep lesson

Print columns, choose field separators, and match records by pattern.

## Mental model

- `awk` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `awk '{print $1}' <file>` | Print a specific column. |
| `awk -F, '{print $2}' <file>` | Specify a field separator. |
| `awk '/pattern/ {print $0}' <file>` | Print records matching a pattern. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Print the first column | `awk '{print $1}' people.txt > names.txt` |
| Use a custom field separator | `awk -F, 'NR>1 {print $2}' inventory.csv > item-names.txt` |
| Print records matching a pattern | `awk '/ERROR/ {print $0}' app.log > awk-errors.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
