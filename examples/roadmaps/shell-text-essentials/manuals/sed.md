# sed deep lesson

Replace text, edit files in place, and delete matching lines.

## Mental model

- `sed` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `sed 's/old/new/' <file>` | Replace first occurrence on each line. |
| `sed 's/old/new/g' <file>` | Replace all occurrences on each line. |
| `sed -i '' 's/old/new/' <file>` | Edit a file in place. |
| `sed '/pattern/d' <file>` | Delete matching lines. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Replace the first match on each line | `sed 's/old/new/' words.txt > first-replace.txt` |
| Replace every match on a line | `sed 's/old/new/g' words.txt > all-replaced.txt` |
| Edit a file in place | `sed -i '' 's/draft/final/' status.txt` |
| Delete matching lines | `sed '/DEBUG/d' app.log > clean.log` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

macOS/BSD sed uses `sed -i "" ...`; GNU sed commonly accepts `sed -i ...`.
