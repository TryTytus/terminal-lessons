package workspace

import (
	"fmt"
	"os"
	"path/filepath"

	"terminal-lessons/internal/lessons"
)

type Workspace struct {
	Path string `json:"path"`
	Home string `json:"home"`
}

func Create(lesson *lessons.Lesson) (*Workspace, error) {
	root, err := os.MkdirTemp("", "terminal-lessons-*")
	if err != nil {
		return nil, fmt.Errorf("create lesson workspace: %w", err)
	}

	created := false
	defer func() {
		if !created {
			_ = os.RemoveAll(root)
		}
	}()

	home := filepath.Join(root, ".home")
	if err := os.MkdirAll(home, 0o755); err != nil {
		return nil, fmt.Errorf("create workspace home: %w", err)
	}

	for _, file := range lesson.Workspace.Files {
		target, err := lessons.ResolveSafePath(root, file.Path)
		if err != nil {
			return nil, fmt.Errorf("resolve workspace file %q: %w", file.Path, err)
		}
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return nil, fmt.Errorf("create parent directory for %q: %w", file.Path, err)
		}
		if err := os.WriteFile(target, []byte(file.Content), 0o644); err != nil {
			return nil, fmt.Errorf("write workspace file %q: %w", file.Path, err)
		}
	}

	created = true
	return &Workspace{Path: root, Home: home}, nil
}

func Remove(ws *Workspace) error {
	if ws == nil || ws.Path == "" {
		return nil
	}
	return os.RemoveAll(ws.Path)
}
