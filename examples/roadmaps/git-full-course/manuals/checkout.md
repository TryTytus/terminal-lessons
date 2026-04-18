# git checkout deep lesson

Use legacy checkout for older workflows and compatibility tasks.

## Mental model

- `checkout` can switch branches or restore files.
- This dual behavior is why `switch` and `restore` were introduced.
- Still useful when reading older docs and scripts.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git checkout <branch>` | Switch branch. |
| `git checkout -b <branch>` | Create + switch branch. |
| `git checkout -- <path>` | Restore file from `HEAD`. |

## Worked examples

```sh
git checkout -b hotfix/footer
```

```sh
git checkout -- config.yml
```

## Practice flow

1. Use checkout for branch creation in legacy style.
2. Use checkout file restore and verify content reset.
