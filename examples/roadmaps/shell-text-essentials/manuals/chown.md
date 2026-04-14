# chown deep lesson

Practice safe current-user ownership changes without sudo.

## Mental model

- `chown` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `chown user <file>` | Change owner to the current user. |
| `chown user:group <file>` | Change owner and group together. |
| `chown -R user:group <dir>` | Change ownership recursively. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Set the current user as owner | `chown "$(id -un)" report.txt && echo "owner ok" > chown-user.txt` |
| Set current owner and group | `chown "$(id -un):$(id -gn)" package.txt && echo "owner group ok" > chown-user-group.txt` |
| Apply ownership recursively | `chown -R "$(id -un):$(id -gn)" bundle && echo "recursive owner ok" > chown-recursive.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

These lessons use your current user and group so they do not require sudo.
