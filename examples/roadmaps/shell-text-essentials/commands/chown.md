# chown

Practice safe current-user ownership changes without sudo.

## Daily forms

- `chown user <file>` - Change owner to the current user.
- `chown user:group <file>` - Change owner and group together.
- `chown -R user:group <dir>` - Change ownership recursively.

## Example

```sh
chown "$(id -un)" report.txt && echo "owner ok" > chown-user.txt
```

## Practice note

These lessons use your current user and group so they do not require sudo.
