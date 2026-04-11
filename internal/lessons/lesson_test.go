package lessons

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const validLessonYAML = `
version: 1
id: sort-files-001
title: Sortowanie nazw plikow
commands: ["cat", "sort"]
difficulty: beginner
intro: Utworz plik sorted.txt.
workspace:
  files:
    - path: names.txt
      content: "zeta.txt\nalpha.txt\nbeta.txt\n"
hints:
  - Uzyj sort.
solution:
  commands:
    - "cat names.txt | sort > sorted.txt"
  explanation: sort porzadkuje linie.
checks:
  - type: file_equals
    path: sorted.txt
    expected: "alpha.txt\nbeta.txt\nzeta.txt\n"
`

func TestParseValidLesson(t *testing.T) {
	lesson, data, err := Parse(strings.NewReader(validLessonYAML))
	if err != nil {
		t.Fatalf("Parse() error = %v", err)
	}
	if len(data) == 0 {
		t.Fatal("Parse() returned no source bytes")
	}
	if lesson.ID != "sort-files-001" {
		t.Fatalf("lesson.ID = %q", lesson.ID)
	}
	if got := lesson.Summary().CheckCount; got != 1 {
		t.Fatalf("CheckCount = %d", got)
	}
}

func TestParseRejectsUnsafeWorkspacePath(t *testing.T) {
	source := strings.Replace(validLessonYAML, "path: names.txt", "path: ../names.txt", 1)
	_, _, err := Parse(strings.NewReader(source))
	if err == nil {
		t.Fatal("Parse() error = nil, want unsafe path error")
	}
	if !errors.Is(err, ErrInvalidPath) {
		t.Fatalf("Parse() error = %v, want ErrInvalidPath", err)
	}
}

func TestParseRejectsMissingChecks(t *testing.T) {
	source := strings.Replace(validLessonYAML, `checks:
  - type: file_equals
    path: sorted.txt
    expected: "alpha.txt\nbeta.txt\nzeta.txt\n"`, "checks: []", 1)
	_, _, err := Parse(strings.NewReader(source))
	if err == nil {
		t.Fatal("Parse() error = nil, want missing checks error")
	}
	if !strings.Contains(err.Error(), "at least one check") {
		t.Fatalf("Parse() error = %v", err)
	}
}

func TestParseRejectsEmptyContainsCheck(t *testing.T) {
	source := strings.Replace(validLessonYAML, `type: file_equals`, `type: stdout_contains`, 1)
	source = strings.Replace(source, `path: sorted.txt
    expected: "alpha.txt\nbeta.txt\nzeta.txt\n"`, `expected: ""`, 1)
	_, _, err := Parse(strings.NewReader(source))
	if err == nil {
		t.Fatal("Parse() error = nil, want empty stdout_contains error")
	}
	if !strings.Contains(err.Error(), "stdout_contains requires expected") {
		t.Fatalf("Parse() error = %v", err)
	}
}

func TestResolveSafePathRejectsTraversal(t *testing.T) {
	base := t.TempDir()
	if _, err := ResolveSafePath(base, "../../etc/passwd"); !errors.Is(err, ErrInvalidPath) {
		t.Fatalf("ResolveSafePath() error = %v, want ErrInvalidPath", err)
	}
}

func TestStoreImportAndList(t *testing.T) {
	source := filepath.Join(t.TempDir(), "lesson.yaml")
	if err := os.WriteFile(source, []byte(validLessonYAML), 0o644); err != nil {
		t.Fatalf("write lesson source: %v", err)
	}

	store := NewStore(t.TempDir())
	lesson, err := store.Import(source)
	if err != nil {
		t.Fatalf("Import() error = %v", err)
	}
	if lesson.ID != "sort-files-001" {
		t.Fatalf("lesson.ID = %q", lesson.ID)
	}
	if _, err := store.Import(source); !errors.Is(err, ErrDuplicateID) {
		t.Fatalf("second Import() error = %v, want ErrDuplicateID", err)
	}

	summaries, err := store.List()
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(summaries) != 1 || summaries[0].ID != "sort-files-001" {
		t.Fatalf("List() = %#v", summaries)
	}
}

func TestExamplesParse(t *testing.T) {
	paths, err := filepath.Glob("../../examples/*.yaml")
	if err != nil {
		t.Fatalf("glob examples: %v", err)
	}
	if len(paths) == 0 {
		t.Fatal("no example lessons found")
	}

	seenIDs := map[string]string{}
	for _, path := range paths {
		t.Run(filepath.Base(path), func(t *testing.T) {
			lesson, _, err := ParseFile(path)
			if err != nil {
				t.Fatalf("ParseFile(%q) error = %v", path, err)
			}
			if previous, ok := seenIDs[lesson.ID]; ok {
				t.Fatalf("duplicate lesson id %q also used by %s", lesson.ID, previous)
			}
			seenIDs[lesson.ID] = path
		})
	}
}
