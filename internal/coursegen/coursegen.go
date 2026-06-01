package coursegen

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"sync"
	"time"

	"terminal-lessons/internal/lessons"
	"terminal-lessons/internal/roadmaps"
)

const (
	ProviderCodex  = "codex"
	ProviderClaude = "claude"

	FormatLesson  = "lesson"
	FormatRoadmap = "roadmap"

	PhasePreparing  = "preparing"
	PhasePrompting  = "prompting"
	PhaseRunning    = "running"
	PhaseValidating = "validating"
	PhaseImporting  = "importing"
	PhaseCompleted  = "completed"
	PhaseFailed     = "failed"
	PhaseCanceled   = "canceled"
)

var (
	allowedProviders = []string{ProviderCodex, ProviderClaude}
	allowedFormats   = []string{FormatLesson, FormatRoadmap}
)

type Request struct {
	Provider          string   `json:"provider"`
	Format            string   `json:"format"`
	Topic             string   `json:"topic"`
	Difficulty        string   `json:"difficulty"`
	Commands          []string `json:"commands"`
	ExtraInstructions string   `json:"extraInstructions"`
	RoadmapSize       string   `json:"roadmapSize"`
}

type Run struct {
	Request   Request
	RunID     string
	SourceDir string
	Prompt    string
	StartedAt time.Time
}

type State struct {
	RunID       string  `json:"runID"`
	Phase       string  `json:"phase"`
	Provider    string  `json:"provider"`
	Format      string  `json:"format"`
	Message     string  `json:"message"`
	SourceDir   string  `json:"sourceDir"`
	Result      *Result `json:"result,omitempty"`
	Error       string  `json:"error,omitempty"`
	StartedAt   string  `json:"startedAt"`
	CompletedAt *string `json:"completedAt,omitempty"`
}

type Result struct {
	Format    string            `json:"format"`
	SourceDir string            `json:"sourceDir"`
	Lesson    *lessons.Summary  `json:"lesson,omitempty"`
	Roadmap   *roadmaps.Summary `json:"roadmap,omitempty"`
}

type LogEvent struct {
	RunID  string `json:"runID"`
	Stream string `json:"stream"`
	Line   string `json:"line"`
}

type CommandSpec struct {
	Name          string
	Args          []string
	Dir           string
	PromptOnStdin bool
}

type Runner struct {
	ProviderPaths map[string]string
}

func Prepare(root string, req Request) (*Run, error) {
	normalized, err := NormalizeRequest(req)
	if err != nil {
		return nil, err
	}

	started := time.Now().UTC()
	suffix, err := randomHex(3)
	if err != nil {
		return nil, err
	}
	slug := slugify(normalized.Topic)
	runID := fmt.Sprintf("%s-%s-%s", started.Format("20060102-150405.000000000"), slug, suffix)
	sourceDir := filepath.Join(root, "ai-generated", runID, "source")
	if err := os.MkdirAll(sourceDir, 0o755); err != nil {
		return nil, fmt.Errorf("create AI course staging folder: %w", err)
	}

	return &Run{
		Request:   normalized,
		RunID:     runID,
		SourceDir: sourceDir,
		Prompt:    BuildPrompt(normalized, sourceDir),
		StartedAt: started,
	}, nil
}

func NormalizeRequest(req Request) (Request, error) {
	req.Provider = strings.ToLower(strings.TrimSpace(req.Provider))
	req.Format = strings.ToLower(strings.TrimSpace(req.Format))
	req.Topic = strings.TrimSpace(req.Topic)
	req.Difficulty = strings.TrimSpace(req.Difficulty)
	req.RoadmapSize = strings.ToLower(strings.TrimSpace(req.RoadmapSize))
	req.ExtraInstructions = strings.TrimSpace(req.ExtraInstructions)

	if !slices.Contains(allowedProviders, req.Provider) {
		return Request{}, fmt.Errorf("unsupported AI provider %q", req.Provider)
	}
	if !slices.Contains(allowedFormats, req.Format) {
		return Request{}, fmt.Errorf("unsupported generation format %q", req.Format)
	}
	if req.Topic == "" {
		return Request{}, errors.New("course topic is required")
	}
	if req.Difficulty == "" {
		req.Difficulty = "beginner"
	}
	if req.RoadmapSize == "" {
		req.RoadmapSize = "standard"
	}

	commands := make([]string, 0, len(req.Commands))
	seen := map[string]struct{}{}
	for _, command := range req.Commands {
		command = strings.TrimSpace(command)
		if command == "" {
			continue
		}
		if strings.ContainsAny(command, "\x00\r\n") {
			return Request{}, fmt.Errorf("command %q contains unsupported characters", command)
		}
		if _, ok := seen[command]; ok {
			continue
		}
		seen[command] = struct{}{}
		commands = append(commands, command)
	}
	req.Commands = commands

	return req, nil
}

func InitialState(run *Run) *State {
	return &State{
		RunID:     run.RunID,
		Phase:     PhasePreparing,
		Provider:  run.Request.Provider,
		Format:    run.Request.Format,
		Message:   "Preparing a clean generation workspace.",
		SourceDir: run.SourceDir,
		StartedAt: run.StartedAt.Format(time.RFC3339Nano),
	}
}

func StateForPhase(run *Run, phase, message string) *State {
	return &State{
		RunID:     run.RunID,
		Phase:     phase,
		Provider:  run.Request.Provider,
		Format:    run.Request.Format,
		Message:   message,
		SourceDir: run.SourceDir,
		StartedAt: run.StartedAt.Format(time.RFC3339Nano),
	}
}

func CompletedState(run *Run, result Result) *State {
	completedAt := time.Now().UTC().Format(time.RFC3339Nano)
	return &State{
		RunID:       run.RunID,
		Phase:       PhaseCompleted,
		Provider:    run.Request.Provider,
		Format:      run.Request.Format,
		Message:     "Course generated, validated, and imported.",
		SourceDir:   run.SourceDir,
		Result:      &result,
		StartedAt:   run.StartedAt.Format(time.RFC3339Nano),
		CompletedAt: &completedAt,
	}
}

func FailedState(run *Run, phase string, err error) *State {
	completedAt := time.Now().UTC().Format(time.RFC3339Nano)
	if phase == "" {
		phase = PhaseFailed
	}
	message := "Course generation failed."
	if errors.Is(err, context.Canceled) {
		phase = PhaseCanceled
		message = "Course generation was canceled."
	}
	return &State{
		RunID:       run.RunID,
		Phase:       phase,
		Provider:    run.Request.Provider,
		Format:      run.Request.Format,
		Message:     message,
		SourceDir:   run.SourceDir,
		Error:       err.Error(),
		StartedAt:   run.StartedAt.Format(time.RFC3339Nano),
		CompletedAt: &completedAt,
	}
}

func BuildPrompt(req Request, sourceDir string) string {
	var b strings.Builder
	writeLine := func(format string, args ...any) {
		_, _ = fmt.Fprintf(&b, format+"\n", args...)
	}

	writeLine("You are generating curriculum content for Terminal Lessons, a desktop app for learning terminal commands through task-based practice.")
	writeLine("")
	writeLine("Write files directly in this exact output directory:")
	writeLine("%s", sourceDir)
	writeLine("")
	writeLine("User request:")
	writeLine("- Topic: %s", req.Topic)
	writeLine("- Difficulty: %s", req.Difficulty)
	writeLine("- Output format: %s", req.Format)
	if len(req.Commands) > 0 {
		writeLine("- Commands to cover: %s", strings.Join(req.Commands, ", "))
	} else {
		writeLine("- Commands to cover: choose the most relevant POSIX shell commands for the topic.")
	}
	if req.Format == FormatRoadmap {
		writeLine("- Roadmap size: %s", req.RoadmapSize)
		writeLine("- Size guidance: small means 1-2 commands and 2-4 exercises; standard means 3-5 commands and 6-12 exercises; large means 6-8 commands and 12-20 exercises.")
	}
	if req.ExtraInstructions != "" {
		writeLine("- Extra instructions: %s", req.ExtraInstructions)
	}
	writeLine("")

	if req.Format == FormatLesson {
		writeLine("Required output:")
		writeLine("- Create exactly one lesson file at lesson.yaml.")
		writeLine("- Do not create a roadmap manifest.")
	} else {
		writeLine("Required output:")
		writeLine("- Create roadmap.yaml at the output directory root.")
		writeLine("- Create short command guides in commands/*.md.")
		writeLine("- Create optional full manuals in manuals/*.md when a command needs a deeper reference.")
		writeLine("- Create exercise YAML files in lessons/*.yaml.")
	}
	writeLine("")

	writeLine("Lesson YAML schema shape:")
	writeLine("version: 1")
	writeLine(`id: "safe-unique-lesson-id"`)
	writeLine(`title: "Human-readable lesson title"`)
	writeLine(`commands: ["command1", "command2"]`)
	writeLine(`difficulty: "beginner"`)
	writeLine(`intro: "Clear learner-facing task instructions."`)
	writeLine("workspace:")
	writeLine("  files:")
	writeLine(`    - path: "relative/path.txt"`)
	writeLine(`      content: "Initial file content\n"`)
	writeLine("hints:")
	writeLine(`  - "First hint."`)
	writeLine(`  - "Second hint."`)
	writeLine("solution:")
	writeLine("  commands:")
	writeLine(`    - "example command for learner reference only"`)
	writeLine(`  explanation: "Why the solution works."`)
	writeLine("checks:")
	writeLine(`  - type: "file_equals"`)
	writeLine(`    path: "relative/output.txt"`)
	writeLine(`    expected: "Expected content\n"`)
	writeLine("")

	writeLine("Strict curriculum rules:")
	writeLine("- Never generate executable shell scripts, arbitrary execution code, setup scripts, teardown scripts, or test scripts inside lesson YAML.")
	writeLine("- Do not create generated helper scripts outside YAML either; lessons must use small static workspace files only.")
	writeLine("- solution.commands are educational reference only and must not be treated as executable test logic.")
	writeLine("- All paths must be safe relative paths.")
	writeLine("- Never use absolute paths.")
	writeLine("- Never use .. path traversal.")
	writeLine("- Never include null bytes or platform-specific dangerous path tricks.")
	writeLine("- Keep generated workspace files small and focused.")
	writeLine("- Prefer deterministic checks that inspect files or terminal transcript text.")
	writeLine("- Use trim: true only when leading/trailing whitespace should not matter.")
	writeLine("- Do not invent new YAML fields.")
	writeLine("")

	writeLine("Permitted check types:")
	writeLine("- file_exists")
	writeLine("- file_not_exists")
	writeLine("- file_equals")
	writeLine("- file_contains")
	writeLine("- stdout_contains")
	writeLine("- stdout_matches")
	writeLine("")

	writeLine("Check rules:")
	writeLine("- file_exists, file_not_exists, file_equals, and file_contains require a safe relative path.")
	writeLine("- file_equals and file_contains use expected.")
	writeLine("- stdout_contains uses expected.")
	writeLine("- stdout_matches uses pattern as a regular expression.")
	writeLine("")

	writeLine("Intro clarity requirement:")
	writeLine("- Every lesson intro must tell the learner exactly what to do.")
	writeLine("- Include the starting files they should inspect, the target file or terminal output they must produce, any command/flag constraints, and how they will know the check should pass.")
	writeLine("- Write intros as complete learner-facing instructions, not terse summaries.")
	writeLine("")

	if req.Format == FormatRoadmap {
		writeLine("Roadmap manifest shape:")
		writeLine("version: 1")
		writeLine(`id: "safe-roadmap-id"`)
		writeLine(`title: "Human-readable course title"`)
		writeLine(`summary: "One-sentence course summary."`)
		writeLine(`description: "A practical description of what the learner will practice."`)
		writeLine(`difficulty: "beginner"`)
		writeLine("commands:")
		writeLine(`  - name: "grep"`)
		writeLine(`    title: "Search text with grep"`)
		writeLine(`    summary: "Find matching lines and use common flags."`)
		writeLine(`    guide: "commands/grep.md"`)
		writeLine(`    manual: "manuals/grep.md"`)
		writeLine("    lessons:")
		writeLine(`      - path: "lessons/grep-basic.yaml"`)
		writeLine(`        focus: "Search exact text without flags"`)
		writeLine(`        kind: "foundation"`)
		writeLine(`      - path: "lessons/grep-ignore-case.yaml"`)
		writeLine(`        focus: "Match text regardless of case"`)
		writeLine(`        flag: "-i / --ignore-case"`)
		writeLine(`        kind: "parameter"`)
		writeLine("")
		writeLine("Roadmap rules:")
		writeLine("- Each roadmap command must have a short Markdown guide and at least one lesson.")
		writeLine("- Use kind values only from foundation, parameter, pattern, capstone.")
		writeLine("- Include popular short and long flags where useful.")
		writeLine("- The roadmap manifest must reference every generated guide/manual/lesson by safe relative path.")
		writeLine("- Markdown files should teach usage and show expected command/output examples, but must not include runnable setup scripts.")
	}

	return strings.TrimSpace(b.String()) + "\n"
}

func ProviderCommand(req Request, sourceDir, prompt string) (CommandSpec, error) {
	switch req.Provider {
	case ProviderCodex:
		return CommandSpec{
			Name:          "codex",
			Args:          []string{"exec", "-c", "approval_policy=never", "--sandbox", "workspace-write", "--skip-git-repo-check", "-C", sourceDir, "-"},
			Dir:           sourceDir,
			PromptOnStdin: true,
		}, nil
	case ProviderClaude:
		return CommandSpec{
			Name: "claude",
			Args: []string{
				"--bare",
				"-p",
				"--permission-mode",
				"acceptEdits",
				"--tools",
				"Read,Write,Edit,MultiEdit",
				"--output-format",
				"stream-json",
				prompt,
			},
			Dir: sourceDir,
		}, nil
	default:
		return CommandSpec{}, fmt.Errorf("unsupported AI provider %q", req.Provider)
	}
}

func (r Runner) RunProvider(ctx context.Context, run *Run, log func(LogEvent)) error {
	spec, err := ProviderCommand(run.Request, run.SourceDir, run.Prompt)
	if err != nil {
		return err
	}
	if override := strings.TrimSpace(r.ProviderPaths[run.Request.Provider]); override != "" {
		spec.Name = override
	}
	return RunCommand(ctx, spec, run, log)
}

func RunCommand(ctx context.Context, spec CommandSpec, run *Run, log func(LogEvent)) error {
	executable, err := ResolveExecutable(spec.Name)
	if err != nil {
		return fmt.Errorf("%s CLI not found on PATH: %w", run.Request.Provider, err)
	}

	cmd := exec.CommandContext(ctx, executable, spec.Args...)
	cmd.Dir = spec.Dir
	cmd.Env = MinimalEnv(os.Environ())

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("capture provider stdout: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("capture provider stderr: %w", err)
	}

	var stdin io.WriteCloser
	if spec.PromptOnStdin {
		stdin, err = cmd.StdinPipe()
		if err != nil {
			return fmt.Errorf("open provider stdin: %w", err)
		}
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start %s CLI: %w", run.Request.Provider, err)
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go scanLog(run.RunID, "stdout", stdout, log, &wg)
	go scanLog(run.RunID, "stderr", stderr, log, &wg)

	if stdin != nil {
		if _, err := io.WriteString(stdin, run.Prompt); err != nil {
			_ = stdin.Close()
			_ = cmd.Process.Kill()
			wg.Wait()
			return fmt.Errorf("write provider prompt: %w", err)
		}
		if err := stdin.Close(); err != nil {
			_ = cmd.Process.Kill()
			wg.Wait()
			return fmt.Errorf("close provider prompt: %w", err)
		}
	}

	err = cmd.Wait()
	wg.Wait()
	if ctx.Err() != nil {
		return ctx.Err()
	}
	if err != nil {
		return fmt.Errorf("%s CLI failed: %w", run.Request.Provider, err)
	}
	return nil
}

func MinimalEnv(env []string) []string {
	allowed := map[string]struct{}{
		"HOME":                 {},
		"PATH":                 {},
		"TERM":                 {},
		"TMPDIR":               {},
		"XDG_CONFIG_HOME":      {},
		"XDG_CACHE_HOME":       {},
		"CODEX_HOME":           {},
		"CLAUDE_CONFIG_DIR":    {},
		"ANTHROPIC_BASE_URL":   {},
		"ANTHROPIC_AUTH_TOKEN": {},
		"ANTHROPIC_API_KEY":    {},
	}
	out := make([]string, 0, len(allowed))
	seen := map[string]struct{}{}
	for _, entry := range env {
		key, _, ok := strings.Cut(entry, "=")
		if !ok {
			continue
		}
		if _, allowedKey := allowed[key]; !allowedKey {
			continue
		}
		if _, duplicate := seen[key]; duplicate {
			continue
		}
		seen[key] = struct{}{}
		if key == "PATH" {
			out = append(out, "PATH="+augmentPath(strings.TrimPrefix(entry, "PATH=")))
			continue
		}
		out = append(out, entry)
	}
	if _, ok := seen["PATH"]; !ok {
		out = append(out, "PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin")
	}
	if _, ok := seen["TERM"]; !ok {
		out = append(out, "TERM=xterm-256color")
	}
	return out
}

func ResolveExecutable(name string) (string, error) {
	if executable, err := exec.LookPath(name); err == nil {
		return executable, nil
	}
	if strings.ContainsRune(name, filepath.Separator) {
		return exec.LookPath(name)
	}
	for _, dir := range []string{"/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"} {
		candidate := filepath.Join(dir, name)
		info, err := os.Stat(candidate)
		if err != nil || info.IsDir() || info.Mode()&0o111 == 0 {
			continue
		}
		return candidate, nil
	}
	return "", exec.ErrNotFound
}

func augmentPath(value string) string {
	parts := strings.Split(value, string(os.PathListSeparator))
	seen := map[string]struct{}{}
	for _, part := range parts {
		if part == "" {
			continue
		}
		seen[part] = struct{}{}
	}
	for _, fallback := range []string{"/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"} {
		if _, ok := seen[fallback]; ok {
			continue
		}
		parts = append(parts, fallback)
	}
	return strings.Join(parts, string(os.PathListSeparator))
}

func ValidateSource(format, sourceDir string) error {
	switch format {
	case FormatLesson:
		lessonPath := filepath.Join(sourceDir, "lesson.yaml")
		if _, _, err := lessons.ParseFile(lessonPath); err != nil {
			return fmt.Errorf("validate generated lesson.yaml: %w", err)
		}
		return nil
	case FormatRoadmap:
		if _, err := roadmaps.ParseDir(sourceDir); err != nil {
			return fmt.Errorf("validate generated roadmap folder: %w", err)
		}
		return nil
	default:
		return fmt.Errorf("unsupported generation format %q", format)
	}
}

func scanLog(runID, stream string, reader io.Reader, log func(LogEvent), wg *sync.WaitGroup) {
	defer wg.Done()
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 0, 16*1024), 1024*1024)
	for scanner.Scan() {
		if log != nil {
			log(LogEvent{RunID: runID, Stream: stream, Line: scanner.Text()})
		}
	}
	if err := scanner.Err(); err != nil && log != nil {
		log(LogEvent{RunID: runID, Stream: stream, Line: fmt.Sprintf("log capture error: %v", err)})
	}
}

var nonSlugChars = regexp.MustCompile(`[^a-z0-9._-]+`)

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = nonSlugChars.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-._")
	if value == "" {
		return "course"
	}
	if len(value) > 48 {
		value = strings.Trim(value[:48], "-._")
	}
	if value == "" {
		return "course"
	}
	return value
}

func randomHex(bytes int) (string, error) {
	buf := make([]byte, bytes)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("generate course run id: %w", err)
	}
	return hex.EncodeToString(buf), nil
}
