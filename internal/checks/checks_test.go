package checks

import (
	"os"
	"path/filepath"
	"testing"

	"terminal-lessons/internal/lessons"
)

func TestRunFileChecks(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "sorted.txt"), []byte("alpha\r\nbeta\r\n"), 0o644); err != nil {
		t.Fatalf("write file: %v", err)
	}

	lesson := &lessons.Lesson{
		Checks: []lessons.Check{
			{Type: "file_exists", Path: "sorted.txt"},
			{Type: "file_not_exists", Path: "missing.txt"},
			{Type: "file_equals", Path: "sorted.txt", Expected: "alpha\nbeta\n"},
			{Type: "file_contains", Path: "sorted.txt", Expected: "beta\n"},
		},
	}

	results := Run(lesson, dir, "")
	if len(results) != 4 {
		t.Fatalf("len(results) = %d", len(results))
	}
	for _, result := range results {
		if !result.Passed {
			t.Fatalf("result %#v did not pass", result)
		}
	}
}

func TestRunStdoutChecks(t *testing.T) {
	lesson := &lessons.Lesson{
		Checks: []lessons.Check{
			{Type: "stdout_contains", Expected: "alpha\nbeta"},
			{Type: "stdout_matches", Pattern: `alpha\s+beta`},
		},
	}

	results := Run(lesson, t.TempDir(), "alpha\r\nbeta\n")
	for _, result := range results {
		if !result.Passed {
			t.Fatalf("result %#v did not pass", result)
		}
	}
}

func TestRunFileEqualsPreservesWhitespaceUnlessTrimmed(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "answer.txt"), []byte("alpha\n"), 0o644); err != nil {
		t.Fatalf("write file: %v", err)
	}

	lesson := &lessons.Lesson{Checks: []lessons.Check{
		{Type: "file_equals", Path: "answer.txt", Expected: "alpha"},
		{Type: "file_equals", Path: "answer.txt", Expected: "alpha", Trim: true},
	}}

	results := Run(lesson, dir, "")
	if results[0].Passed {
		t.Fatalf("untrimmed result passed, want whitespace-sensitive failure")
	}
	if !results[1].Passed {
		t.Fatalf("trimmed result failed: %#v", results[1])
	}
}
