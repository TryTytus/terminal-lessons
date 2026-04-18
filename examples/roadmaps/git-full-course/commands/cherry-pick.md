# git cherry-pick

Copy selected commits to the current branch.

## Daily forms

- `git cherry-pick <commit>` - Apply one commit.
- `git cherry-pick -x <commit>` - Apply commit and record source hash.

## Example

```sh
git cherry-pick -x a1b2c3d
```

## Practice note

Cherry-pick is ideal for hotfix backports across release branches.
