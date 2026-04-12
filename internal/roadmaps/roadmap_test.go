package roadmaps

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"terminal-lessons/internal/lessons"
)

const validRoadmapYAML = `
version: 1
id: text-search
title: "Text search"
summary: "Practice grep in daily terminal work."
description: "A focused grep course."
difficulty: "beginner"
commands:
  - name: "grep"
    title: "Find matching lines"
    summary: "Search files for text patterns."
    guide: "commands/grep.md"
    manual: "manuals/grep.md"
    lessons:
      - path: "lessons/grep-basic.yaml"
        focus: "Search without flags"
        kind: "foundation"
      - path: "lessons/grep-ignore-case.yaml"
        focus: "Search while ignoring case"
        flag: "-i"
        kind: "parameter"
`

const grepBasicLessonYAML = `
version: 1
id: grep-basic
title: "Search for errors"
commands: ["grep"]
difficulty: beginner
intro: "Create errors.txt containing ERROR lines."
workspace:
  files:
    - path: "app.log"
      content: "INFO boot\nERROR crash\n"
hints:
  - "Search for ERROR."
solution:
  commands:
    - "grep ERROR app.log > errors.txt"
  explanation: "grep prints matching lines."
checks:
  - type: file_equals
    path: errors.txt
    expected: "ERROR crash\n"
`

const grepIgnoreCaseLessonYAML = `
version: 1
id: grep-ignore-case
title: "Search ignoring case"
commands: ["grep"]
difficulty: beginner
intro: "Create matches.txt containing every api spelling."
workspace:
  files:
    - path: "requests.log"
      content: "API ok\napi slow\nCache hit\n"
hints:
  - "Use -i."
solution:
  commands:
    - "grep -i api requests.log > matches.txt"
  explanation: "-i ignores case."
checks:
  - type: file_equals
    path: matches.txt
    expected: "API ok\napi slow\n"
`

func TestParseDirHydratesGuidesAndLessons(t *testing.T) {
	dir := writeRoadmapFixture(t, validRoadmapYAML)

	parsed, err := ParseDir(dir)
	if err != nil {
		t.Fatalf("ParseDir() error = %v", err)
	}

	roadmap := parsed.roadmap
	if roadmap.ID != "text-search" {
		t.Fatalf("roadmap.ID = %q", roadmap.ID)
	}
	if got := roadmap.ToSummary().LessonCount; got != 2 {
		t.Fatalf("LessonCount = %d, want 2", got)
	}
	if !strings.Contains(roadmap.Commands[0].GuideMarkdown, "grep") {
		t.Fatalf("GuideMarkdown = %q", roadmap.Commands[0].GuideMarkdown)
	}
	if !strings.Contains(roadmap.Commands[0].ManualMarkdown, "cheat sheet") {
		t.Fatalf("ManualMarkdown = %q", roadmap.Commands[0].ManualMarkdown)
	}
	if lesson := roadmap.Commands[0].Lessons[1]; lesson.ID != "grep-ignore-case" || lesson.Flag != "-i" || lesson.CheckCount != 1 {
		t.Fatalf("hydrated lesson = %#v", lesson)
	}
}

func TestStoreImportListAndLoadLesson(t *testing.T) {
	source := writeRoadmapFixture(t, validRoadmapYAML)
	store := NewStore(t.TempDir())

	roadmap, err := store.Import(source)
	if err != nil {
		t.Fatalf("Import() error = %v", err)
	}
	if roadmap.ID != "text-search" {
		t.Fatalf("roadmap.ID = %q", roadmap.ID)
	}
	if _, err := store.Import(source); !errors.Is(err, ErrDuplicateID) {
		t.Fatalf("second Import() error = %v, want ErrDuplicateID", err)
	}

	summaries, err := store.List()
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(summaries) != 1 || summaries[0].ID != "text-search" || summaries[0].CommandCount != 1 {
		t.Fatalf("List() = %#v", summaries)
	}

	lesson, err := store.LoadLesson("text-search", "grep-ignore-case")
	if err != nil {
		t.Fatalf("LoadLesson() error = %v", err)
	}
	if lesson.Title != "Search ignoring case" {
		t.Fatalf("lesson.Title = %q", lesson.Title)
	}
}

func TestParseDirRejectsUnsafeGuidePath(t *testing.T) {
	source := strings.Replace(validRoadmapYAML, "commands/grep.md", "../grep.md", 1)
	dir := writeRoadmapFixture(t, source)

	_, err := ParseDir(dir)
	if !errors.Is(err, lessons.ErrInvalidPath) {
		t.Fatalf("ParseDir() error = %v, want ErrInvalidPath", err)
	}
}

func TestParseDirFallsBackToGuideWhenManualIsMissing(t *testing.T) {
	source := strings.Replace(validRoadmapYAML, `    manual: "manuals/grep.md"
`, "", 1)
	dir := writeRoadmapFixture(t, source)

	parsed, err := ParseDir(dir)
	if err != nil {
		t.Fatalf("ParseDir() error = %v", err)
	}
	command := parsed.roadmap.Commands[0]
	if command.Manual != command.Guide {
		t.Fatalf("Manual = %q, want guide %q", command.Manual, command.Guide)
	}
	if command.ManualMarkdown != command.GuideMarkdown {
		t.Fatalf("ManualMarkdown did not fall back to GuideMarkdown")
	}
}

func TestParseDirRejectsUnsafeManualPath(t *testing.T) {
	source := strings.Replace(validRoadmapYAML, "manuals/grep.md", "../grep.md", 1)
	dir := writeRoadmapFixture(t, source)

	_, err := ParseDir(dir)
	if !errors.Is(err, lessons.ErrInvalidPath) {
		t.Fatalf("ParseDir() error = %v, want ErrInvalidPath", err)
	}
}

func TestParseDirRejectsManifestLessonIDMismatch(t *testing.T) {
	source := strings.Replace(validRoadmapYAML, `path: "lessons/grep-basic.yaml"`, `id: wrong-id
        path: "lessons/grep-basic.yaml"`, 1)
	dir := writeRoadmapFixture(t, source)

	_, err := ParseDir(dir)
	if err == nil || !strings.Contains(err.Error(), "id mismatch") {
		t.Fatalf("ParseDir() error = %v, want id mismatch", err)
	}
}

func TestParseDirRejectsSymlinkedLesson(t *testing.T) {
	dir := writeRoadmapFixture(t, validRoadmapYAML)
	lessonPath := filepath.Join(dir, "lessons", "grep-basic.yaml")
	if err := os.Remove(lessonPath); err != nil {
		t.Fatalf("remove fixture lesson: %v", err)
	}
	if err := os.Symlink(filepath.Join(dir, "commands", "grep.md"), lessonPath); err != nil {
		t.Skipf("symlink not available: %v", err)
	}

	_, err := ParseDir(dir)
	if err == nil || !strings.Contains(err.Error(), "symlink") {
		t.Fatalf("ParseDir() error = %v, want symlink rejection", err)
	}
}

func TestExampleRoadmapsParse(t *testing.T) {
	entries, err := os.ReadDir("../../examples/roadmaps")
	if errors.Is(err, os.ErrNotExist) {
		t.Skip("no example roadmaps found")
	}
	if err != nil {
		t.Fatalf("read example roadmaps: %v", err)
	}

	seenIDs := map[string]string{}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		path := filepath.Join("../../examples/roadmaps", entry.Name())
		t.Run(entry.Name(), func(t *testing.T) {
			parsed, err := ParseDir(path)
			if err != nil {
				t.Fatalf("ParseDir(%q) error = %v", path, err)
			}
			if previous, ok := seenIDs[parsed.roadmap.ID]; ok {
				t.Fatalf("duplicate roadmap id %q also used by %s", parsed.roadmap.ID, previous)
			}
			seenIDs[parsed.roadmap.ID] = path
		})
	}
}

func writeRoadmapFixture(t *testing.T, manifest string) string {
	t.Helper()

	dir := t.TempDir()
	writeFile(t, dir, "roadmap.yaml", manifest)
	writeFile(t, dir, "commands/grep.md", "# grep\n\nUse grep to search matching lines.\n")
	writeFile(t, dir, "manuals/grep.md", "# grep deep dive\n\nA grep cheat sheet.\n")
	writeFile(t, dir, "lessons/grep-basic.yaml", grepBasicLessonYAML)
	writeFile(t, dir, "lessons/grep-ignore-case.yaml", grepIgnoreCaseLessonYAML)
	return dir
}

func writeFile(t *testing.T, root, rel, content string) {
	t.Helper()

	path := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("create fixture dir: %v", err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write fixture %s: %v", rel, err)
	}
}
