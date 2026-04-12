# grep deep lesson

`grep` searches text and prints matching lines. In daily terminal work, use it to inspect logs, narrow large files, and filter output from other commands.

## Mental model

- Input is a stream of lines.
- The pattern is tested against each line.
- Matching lines are printed to stdout.
- Redirection such as `>` can save matches into a file.

```sh
grep ERROR app.log > errors.txt
```

This reads `app.log`, keeps lines containing `ERROR`, and writes them into `errors.txt`.

## Cheat sheet

| Form | Use it when |
| --- | --- |
| `grep text file` | You need exact text matches. |
| `grep -i text file` | Capitalization should not matter. |
| `grep -v text file` | You want everything except matching lines. |
| `grep -n text file` | You need original line numbers. |
| `grep -E "A|B" file` | You want an OR pattern or extended regex syntax. |

## Common patterns

### Exact text

```sh
grep ERROR app.log
```

```text
ERROR database timeout
ERROR request failed
```

### Ignore case

```sh
grep -i api requests.log
```

This matches `API`, `api`, and `Api`.

### Invert matches

```sh
grep -v DEBUG app.log
```

This keeps non-debug lines, which is useful when a noisy log level hides the signal.

### Extended regular expressions

```sh
grep -E "WARN|ERROR" app.log
```

Quote the pattern so the shell does not interpret `|` as a pipeline.

## Practical habit

Start with the smallest pattern that proves the idea, then add flags. If the output will be checked or shared, redirect it into a named file.
