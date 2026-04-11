package workspace

import (
	"os"
	"path/filepath"
	"testing"

	"terminal-lessons/internal/lessons"
)

func TestCreateMaterializesLessonFilesAndHome(t *testing.T) {
	lesson := &lessons.Lesson{
		Workspace: lessons.Workspace{
			Files: []lessons.WorkspaceFile{
				{Path: "nested/names.txt", Content: "zeta\nalpha\n"},
			},
		},
	}

	ws, err := Create(lesson)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	defer Remove(ws)

	data, err := os.ReadFile(filepath.Join(ws.Path, "nested", "names.txt"))
	if err != nil {
		t.Fatalf("ReadFile() error = %v", err)
	}
	if string(data) != "zeta\nalpha\n" {
		t.Fatalf("file content = %q", string(data))
	}
	if info, err := os.Stat(ws.Home); err != nil || !info.IsDir() {
		t.Fatalf("home dir stat = %v, %v", info, err)
	}
}
