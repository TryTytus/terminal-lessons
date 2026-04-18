# git tag deep lesson

Attach memorable labels to commits, usually for releases.

## Mental model

- Lightweight tag: just a named pointer.
- Annotated tag: full object with message, author, date.
- Release workflows typically use annotated tags.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git tag v1.0.0` | Create lightweight tag. |
| `git tag -a v1.0.0 -m "release"` | Create annotated tag. |
| `git tag -l "v1.*"` | List matching tags. |

## Worked examples

```sh
git tag v0.9.0
git tag -a v1.0.0 -m "release 1.0.0"
```

```sh
git show v1.0.0
```

## Practice flow

1. Ensure release commit is checked out.
2. Create tag.
3. Verify with `git tag --list` and `git show`.
