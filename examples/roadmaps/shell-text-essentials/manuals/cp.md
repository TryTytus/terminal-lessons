# cp deep lesson

Copy files, copy directory trees, confirm overwrites, and show verbose copy output.

## Mental model

- `cp` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `cp <src> <dest>` | Copy a file. |
| `cp -r <src> <dest>` | Copy directories recursively. |
| `cp -i <src> <dest>` | Prompt before overwrite. |
| `cp -v <src> <dest>` | Print verbose copy output. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Copy one file | `cp original.txt copy.txt` |
| Copy a directory tree | `cp -r source backup` |
| Confirm before overwrite | `cp -i new.txt target.txt` |
| Show copied names | `cp -v invoice.txt invoice-copy.txt > copy.log` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
