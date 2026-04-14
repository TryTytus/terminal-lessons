# rm deep lesson

Delete files, confirm interactive deletion, remove directory trees, and force missing-file cleanup.

## Mental model

- `rm` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `rm <file>` | Remove a file. |
| `rm -i <path>` | Interactive removal. |
| `rm -r <path>` | Remove directories recursively. |
| `rm -f <path>` | Force removal and ignore missing paths. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Remove one file | `rm trash.txt` |
| Confirm before removing | `rm -i old.txt` |
| Remove a directory tree | `rm -r build` |
| Ignore missing files | `rm -f missing.txt && echo "force ok" > rm-force.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

Stay inside the lesson workspace and check the path before pressing Enter. `rm` removes names immediately.
