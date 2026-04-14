# chmod

Add execute bits, use symbolic changes, numeric modes, and recursive permission updates.

## Daily forms

- `chmod +x <path>` - Add execute permission.
- `chmod u+rw,g-w <path>` - Apply symbolic user/group permission changes.
- `chmod 755 <path>` - Use octal mode 755.
- `chmod 644 <path>` - Use octal mode 644.
- `chmod -R <mode> <dir>` - Change permissions recursively.

## Example

```sh
chmod +x run.sh
```

## Practice note

Permission exercises use local lesson files. Avoid applying recursive permission changes outside the workspace.
