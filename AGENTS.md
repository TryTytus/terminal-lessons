# Terminal Lessons Project Memory

This file is permanent project context for AI agents working in this repository. Update it whenever a phase is completed, a feature is added, or an architectural decision changes.

## Project Summary & Core Concept

Terminal Lessons is a Wails v2 desktop app for learning terminal commands through task-based practice. Learners import AI-generated YAML lessons, start a fresh local practice workspace, use an active Xterm.js terminal, and run declarative checks that validate files or terminal output.

The MVP teaches POSIX command-line tools such as `sed`, `grep`, `awk`, `sort`, `cat`, pipes, and redirection. Lessons are authored outside the app; the app imports and validates them. Lesson YAML must never contain executable test scripts or arbitrary execution code.

## Tech Stack & Architecture

Frontend:
- React + TypeScript under `frontend/`
- Vite build pipeline with pnpm
- Xterm.js via `@xterm/xterm` and `@xterm/addon-fit`
- shadcn/ui-style local components in `frontend/src/components/ui`
- Wails-generated bindings in `frontend/wailsjs`

Backend:
- Go + Wails v2
- Local PTY sessions with `github.com/creack/pty`
- YAML parsing with `gopkg.in/yaml.v3`
- Lesson validation and storage in `internal/lessons`
- Roadmap folder validation and storage in `internal/roadmaps`
- Workspace materialization in `internal/workspace`
- Declarative check execution in `internal/checks`
- PTY lifecycle/transcript capture in `internal/terminal`

Wails bound methods:
- `ImportLesson(path)`
- `ImportRoadmap(path)`
- `SelectAndImportLesson()`
- `SelectAndImportRoadmap()`
- `ListLessons()`
- `ListRoadmaps()`
- `LoadRoadmap(roadmapID)`
- `StartLesson(lessonID)`
- `StartRoadmapLesson(roadmapID, lessonID)`
- `TerminalInput(sessionID, data)`
- `TerminalResize(sessionID, cols, rows)`
- `RunChecks(sessionID)`
- `ResetLesson(sessionID)`
- `StopLesson(sessionID)`

Wails events:
- `terminal:output`
- `terminal:exit`
- `terminal:error`
- `lesson:state`
- `roadmap:state`
- `checks:result`

## Current State

Initial baseline: Empty Repo / Scaffolding.

Current actual state: scaffolded MVP implemented and verified. The project now has Go/Wails backend packages, React/Xterm frontend, YAML lesson schema/docs, roadmap folder schema/docs, 11 standalone example lessons, an importable shell text essentials roadmap with 13 exercises, short command guides, full command manuals, tests, and a successful macOS Wails production build.

Important environment notes:
- Go is available at `/usr/local/go/bin/go`.
- Wails is available at `/Users/trytytus/go/bin/wails`.
- pnpm is available at `/Users/trytytus/Library/pnpm/pnpm`.
- On macOS, Wails production builds require `CGO_ENABLED=1`.
- `darwin_link.go` links `UniformTypeIdentifiers` for the macOS Wails/WebKit build.

## Implementation Plan To-Do

- [x] Phase 1: Scaffold Wails v2 Go + React TypeScript project.
- [x] Phase 1: Add Xterm.js, shadcn/ui-style components, Vite/TypeScript/pnpm setup.
- [x] Phase 2: Implement YAML lesson parsing, validation, immutable import, and lesson store.
- [x] Phase 2: Add `docs/lesson.schema.json` and `docs/lesson-authoring.md`.
- [x] Phase 3: Implement fresh lesson workspaces and declarative checks.
- [x] Phase 3: Normalize line endings while preserving meaningful whitespace unless `trim: true`.
- [x] Phase 4: Implement local PTY terminal runtime with transcript capture, resize, stop/reset cleanup, and Wails events.
- [x] Phase 5: Build frontend lesson list, active terminal, task panel, hints, solution, reset/check actions, and check results.
- [x] Verification: Go tests pass.
- [x] Verification: frontend tests pass.
- [x] Verification: frontend production build passes.
- [x] Verification: Wails production build passes.
- [ ] Next: manually run the app, import `examples/sort-files.yaml`, complete the exercise in the terminal, and confirm the UX flow.
- [x] Next: add a richer lesson catalog with common Unix command exercises.
- [x] Next: add roadmap folder import, roadmap storage/validation, roadmap sidebar, full roadmap agenda, command guide rendering, progress tracking, and starter roadmap content.
- [x] Next: add per-command full manual Markdown pages with cheat sheets, roadmap entry points, and exercise-page book buttons.
- [ ] Next: manually run the app, import `examples/roadmaps/shell-text-essentials`, start a roadmap exercise, pass checks, and confirm progress updates in the roadmap view.
- [ ] Next: decide whether to add a real app icon.
