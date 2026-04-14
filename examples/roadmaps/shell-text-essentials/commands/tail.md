# tail

Show the last N lines and follow appended log output.

## Daily forms

- `tail -n <count> <file>` - View the last N lines.
- `tail -f <file>` - Follow file growth.

## Example

```sh
tail -n 2 access.log > last-two.txt
```

## Practice note

Stop `tail -f` when you are done. In the exercise, `kill "$(cat tail.pid)"` stops the background watcher.
