# Roadmap Authoring

Roadmaps are imported as folders. A roadmap folder contains one manifest file,
Markdown command guides, and lesson YAML files that already follow
`docs/lesson.schema.json`.

## Folder Shape

```text
shell-text-essentials/
  roadmap.yaml
  commands/
    grep.md
    find.md
  lessons/
    grep-basic.yaml
    grep-ignore-case.yaml
    find-name.yaml
```

## Manifest Shape

```yaml
version: 1
id: shell-text-essentials
title: "Shell Text Essentials"
summary: "Search, find, and sort text files with daily-use flags."
description: "A practical roadmap with parameter drills and capstones."
difficulty: "beginner to intermediate"
commands:
  - name: "grep"
    title: "Search text with grep"
    summary: "Find matching lines and use common flags."
    guide: "commands/grep.md"
    lessons:
      - path: "lessons/grep-basic.yaml"
        focus: "Search exact text without flags"
        kind: "foundation"
      - path: "lessons/grep-ignore-case.yaml"
        focus: "Match text regardless of case"
        flag: "-i / --ignore-case"
        kind: "parameter"
```

## Rules

- Use `roadmap.yaml` or `roadmap.yml` at the folder root.
- Use `version: 1`.
- Use safe relative paths for `guide` and `lessons[].path`; no absolute paths,
  `..`, or null bytes.
- Store command guides as Markdown files. The app renders headings, paragraphs,
  bullet lists, inline code, and fenced code blocks.
- Store exercises as normal lesson YAML. Roadmaps do not add executable checks or
  scripts.
- Add one foundation lesson for a command when it makes sense.
- Add one focused lesson for each popular daily-use flag or parameter.
- Use `flag` for short and long forms, such as `-i / --ignore-case`, when the
  command supports both.
- Use `kind: pattern` for command-specific patterns such as `find -name "*.txt"`.
- Add `kind: capstone` for exercises that combine multiple flags or concepts.

See `examples/roadmaps/shell-text-essentials` for a complete importable roadmap.
