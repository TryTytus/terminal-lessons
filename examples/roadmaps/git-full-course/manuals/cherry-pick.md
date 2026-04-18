# git cherry-pick deep lesson

Copy selected commits across branches without full merge.

## Mental model

- Cherry-pick applies commit patch onto current branch.
- New commit hash is created.
- `-x` appends source reference for auditability.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git cherry-pick <commit>` | Apply one commit. |
| `git cherry-pick -x <commit>` | Apply one commit and record source hash. |
| `git cherry-pick <a>^..<b>` | Apply commit range. |

## Worked examples

```sh
git switch release/1.2
git cherry-pick -x a1b2c3d
```

## Practice flow

1. Locate commit hash with `git log`.
2. Switch to target branch.
3. Cherry-pick and verify with `git log -n 1`.
