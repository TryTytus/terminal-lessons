# wc deep lesson

Count lines, words, and bytes with redirection for clean numeric output.

## Mental model

- `wc` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `wc -l <file>` | Count lines. |
| `wc -w <file>` | Count words. |
| `wc -c <file>` | Count bytes. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Count lines | `wc -l < names.txt > line-count.txt` |
| Count words | `wc -w < sentence.txt > word-count.txt` |
| Count bytes | `wc -c < bytes.txt > byte-count.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
