# chgrp deep lesson

Set file group ownership with the current primary group.

## Mental model

- `chgrp` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `chgrp group <file>` | Change group only. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Set the current group | `chgrp "$(id -gn)" team.txt && echo "group ok" > chgrp-group.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

These lessons use your current primary group so they do not require sudo.
