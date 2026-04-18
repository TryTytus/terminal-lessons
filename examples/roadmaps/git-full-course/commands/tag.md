# git tag

Mark important commits such as releases.

## Daily forms

- `git tag v1.2.0` - Lightweight tag.
- `git tag -a v1.2.0 -m "release"` - Annotated tag.
- `git tag -l "v1.*"` - List tags by pattern.

## Example

```sh
git tag -a v1.0.0 -m "release 1.0.0"
```

## Practice note

Use annotated tags for releases because they carry metadata.
