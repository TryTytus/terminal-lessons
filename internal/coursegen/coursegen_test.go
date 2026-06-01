package coursegen

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

const generatedLessonYAML = `
version: 1
id: ai-grep-errors
title: "Find error lines"
commands: ["grep"]
difficulty: "beginner"
intro: "Inspect app.log, find every line that contains ERROR, and write those matching lines to errors.txt. The check passes when errors.txt contains only the ERROR lines from the starting log file."
workspace:
  files:
    - path: "app.log"
      content: "INFO boot\nERROR crash\nERROR retry\n"
hints:
  - "Use grep with the literal text ERROR."
solution:
  commands:
    - "grep ERROR app.log > errors.txt"
  explanation: "grep prints matching lines, and > writes them to errors.txt."
checks:
  - type: "file_equals"
    path: "errors.txt"
    expected: "ERROR crash\nERROR retry\n"
`

func TestBuildPromptIncludesSchemaSafetyRulesAndClearIntroRequirement(t *testing.T) {
	req := Request{
		Provider:    ProviderCodex,
		Format:      FormatRoadmap,
		Topic:       "daily log triage",
		Difficulty:  "beginner",
		Commands:    []string{"grep", "sort"},
		RoadmapSize: "standard",
	}

	prompt := BuildPrompt(req, "/tmp/generated/source")

	required := []string{
		"/tmp/generated/source",
		"Create roadmap.yaml",
		"Never generate executable shell scripts",
		"Never use absolute paths",
		"stdout_matches",
		"Every lesson intro must tell the learner exactly what to do",
		"starting files they should inspect",
		"grep, sort",
	}
	for _, text := range required {
		if !strings.Contains(prompt, text) {
			t.Fatalf("prompt does not contain %q", text)
		}
	}
}

func TestProviderCommandArgs(t *testing.T) {
	codex, err := ProviderCommand(Request{Provider: ProviderCodex}, "/tmp/source", "prompt")
	if err != nil {
		t.Fatalf("ProviderCommand(codex) error = %v", err)
	}
	if codex.Name != "codex" || !codex.PromptOnStdin {
		t.Fatalf("codex spec = %#v", codex)
	}
	wantCodexArgs := "exec -c approval_policy=never --sandbox workspace-write --skip-git-repo-check -C /tmp/source -"
	if got := strings.Join(codex.Args, " "); got != wantCodexArgs {
		t.Fatalf("codex args = %q, want %q", got, wantCodexArgs)
	}

	claude, err := ProviderCommand(Request{Provider: ProviderClaude}, "/tmp/source", "prompt text")
	if err != nil {
		t.Fatalf("ProviderCommand(claude) error = %v", err)
	}
	if claude.Name != "claude" || claude.PromptOnStdin {
		t.Fatalf("claude spec = %#v", claude)
	}
	got := strings.Join(claude.Args, " ")
	for _, part := range []string{"--bare", "-p", "--permission-mode acceptEdits", "--tools Read,Write,Edit,MultiEdit", "--output-format stream-json", "prompt text"} {
		if !strings.Contains(got, part) {
			t.Fatalf("claude args %q missing %q", got, part)
		}
	}
}

func TestPrepareCreatesStagingPathWithSafeSlug(t *testing.T) {
	root := t.TempDir()
	run, err := Prepare(root, Request{
		Provider:   ProviderCodex,
		Format:     FormatLesson,
		Topic:      "Shell Pipes / Redirection?",
		Difficulty: "beginner",
	})
	if err != nil {
		t.Fatalf("Prepare() error = %v", err)
	}

	rel, err := filepath.Rel(root, run.SourceDir)
	if err != nil {
		t.Fatalf("relative source path: %v", err)
	}
	if !strings.HasPrefix(rel, filepath.Join("ai-generated")+string(filepath.Separator)) {
		t.Fatalf("SourceDir = %q, want under ai-generated", run.SourceDir)
	}
	if filepath.Base(run.SourceDir) != "source" {
		t.Fatalf("SourceDir = %q, want source leaf", run.SourceDir)
	}
	parent := filepath.Base(filepath.Dir(run.SourceDir))
	if strings.ContainsAny(parent, " /?") || !strings.Contains(parent, "shell-pipes-redirection") {
		t.Fatalf("run folder = %q, want sanitized topic slug", parent)
	}
	if _, err := os.Stat(run.SourceDir); err != nil {
		t.Fatalf("staging folder missing: %v", err)
	}
}

func TestRunProviderWithFakeProviderCreatesValidatedLesson(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("shell fixture is POSIX-only")
	}

	root := t.TempDir()
	run, err := Prepare(root, Request{
		Provider:   ProviderCodex,
		Format:     FormatLesson,
		Topic:      "grep errors",
		Difficulty: "beginner",
	})
	if err != nil {
		t.Fatalf("Prepare() error = %v", err)
	}
	fake := writeExecutable(t, `#!/bin/sh
cat >/dev/null
printf 'created lesson\n'
cat > lesson.yaml <<'YAML'
`+strings.TrimSpace(generatedLessonYAML)+`
YAML
`)

	var logs []LogEvent
	err = Runner{ProviderPaths: map[string]string{ProviderCodex: fake}}.RunProvider(
		context.Background(),
		run,
		func(event LogEvent) { logs = append(logs, event) },
	)
	if err != nil {
		t.Fatalf("RunProvider() error = %v", err)
	}
	if len(logs) == 0 || logs[0].Line != "created lesson" {
		t.Fatalf("logs = %#v", logs)
	}
	if err := ValidateSource(FormatLesson, run.SourceDir); err != nil {
		t.Fatalf("ValidateSource() error = %v", err)
	}
}

func TestValidateSourceRejectsInvalidGeneratedLesson(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "lesson.yaml"), []byte("version: 1\nid: bad\n"), 0o644); err != nil {
		t.Fatalf("write invalid lesson: %v", err)
	}

	err := ValidateSource(FormatLesson, dir)
	if err == nil {
		t.Fatal("ValidateSource() error = nil, want validation failure")
	}
	if !strings.Contains(err.Error(), "validate generated lesson.yaml") {
		t.Fatalf("ValidateSource() error = %v", err)
	}
}

func TestMinimalEnvAugmentsPathForHomebrewCLIs(t *testing.T) {
	env := MinimalEnv([]string{"PATH=/usr/bin:/bin", "HOME=/Users/example", "UNRELATED=drop"})
	joined := strings.Join(env, "\n")
	if !strings.Contains(joined, "HOME=/Users/example") {
		t.Fatalf("MinimalEnv() = %#v, want HOME preserved", env)
	}
	if strings.Contains(joined, "UNRELATED=drop") {
		t.Fatalf("MinimalEnv() = %#v, want unrelated variable dropped", env)
	}
	if !strings.Contains(joined, "/opt/homebrew/bin") || !strings.Contains(joined, "/usr/local/bin") {
		t.Fatalf("MinimalEnv() = %#v, want common CLI paths added", env)
	}
}

func TestRunProviderCanBeCanceled(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("shell fixture is POSIX-only")
	}

	run, err := Prepare(t.TempDir(), Request{
		Provider:   ProviderCodex,
		Format:     FormatLesson,
		Topic:      "cancel me",
		Difficulty: "beginner",
	})
	if err != nil {
		t.Fatalf("Prepare() error = %v", err)
	}
	fake := writeExecutable(t, "#!/bin/sh\ncat >/dev/null\nsleep 5\n")

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	err = Runner{ProviderPaths: map[string]string{ProviderCodex: fake}}.RunProvider(ctx, run, nil)
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("RunProvider() error = %v, want context.Canceled", err)
	}
}

func writeExecutable(t *testing.T, content string) string {
	t.Helper()

	path := filepath.Join(t.TempDir(), "fake-provider")
	if err := os.WriteFile(path, []byte(content), 0o755); err != nil {
		t.Fatalf("write fake provider: %v", err)
	}
	deadline := time.Now().Add(time.Second)
	for {
		if info, err := os.Stat(path); err == nil && info.Mode()&0o111 != 0 {
			return path
		}
		if time.Now().After(deadline) {
			t.Fatalf("fake provider did not become executable")
		}
		time.Sleep(10 * time.Millisecond)
	}
}
