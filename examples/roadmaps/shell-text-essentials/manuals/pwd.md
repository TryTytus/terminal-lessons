# pwd deep lesson

Show the current working directory and resolve physical paths through symlinks.

## Mental model

- `pwd` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `pwd` | Print the current working directory. |
| `pwd -P` | Resolve symlinks in the current path. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Save the current directory | `pwd > current-dir.txt` |
| Resolve a symlinked path | `pwd -P > ../../physical-path.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
