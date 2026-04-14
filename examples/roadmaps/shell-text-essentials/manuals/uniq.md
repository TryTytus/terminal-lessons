# uniq deep lesson

Remove or count repeated adjacent lines after sorting when needed.

## Mental model

- `uniq` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `uniq <file>` | Remove duplicate adjacent lines. |
| `uniq -c <file>` | Count occurrences of adjacent lines. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Remove adjacent duplicate lines | `uniq repeated.txt > unique.txt` |
| Count adjacent duplicates | `uniq -c grouped.txt > counted.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
