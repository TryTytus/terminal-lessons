# Lesson Authoring

Lessons are YAML files generated outside the app and imported into Terminal Lessons. The app validates the YAML and only runs declarative checks; lesson files must not include shell scripts or arbitrary test commands.

Standalone lessons can be imported directly. The same lesson files can also be
referenced from roadmap folders; see `docs/roadmap-authoring.md`.

## Minimal Shape

```yaml
version: 1
id: sort-files-001
title: "Sort file names"
commands: ["cat", "sort"]
difficulty: "beginner"
intro: "Create sorted.txt with the file names from names.txt in alphabetical order."
workspace:
  files:
    - path: "names.txt"
      content: "zeta.txt\nalpha.txt\nbeta.txt\n"
hints:
  - "Read the file with cat."
  - "Pipe the output into sort."
solution:
  commands:
    - "cat names.txt | sort > sorted.txt"
  explanation: "sort orders lines and > writes the output to a file."
checks:
  - type: "file_equals"
    path: "sorted.txt"
    expected: "alpha.txt\nbeta.txt\nzeta.txt\n"
```

## Rules

- Use `version: 1`.
- Use only safe relative paths in `workspace.files[].path` and check `path`; no absolute paths, `..`, or null bytes.
- Keep each generated workspace file under 64 KiB.
- Write intros as explicit learner instructions. Include the starting files to
  inspect, the exact file or terminal output to produce, any command/flag
  constraints, and how the learner can tell the check should pass.
- Prefer focused checks that inspect files or terminal output.
- Do not expect the app to execute solution commands. The solution is shown to the learner only.
- Do not include executable setup, teardown, helper, or test scripts in lesson
  YAML. Workspace files should be small static practice inputs.
- `file_equals` is whitespace-sensitive by default. Add `trim: true` only when leading/trailing whitespace should not matter.

## AI Generation

The in-app "Add with AI" lesson flow asks Codex or Claude to create `lesson.yaml`
inside an app-owned staging folder. The app then validates that file with the
same parser used for manual imports. A generated lesson is imported only if it
passes this schema and safety validation.

## Check Types

- `file_exists`: passes when `path` exists in the lesson workspace.
- `file_not_exists`: passes when `path` does not exist in the lesson workspace.
- `file_equals`: passes when the file content equals `expected`.
- `file_contains`: passes when the file content contains `expected`.
- `stdout_contains`: passes when the terminal transcript contains `expected`.
- `stdout_matches`: passes when the terminal transcript matches `pattern` as a regular expression.
