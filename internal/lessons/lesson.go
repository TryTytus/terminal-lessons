package lessons

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	CurrentVersion  = 1
	MaxLessonBytes  = 256 * 1024
	MaxFileBytes    = 64 * 1024
	MaxExpectedSize = 64 * 1024
)

var (
	ErrInvalidPath = errors.New("invalid relative path")
	ErrDuplicateID = errors.New("lesson id already exists")
)

var allowedCheckTypes = []string{
	"file_exists",
	"file_not_exists",
	"file_equals",
	"file_contains",
	"stdout_contains",
	"stdout_matches",
}

type Lesson struct {
	Version    int       `json:"version" yaml:"version"`
	ID         string    `json:"id" yaml:"id"`
	Title      string    `json:"title" yaml:"title"`
	Commands   []string  `json:"commands" yaml:"commands"`
	Difficulty string    `json:"difficulty" yaml:"difficulty"`
	Intro      string    `json:"intro" yaml:"intro"`
	Workspace  Workspace `json:"workspace" yaml:"workspace"`
	Hints      []string  `json:"hints" yaml:"hints"`
	Solution   Solution  `json:"solution" yaml:"solution"`
	Checks     []Check   `json:"checks" yaml:"checks"`
}

type Workspace struct {
	Files []WorkspaceFile `json:"files" yaml:"files"`
}

type WorkspaceFile struct {
	Path    string `json:"path" yaml:"path"`
	Content string `json:"content" yaml:"content"`
}

type Solution struct {
	Commands    []string `json:"commands" yaml:"commands"`
	Explanation string   `json:"explanation" yaml:"explanation"`
}

type Check struct {
	Type     string `json:"type" yaml:"type"`
	Path     string `json:"path,omitempty" yaml:"path,omitempty"`
	Expected string `json:"expected,omitempty" yaml:"expected,omitempty"`
	Pattern  string `json:"pattern,omitempty" yaml:"pattern,omitempty"`
	Trim     bool   `json:"trim,omitempty" yaml:"trim,omitempty"`
}

type Summary struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Commands   []string `json:"commands"`
	Difficulty string   `json:"difficulty"`
	Intro      string   `json:"intro"`
	CheckCount int      `json:"checkCount"`
	HintCount  int      `json:"hintCount"`
}

func ParseFile(path string) (*Lesson, []byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, nil, fmt.Errorf("open lesson %s: %w", path, err)
	}
	defer f.Close()

	return Parse(f)
}

func Parse(r io.Reader) (*Lesson, []byte, error) {
	data, err := io.ReadAll(io.LimitReader(r, MaxLessonBytes+1))
	if err != nil {
		return nil, nil, fmt.Errorf("read lesson: %w", err)
	}
	if len(data) > MaxLessonBytes {
		return nil, nil, fmt.Errorf("lesson file exceeds %d bytes", MaxLessonBytes)
	}

	var lesson Lesson
	if err := yaml.Unmarshal(data, &lesson); err != nil {
		return nil, nil, fmt.Errorf("parse lesson yaml: %w", err)
	}
	if err := lesson.Validate(); err != nil {
		return nil, nil, err
	}
	return &lesson, data, nil
}

func (l Lesson) Summary() Summary {
	return Summary{
		ID:         l.ID,
		Title:      l.Title,
		Commands:   slices.Clone(l.Commands),
		Difficulty: l.Difficulty,
		Intro:      l.Intro,
		CheckCount: len(l.Checks),
		HintCount:  len(l.Hints),
	}
}

func (l Lesson) Validate() error {
	if l.Version != CurrentVersion {
		return fmt.Errorf("unsupported lesson version %d", l.Version)
	}
	if strings.TrimSpace(l.ID) == "" {
		return errors.New("lesson id is required")
	}
	if strings.ContainsAny(l.ID, "/\\\x00") {
		return errors.New("lesson id must not contain path separators or null bytes")
	}
	if strings.TrimSpace(l.Title) == "" {
		return errors.New("lesson title is required")
	}
	if strings.TrimSpace(l.Intro) == "" {
		return errors.New("lesson intro is required")
	}
	if len(l.Checks) == 0 {
		return errors.New("lesson must include at least one check")
	}

	seenPaths := map[string]struct{}{}
	var totalFileBytes int
	for _, file := range l.Workspace.Files {
		clean, err := CleanRelativePath(file.Path)
		if err != nil {
			return fmt.Errorf("workspace file %q: %w", file.Path, err)
		}
		if _, ok := seenPaths[clean]; ok {
			return fmt.Errorf("duplicate workspace file %q", clean)
		}
		seenPaths[clean] = struct{}{}
		if len(file.Content) > MaxFileBytes {
			return fmt.Errorf("workspace file %q exceeds %d bytes", clean, MaxFileBytes)
		}
		totalFileBytes += len(file.Content)
		if totalFileBytes > MaxLessonBytes {
			return fmt.Errorf("workspace files exceed total limit of %d bytes", MaxLessonBytes)
		}
	}

	for i, check := range l.Checks {
		if err := validateCheck(check); err != nil {
			return fmt.Errorf("check %d: %w", i+1, err)
		}
	}

	return nil
}

func validateCheck(check Check) error {
	if !slices.Contains(allowedCheckTypes, check.Type) {
		return fmt.Errorf("unsupported check type %q", check.Type)
	}

	switch check.Type {
	case "file_exists", "file_not_exists", "file_equals", "file_contains":
		if _, err := CleanRelativePath(check.Path); err != nil {
			return fmt.Errorf("path %q: %w", check.Path, err)
		}
		if check.Type == "file_contains" && check.Expected == "" {
			return errors.New("file_contains requires expected")
		}
	case "stdout_contains":
		if check.Expected == "" {
			return errors.New("stdout_contains requires expected")
		}
	case "stdout_matches":
		if strings.TrimSpace(check.Pattern) == "" {
			return errors.New("stdout_matches requires pattern")
		}
	}

	if len(check.Expected) > MaxExpectedSize {
		return fmt.Errorf("expected value exceeds %d bytes", MaxExpectedSize)
	}
	return nil
}

func CleanRelativePath(raw string) (string, error) {
	if strings.TrimSpace(raw) == "" {
		return "", ErrInvalidPath
	}
	if strings.ContainsRune(raw, 0) || filepath.IsAbs(raw) {
		return "", ErrInvalidPath
	}

	clean := filepath.Clean(filepath.FromSlash(raw))
	if clean == "." || clean == string(filepath.Separator) {
		return "", ErrInvalidPath
	}

	for _, part := range strings.Split(clean, string(filepath.Separator)) {
		if part == ".." || part == "" {
			return "", ErrInvalidPath
		}
	}

	return clean, nil
}

func ResolveSafePath(baseDir, rel string) (string, error) {
	clean, err := CleanRelativePath(rel)
	if err != nil {
		return "", err
	}
	full := filepath.Join(baseDir, clean)
	absBase, err := filepath.Abs(baseDir)
	if err != nil {
		return "", fmt.Errorf("resolve base path: %w", err)
	}
	absFull, err := filepath.Abs(full)
	if err != nil {
		return "", fmt.Errorf("resolve full path: %w", err)
	}

	if absFull != absBase && !strings.HasPrefix(absFull, absBase+string(filepath.Separator)) {
		return "", ErrInvalidPath
	}
	return absFull, nil
}
