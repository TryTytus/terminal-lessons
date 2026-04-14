# tail deep lesson

Show the last N lines and follow appended log output.

## Mental model

- `tail` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `tail -n <count> <file>` | View the last N lines. |
| `tail -f <file>` | Follow file growth. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Take the last lines | `tail -n 2 access.log > last-two.txt` |
| Follow a growing file | `tail -f live.log > followed.txt &` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

Stop `tail -f` when you are done. In the exercise, `kill "$(cat tail.pid)"` stops the background watcher.
