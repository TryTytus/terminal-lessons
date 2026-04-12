package roadmaps

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"terminal-lessons/internal/lessons"

	"gopkg.in/yaml.v3"
)

const (
	CurrentVersion   = 1
	MaxManifestBytes = 128 * 1024
	MaxGuideBytes    = 128 * 1024
	MaxManualBytes   = 256 * 1024
)

var (
	ErrDuplicateID = errors.New("roadmap id already exists")
	ErrInvalidID   = errors.New("invalid roadmap id")
)

type Roadmap struct {
	Version     int       `json:"version" yaml:"version"`
	ID          string    `json:"id" yaml:"id"`
	Title       string    `json:"title" yaml:"title"`
	Summary     string    `json:"summary" yaml:"summary"`
	Description string    `json:"description" yaml:"description"`
	Difficulty  string    `json:"difficulty" yaml:"difficulty"`
	Commands    []Command `json:"commands" yaml:"commands"`
}

type Command struct {
	Name           string      `json:"name" yaml:"name"`
	Title          string      `json:"title" yaml:"title"`
	Summary        string      `json:"summary" yaml:"summary"`
	Guide          string      `json:"guide" yaml:"guide"`
	GuideMarkdown  string      `json:"guideMarkdown" yaml:"-"`
	Manual         string      `json:"manual" yaml:"manual"`
	ManualMarkdown string      `json:"manualMarkdown" yaml:"-"`
	Lessons        []LessonRef `json:"lessons" yaml:"lessons"`
}

type LessonRef struct {
	ID         string   `json:"id" yaml:"id"`
	Path       string   `json:"path" yaml:"path"`
	Title      string   `json:"title" yaml:"-"`
	Intro      string   `json:"intro" yaml:"-"`
	Difficulty string   `json:"difficulty" yaml:"-"`
	Commands   []string `json:"commands" yaml:"-"`
	Focus      string   `json:"focus" yaml:"focus"`
	Flag       string   `json:"flag,omitempty" yaml:"flag,omitempty"`
	Kind       string   `json:"kind,omitempty" yaml:"kind,omitempty"`
	CheckCount int      `json:"checkCount" yaml:"-"`
	HintCount  int      `json:"hintCount" yaml:"-"`
}

type Summary struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Summary      string   `json:"summary"`
	Description  string   `json:"description"`
	Difficulty   string   `json:"difficulty"`
	Commands     []string `json:"commands"`
	CommandCount int      `json:"commandCount"`
	LessonCount  int      `json:"lessonCount"`
}

type parsedRoadmap struct {
	roadmap *Roadmap
	files   map[string][]byte
}

type Store struct {
	root string
}

func NewStore(root string) *Store {
	return &Store{root: root}
}

func (s *Store) RoadmapsDir() string {
	return filepath.Join(s.root, "roadmaps")
}

func (s *Store) Import(path string) (*Roadmap, error) {
	parsed, err := ParseDir(path)
	if err != nil {
		return nil, err
	}

	if err := os.MkdirAll(s.RoadmapsDir(), 0o755); err != nil {
		return nil, fmt.Errorf("create roadmap store: %w", err)
	}

	target := filepath.Join(s.RoadmapsDir(), parsed.roadmap.ID)
	if _, err := os.Stat(target); err == nil {
		return nil, fmt.Errorf("%w: %s", ErrDuplicateID, parsed.roadmap.ID)
	} else if err != nil && !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("check imported roadmap %s: %w", parsed.roadmap.ID, err)
	}

	if err := writeFiles(target, parsed.files); err != nil {
		_ = os.RemoveAll(target)
		return nil, fmt.Errorf("store imported roadmap %s: %w", parsed.roadmap.ID, err)
	}
	return parsed.roadmap, nil
}

func (s *Store) List() ([]Summary, error) {
	entries, err := os.ReadDir(s.RoadmapsDir())
	if errors.Is(err, os.ErrNotExist) {
		return []Summary{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("list roadmap store: %w", err)
	}

	summaries := make([]Summary, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		roadmap, err := s.Load(entry.Name())
		if err != nil {
			return nil, fmt.Errorf("load imported roadmap %s: %w", entry.Name(), err)
		}
		summaries = append(summaries, roadmap.ToSummary())
	}

	slices.SortFunc(summaries, func(a, b Summary) int {
		return strings.Compare(a.Title, b.Title)
	})
	return summaries, nil
}

func (s *Store) Load(id string) (*Roadmap, error) {
	if !validID(id) {
		return nil, fmt.Errorf("%w: %q", ErrInvalidID, id)
	}

	parsed, err := ParseDir(filepath.Join(s.RoadmapsDir(), id))
	if err != nil {
		return nil, err
	}
	if parsed.roadmap.ID != id {
		return nil, fmt.Errorf("roadmap folder %q contains manifest id %q", id, parsed.roadmap.ID)
	}
	return parsed.roadmap, nil
}

func (s *Store) LoadLesson(roadmapID, lessonID string) (*lessons.Lesson, error) {
	roadmap, err := s.Load(roadmapID)
	if err != nil {
		return nil, err
	}

	for _, command := range roadmap.Commands {
		for _, ref := range command.Lessons {
			if ref.ID == lessonID {
				root := filepath.Join(s.RoadmapsDir(), roadmapID)
				lessonBytes, err := readRoadmapFile(root, ref.Path, lessons.MaxLessonBytes)
				if err != nil {
					return nil, err
				}
				lesson, _, err := lessons.Parse(bytes.NewReader(lessonBytes))
				if err != nil {
					return nil, err
				}
				return lesson, nil
			}
		}
	}
	return nil, fmt.Errorf("lesson %q not found in roadmap %q", lessonID, roadmapID)
}

func ParseDir(path string) (*parsedRoadmap, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, fmt.Errorf("open roadmap folder %s: %w", path, err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("roadmap import path must be a folder: %s", path)
	}

	manifestRel, manifestPath, err := findManifest(path)
	if err != nil {
		return nil, err
	}
	data, err := readLimitedFile(manifestPath, MaxManifestBytes)
	if err != nil {
		return nil, fmt.Errorf("read roadmap manifest: %w", err)
	}

	var roadmap Roadmap
	if err := yaml.Unmarshal(data, &roadmap); err != nil {
		return nil, fmt.Errorf("parse roadmap yaml: %w", err)
	}
	if err := roadmap.validateManifest(); err != nil {
		return nil, err
	}

	files := map[string][]byte{manifestRel: data}
	lessonIDs := map[string]string{}
	for commandIndex := range roadmap.Commands {
		command := &roadmap.Commands[commandIndex]

		guidePath, err := cleanRoadmapPath(command.Guide)
		if err != nil {
			return nil, fmt.Errorf("command %q guide: %w", command.Name, err)
		}
		if filepath.Ext(guidePath) != ".md" {
			return nil, fmt.Errorf("command %q guide must be a markdown file", command.Name)
		}
		guideBytes, err := readRoadmapFile(path, guidePath, MaxGuideBytes)
		if err != nil {
			return nil, fmt.Errorf("command %q guide: %w", command.Name, err)
		}
		command.Guide = guidePath
		command.GuideMarkdown = string(guideBytes)
		files[guidePath] = guideBytes

		manualPath := strings.TrimSpace(command.Manual)
		if manualPath == "" {
			command.Manual = guidePath
			command.ManualMarkdown = command.GuideMarkdown
		} else {
			cleanManualPath, err := cleanRoadmapPath(manualPath)
			if err != nil {
				return nil, fmt.Errorf("command %q manual: %w", command.Name, err)
			}
			if filepath.Ext(cleanManualPath) != ".md" {
				return nil, fmt.Errorf("command %q manual must be a markdown file", command.Name)
			}
			manualBytes, err := readRoadmapFile(path, cleanManualPath, MaxManualBytes)
			if err != nil {
				return nil, fmt.Errorf("command %q manual: %w", command.Name, err)
			}
			command.Manual = cleanManualPath
			command.ManualMarkdown = string(manualBytes)
			files[cleanManualPath] = manualBytes
		}

		for lessonIndex := range command.Lessons {
			ref := &command.Lessons[lessonIndex]
			lessonPath, err := cleanRoadmapPath(ref.Path)
			if err != nil {
				return nil, fmt.Errorf("command %q lesson %d: %w", command.Name, lessonIndex+1, err)
			}
			ext := filepath.Ext(lessonPath)
			if ext != ".yaml" && ext != ".yml" {
				return nil, fmt.Errorf("command %q lesson %d must be a YAML file", command.Name, lessonIndex+1)
			}

			lessonBytes, err := readRoadmapFile(path, lessonPath, lessons.MaxLessonBytes)
			if err != nil {
				return nil, fmt.Errorf("command %q lesson %d: %w", command.Name, lessonIndex+1, err)
			}
			lesson, _, err := lessons.Parse(bytes.NewReader(lessonBytes))
			if err != nil {
				return nil, fmt.Errorf("command %q lesson %s: %w", command.Name, lessonPath, err)
			}
			if strings.TrimSpace(ref.ID) != "" && ref.ID != lesson.ID {
				return nil, fmt.Errorf("command %q lesson %s id mismatch: manifest has %q, file has %q", command.Name, lessonPath, ref.ID, lesson.ID)
			}
			if previous, ok := lessonIDs[lesson.ID]; ok {
				return nil, fmt.Errorf("duplicate roadmap lesson id %q in %s and %s", lesson.ID, previous, lessonPath)
			}
			lessonIDs[lesson.ID] = lessonPath

			summary := lesson.Summary()
			ref.ID = lesson.ID
			ref.Path = lessonPath
			ref.Title = summary.Title
			ref.Intro = summary.Intro
			ref.Difficulty = summary.Difficulty
			ref.Commands = summary.Commands
			ref.CheckCount = summary.CheckCount
			ref.HintCount = summary.HintCount
			files[lessonPath] = lessonBytes
		}
	}

	return &parsedRoadmap{roadmap: &roadmap, files: files}, nil
}

func (r Roadmap) ToSummary() Summary {
	commands := make([]string, 0, len(r.Commands))
	lessonCount := 0
	for _, command := range r.Commands {
		commands = append(commands, command.Name)
		lessonCount += len(command.Lessons)
	}

	return Summary{
		ID:           r.ID,
		Title:        r.Title,
		Summary:      r.Summary,
		Description:  r.Description,
		Difficulty:   r.Difficulty,
		Commands:     commands,
		CommandCount: len(r.Commands),
		LessonCount:  lessonCount,
	}
}

func (r Roadmap) validateManifest() error {
	if r.Version != CurrentVersion {
		return fmt.Errorf("unsupported roadmap version %d", r.Version)
	}
	if !validID(r.ID) {
		return fmt.Errorf("%w: %q", ErrInvalidID, r.ID)
	}
	if strings.TrimSpace(r.Title) == "" {
		return errors.New("roadmap title is required")
	}
	if strings.TrimSpace(r.Summary) == "" {
		return errors.New("roadmap summary is required")
	}
	if len(r.Commands) == 0 {
		return errors.New("roadmap must include at least one command")
	}

	commandNames := map[string]struct{}{}
	for i, command := range r.Commands {
		name := strings.TrimSpace(command.Name)
		if name == "" {
			return fmt.Errorf("command %d name is required", i+1)
		}
		if _, ok := commandNames[name]; ok {
			return fmt.Errorf("duplicate command %q", name)
		}
		commandNames[name] = struct{}{}
		if strings.TrimSpace(command.Title) == "" {
			return fmt.Errorf("command %q title is required", name)
		}
		if strings.TrimSpace(command.Summary) == "" {
			return fmt.Errorf("command %q summary is required", name)
		}
		if strings.TrimSpace(command.Guide) == "" {
			return fmt.Errorf("command %q guide is required", name)
		}
		if len(command.Lessons) == 0 {
			return fmt.Errorf("command %q must include at least one lesson", name)
		}
		for j, ref := range command.Lessons {
			if strings.TrimSpace(ref.Path) == "" {
				return fmt.Errorf("command %q lesson %d path is required", name, j+1)
			}
			if strings.TrimSpace(ref.Focus) == "" {
				return fmt.Errorf("command %q lesson %d focus is required", name, j+1)
			}
		}
	}
	return nil
}

func findManifest(root string) (string, string, error) {
	for _, name := range []string{"roadmap.yaml", "roadmap.yml"} {
		path := filepath.Join(root, name)
		info, err := os.Stat(path)
		if err == nil && !info.IsDir() {
			return name, path, nil
		}
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			return "", "", fmt.Errorf("check roadmap manifest %s: %w", name, err)
		}
	}
	return "", "", errors.New("roadmap folder must contain roadmap.yaml or roadmap.yml")
}

func readRoadmapFile(root, rel string, limit int64) ([]byte, error) {
	fullPath, err := lessons.ResolveSafePath(root, rel)
	if err != nil {
		return nil, err
	}
	return readLimitedFile(fullPath, limit)
}

func readLimitedFile(path string, limit int64) ([]byte, error) {
	info, err := os.Lstat(path)
	if err != nil {
		return nil, err
	}
	if info.IsDir() {
		return nil, fmt.Errorf("%s is a directory", path)
	}
	if info.Mode()&os.ModeSymlink != 0 {
		return nil, fmt.Errorf("%s is a symlink", path)
	}

	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	data, err := io.ReadAll(io.LimitReader(f, limit+1))
	if err != nil {
		return nil, err
	}
	if int64(len(data)) > limit {
		return nil, fmt.Errorf("file exceeds %d bytes", limit)
	}
	return data, nil
}

func writeFiles(target string, files map[string][]byte) error {
	for rel, data := range files {
		clean, err := cleanRoadmapPath(rel)
		if err != nil {
			return err
		}
		path := filepath.Join(target, filepath.FromSlash(clean))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(path, data, 0o644); err != nil {
			return err
		}
	}
	return nil
}

func cleanRoadmapPath(raw string) (string, error) {
	clean, err := lessons.CleanRelativePath(raw)
	if err != nil {
		return "", err
	}
	return filepath.ToSlash(clean), nil
}

func validID(id string) bool {
	return strings.TrimSpace(id) != "" && !strings.ContainsAny(id, "/\\\x00")
}
