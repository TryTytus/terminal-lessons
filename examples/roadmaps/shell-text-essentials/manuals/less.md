# less deep lesson

Open longer text interactively, search inside it, and quit back to the shell.

## Mental model

- `less` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `less <file>` | Navigate and search in less. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Search inside a pager | `less release-notes.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

Inside `less`, `/text` searches and `q` returns to the shell.
