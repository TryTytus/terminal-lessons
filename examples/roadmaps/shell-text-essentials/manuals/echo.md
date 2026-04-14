# echo deep lesson

Print text to stdout and use escapes when the shell supports them.

## Mental model

- `echo` is practiced as small, observable terminal tasks.
- Each exercise isolates one form or flag so the behavior is easy to see.
- Redirect output into the named answer file when the prompt asks for a saved result.
- Inspect your work with simple commands before running checks.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `echo "string"` | Print a string. |
| `echo -e` | Interpret backslash escapes. |

## Worked examples

| Exercise | Command to notice |
| --- | --- |
| Write a simple string | `echo "ship it" > message.txt` |
| Use backslash escapes | `echo -e "red\nblue" > colors.txt` |

## Practice flow

1. Read the task and identify the one command form being practiced.
2. Run the command in the lesson workspace.
3. Save the answer file exactly where the task asks for it.
4. Run checks and adjust the command, not the lesson files.
