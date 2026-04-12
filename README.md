# Terminal Lessons

Desktop app for learning terminal commands through task-based practice.

## Stack

- Wails v2 desktop shell
- Go backend with `github.com/creack/pty` for local POSIX PTY sessions
- React + TypeScript frontend
- Xterm.js terminal pane
- shadcn/ui-style local components

## Development

The current workspace was scaffolded manually because this shell does not have `go` or `wails` on PATH. Install prerequisites before running the full app:

```bash
go version
wails version
npm -v
```

After Go and Wails v2 are available:

```bash
wails doctor
pnpm --dir frontend install
wails dev
```

## Lesson Import

The app imports YAML lessons generated outside the app. See `docs/lesson-authoring.md` and `docs/lesson.schema.json`.

Try `examples/sort-files.yaml` after starting the app.

## Roadmap Import

The app also imports roadmap folders. A roadmap folder contains `roadmap.yaml`,
short Markdown command guides, optional full command manuals, and lesson YAML
files. See `docs/roadmap-authoring.md` and `docs/roadmap.schema.json`.

Try importing `examples/roadmaps/shell-text-essentials` after starting the app.
