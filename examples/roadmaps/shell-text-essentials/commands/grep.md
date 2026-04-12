# grep

`grep` prints lines that match a pattern. It is one of the fastest ways to filter logs, notes, CSV exports, and command output.

## Daily forms

- `grep ERROR app.log` prints lines containing `ERROR`.
- `grep -i api requests.log` ignores letter case.
- `grep -v DEBUG app.log` keeps lines that do not match `DEBUG`.
- `grep -n timeout app.log` prefixes each match with the line number.
- `grep -E "ERROR|WARN" app.log` enables extended regular expressions.

## Example

```sh
grep -n ERROR app.log
```

```text
3:ERROR database timeout
8:ERROR request failed
```

Short flags such as `-i`, `-v`, `-n`, and `-E` are widely available. GNU grep also exposes long forms such as `--ignore-case`, `--invert-match`, `--line-number`, and `--extended-regexp`.
