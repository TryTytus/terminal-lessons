# chgrp

Set file group ownership with the current primary group.

## Daily forms

- `chgrp group <file>` - Change group only.

## Example

```sh
chgrp "$(id -gn)" team.txt && echo "group ok" > chgrp-group.txt
```

## Practice note

These lessons use your current primary group so they do not require sudo.
