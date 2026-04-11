//go:build !windows

package terminal

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestSessionRunsShellAndCapturesTranscript(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	session, err := Start(ctx, Config{
		ID:   "test-session",
		CWD:  t.TempDir(),
		Cols: 80,
		Rows: 24,
	})
	if err != nil {
		t.Fatalf("Start() error = %v", err)
	}
	defer session.Stop()

	if err := session.Input("printf 'terminal-ok\\n'\nexit\n"); err != nil {
		t.Fatalf("Input() error = %v", err)
	}

	select {
	case <-session.Done():
	case <-time.After(3 * time.Second):
		t.Fatal("session did not exit")
	}

	if transcript := session.Transcript(); !strings.Contains(transcript, "terminal-ok") {
		t.Fatalf("Transcript() = %q", transcript)
	}
}
