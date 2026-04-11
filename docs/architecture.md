# Architecture

Terminal Lessons is a Wails v2 desktop application for practicing terminal commands through imported YAML lessons and a real local PTY.

## Frontend

The frontend lives in `frontend/` and uses React, TypeScript, Vite, Xterm.js, and local shadcn/ui-style components.

Key responsibilities:
- Render the lesson list, task details, hints, solution, check results, and terminal pane.
- Initialize Xterm.js, fit it to the available space, forward user input to Go, and write PTY output back into the terminal.
- Call Wails bound methods from `frontend/wailsjs/go/main/App`.
- Subscribe to Wails runtime events through `frontend/src/lib/events.ts`.

## Backend

The backend is Go and Wails v2.

Key packages:
- `internal/lessons`: YAML lesson structs, parsing, validation, safe path checks, and imported lesson storage.
- `internal/workspace`: creates fresh temporary lesson workspaces and workspace-local home directories.
- `internal/checks`: runs declarative checks against files and the bounded terminal transcript.
- `internal/terminal`: starts local PTY sessions with `github.com/creack/pty`, streams output, handles input/resize, stores bounded transcript, and stops sessions.

The app targets macOS/Linux for the MVP. Windows/WSL is intentionally out of scope until a later adapter exists.

## Wails Bound Methods

- `ImportLesson(path string) (*lessons.Summary, error)`: import and validate a YAML lesson from a filesystem path.
- `SelectAndImportLesson() (*lessons.Summary, error)`: open a native file dialog and import the selected YAML lesson.
- `ListLessons() ([]lessons.Summary, error)`: list imported lessons.
- `StartLesson(lessonID string) (*LessonSessionState, error)`: create a fresh workspace and PTY session for an imported lesson.
- `TerminalInput(sessionID string, data string) error`: write frontend terminal input to the PTY.
- `TerminalResize(sessionID string, cols int, rows int) error`: resize the PTY.
- `RunChecks(sessionID string) ([]checks.Result, error)`: evaluate lesson checks against workspace files and transcript.
- `ResetLesson(sessionID string) (*LessonSessionState, error)`: stop the current session, delete its workspace, and start a fresh session for the same lesson.
- `StopLesson(sessionID string) error`: stop the PTY and remove the workspace.

After changing these methods or exported Go structs used by the frontend, remind the user to run `wails generate module`.

## Wails Event Payloads

`terminal:output`
```ts
{
  sessionID: string
  data: string
}
```

`terminal:exit`
```ts
{
  sessionID: string
  exitCode: number
}
```

`terminal:error`
```ts
{
  sessionID: string
  message: string
}
```

`lesson:state`
```ts
// Either an imported lesson summary or an active session state.
LessonSummary | LessonSessionState
```

`checks:result`
```ts
{
  sessionID: string
  results: Array<{
    type: string
    path?: string
    passed: boolean
    message: string
  }>
}
```

## Lesson Format

Lessons are YAML files generated outside the app. They are imported and validated before use. The app never executes arbitrary test code from lesson YAML.

```yaml
version: 1
id: "sort-files-001"
title: "Sortowanie nazw plikow"
commands: ["cat", "sort"]
difficulty: "beginner"
intro: "Utworz plik sorted.txt z alfabetycznie posortowana lista nazw z pliku names.txt."
workspace:
  files:
    - path: "names.txt"
      content: "zeta.txt\nalpha.txt\nbeta.txt\n"
hints:
  - "Zacznij od cat names.txt."
  - "Pipe moze polaczyc cat z sort."
solution:
  commands:
    - "cat names.txt | sort > sorted.txt"
  explanation: "sort porzadkuje linie alfabetycznie, a > zapisuje wynik."
checks:
  - type: "file_equals"
    path: "sorted.txt"
    expected: "alpha.txt\nbeta.txt\nzeta.txt\n"
```

Permitted checks:
- `file_exists`
- `file_not_exists`
- `file_equals`
- `file_contains`
- `stdout_contains`
- `stdout_matches`

## Security Boundaries

The local PTY is not a hard sandbox. The app reduces risk by creating a fresh temporary workspace, setting the PTY working directory to that workspace, setting `HOME` to a workspace-local `.home`, using bounded transcript capture, and rejecting unsafe lesson paths. A learner can still manually type destructive absolute-path commands in the terminal, so this MVP should be treated as local trusted-user software.
