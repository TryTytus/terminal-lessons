# git switch deep lesson

Use modern branch-switching commands for clarity.

## Mental model

- `switch` focuses only on branch movement.
- `-c` combines create + switch.
- Safer and more explicit than overloaded `checkout`.

## Cheat sheet

| Form | Practice target |
| --- | --- |
| `git switch <branch>` | Move to existing branch. |
| `git switch -c <branch>` | Create and move to new branch. |
| `git switch -` | Return to previous branch. |

## Worked examples

```sh
git switch -c feature/navbar
git switch main
git switch -
```

## Practice flow

1. Start from `main`.
2. Create feature branch with `-c`.
3. Switch between branches and verify with `git branch --show-current`.
