# chmod deep lesson

Add execute bits, use symbolic changes, numeric modes, and recursive permission updates.

## Mental model

- `chmod` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `chmod +x <path>` | Add execute permission. |
| `chmod u+rw,g-w <path>` | Apply symbolic user/group permission changes. |
| `chmod 755 <path>` | Use octal mode 755. |
| `chmod 644 <path>` | Use octal mode 644. |
| `chmod -R <mode> <dir>` | Change permissions recursively. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Add execute permission | `chmod +x run.sh` |
| Adjust user and group bits | `chmod u+rw,g-w team.txt` |
| Set executable numeric mode | `chmod 755 tool.sh` |
| Set readable numeric mode | `chmod 644 notes.txt` |
| Change modes recursively | `chmod -R 755 tools` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.

## Safety note

Permission exercises use local lesson files. Avoid applying recursive permission changes outside the workspace.
