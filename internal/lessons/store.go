package lessons

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

type Store struct {
	root string
}

func NewStore(root string) *Store {
	return &Store{root: root}
}

func (s *Store) LessonsDir() string {
	return filepath.Join(s.root, "lessons")
}

func (s *Store) Import(path string) (*Lesson, error) {
	lesson, data, err := ParseFile(path)
	if err != nil {
		return nil, err
	}

	if err := os.MkdirAll(s.LessonsDir(), 0o755); err != nil {
		return nil, fmt.Errorf("create lesson store: %w", err)
	}

	target := filepath.Join(s.LessonsDir(), lesson.ID+".yaml")
	if _, err := os.Stat(target); err == nil {
		return nil, fmt.Errorf("%w: %s", ErrDuplicateID, lesson.ID)
	} else if err != nil && !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("check imported lesson %s: %w", lesson.ID, err)
	}

	if err := os.WriteFile(target, data, 0o644); err != nil {
		return nil, fmt.Errorf("store imported lesson %s: %w", lesson.ID, err)
	}
	return lesson, nil
}

func (s *Store) Load(id string) (*Lesson, error) {
	if strings.TrimSpace(id) == "" || strings.ContainsAny(id, "/\\\x00") {
		return nil, fmt.Errorf("invalid lesson id %q", id)
	}
	path := filepath.Join(s.LessonsDir(), id+".yaml")
	lesson, _, err := ParseFile(path)
	if err != nil {
		return nil, err
	}
	return lesson, nil
}

func (s *Store) List() ([]Summary, error) {
	entries, err := os.ReadDir(s.LessonsDir())
	if errors.Is(err, os.ErrNotExist) {
		return []Summary{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("list lesson store: %w", err)
	}

	summaries := make([]Summary, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if !strings.HasSuffix(name, ".yaml") && !strings.HasSuffix(name, ".yml") {
			continue
		}

		lesson, _, err := ParseFile(filepath.Join(s.LessonsDir(), name))
		if err != nil {
			return nil, fmt.Errorf("load imported lesson %s: %w", name, err)
		}
		summaries = append(summaries, lesson.Summary())
	}

	slices.SortFunc(summaries, func(a, b Summary) int {
		return strings.Compare(a.Title, b.Title)
	})
	return summaries, nil
}
