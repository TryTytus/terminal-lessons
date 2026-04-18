# git bisect deep lesson

Locate regression-introducing commits via binary search.

## Mental model

- Mark one known bad commit and one known good commit.
- Git checks midpoint commit repeatedly.
- `git bisect run <cmd>` automates good/bad classification using exit codes.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git bisect start` | Begin bisect session. |
| `git bisect bad` | Mark current commit as bad. |
| `git bisect good <rev>` | Mark known good revision. |
| `git bisect run <command>` | Auto-test each candidate commit. |
| `git bisect reset` | End bisect and restore original branch. |

## Worked examples

```sh
git bisect start
git bisect bad
git bisect good HEAD~4
git bisect run sh check.sh
git bisect reset
```

## Practice flow

1. Build deterministic test command.
2. Start bisect with good/bad bounds.
3. Let Git isolate first bad commit.
4. Reset bisect state when done.
