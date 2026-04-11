//go:build !windows

package terminal

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sync"
	"syscall"

	"github.com/creack/pty"
)

const DefaultMaxTranscriptBytes = 256 * 1024

type Config struct {
	ID                 string
	CWD                string
	Home               string
	Cols               int
	Rows               int
	MaxTranscriptBytes int
	OnOutput           func(sessionID, data string)
	OnExit             func(sessionID string, exitCode int)
	OnError            func(sessionID string, message string)
}

type Session struct {
	id                 string
	cmd                *exec.Cmd
	ptmx               *os.File
	maxTranscriptBytes int
	onOutput           func(sessionID, data string)
	onExit             func(sessionID string, exitCode int)
	onError            func(sessionID string, message string)

	mu         sync.Mutex
	transcript []byte
	stopOnce   sync.Once
	done       chan struct{}
}

func Start(ctx context.Context, cfg Config) (*Session, error) {
	if cfg.ID == "" {
		return nil, errors.New("session id is required")
	}
	if cfg.CWD == "" {
		return nil, errors.New("working directory is required")
	}
	cols := cfg.Cols
	rows := cfg.Rows
	if cols <= 0 {
		cols = 100
	}
	if rows <= 0 {
		rows = 30
	}
	maxTranscript := cfg.MaxTranscriptBytes
	if maxTranscript <= 0 {
		maxTranscript = DefaultMaxTranscriptBytes
	}

	shell := os.Getenv("SHELL")
	if shell == "" {
		shell = "/bin/sh"
	}

	cmd := exec.CommandContext(ctx, shell)
	cmd.Dir = cfg.CWD
	cmd.Env = sessionEnv(os.Environ(), cfg.Home)

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
	if err != nil {
		return nil, fmt.Errorf("start pty: %w", err)
	}

	session := &Session{
		id:                 cfg.ID,
		cmd:                cmd,
		ptmx:               ptmx,
		maxTranscriptBytes: maxTranscript,
		onOutput:           cfg.OnOutput,
		onExit:             cfg.OnExit,
		onError:            cfg.OnError,
		done:               make(chan struct{}),
	}
	go session.readLoop()

	return session, nil
}

func (s *Session) ID() string {
	return s.id
}

func (s *Session) Input(data string) error {
	s.mu.Lock()
	ptmx := s.ptmx
	s.mu.Unlock()
	if ptmx == nil {
		return errors.New("terminal session is closed")
	}
	_, err := io.WriteString(ptmx, data)
	if err != nil {
		return fmt.Errorf("write terminal input: %w", err)
	}
	return nil
}

func (s *Session) Resize(cols, rows int) error {
	if cols <= 0 || rows <= 0 {
		return nil
	}
	s.mu.Lock()
	ptmx := s.ptmx
	s.mu.Unlock()
	if ptmx == nil {
		return errors.New("terminal session is closed")
	}
	return pty.Setsize(ptmx, &pty.Winsize{Rows: uint16(rows), Cols: uint16(cols)})
}

func (s *Session) Stop() error {
	var err error
	s.stopOnce.Do(func() {
		s.mu.Lock()
		ptmx := s.ptmx
		s.ptmx = nil
		s.mu.Unlock()

		if ptmx != nil {
			err = ptmx.Close()
		}
		if s.cmd != nil && s.cmd.Process != nil {
			_ = s.cmd.Process.Signal(syscall.SIGHUP)
			_ = s.cmd.Process.Kill()
		}
	})
	return err
}

func (s *Session) Done() <-chan struct{} {
	return s.done
}

func (s *Session) Transcript() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return string(append([]byte(nil), s.transcript...))
}

func (s *Session) readLoop() {
	s.mu.Lock()
	ptmx := s.ptmx
	s.mu.Unlock()

	defer close(s.done)
	defer func() {
		s.mu.Lock()
		s.ptmx = nil
		s.mu.Unlock()
		if ptmx != nil {
			_ = ptmx.Close()
		}
	}()

	buf := make([]byte, 4096)
	for {
		n, err := ptmx.Read(buf)
		if n > 0 {
			data := string(buf[:n])
			s.appendTranscript(buf[:n])
			if s.onOutput != nil {
				s.onOutput(s.id, data)
			}
		}
		if err != nil {
			if !errors.Is(err, os.ErrClosed) && !errors.Is(err, io.EOF) && s.onError != nil {
				s.onError(s.id, err.Error())
			}
			break
		}
	}

	exitCode := 0
	if err := s.cmd.Wait(); err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = -1
			if s.onError != nil {
				s.onError(s.id, err.Error())
			}
		}
	}
	if s.onExit != nil {
		s.onExit(s.id, exitCode)
	}
}

func (s *Session) appendTranscript(data []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.transcript = append(s.transcript, data...)
	if len(s.transcript) <= s.maxTranscriptBytes {
		return
	}

	keepFrom := len(s.transcript) - s.maxTranscriptBytes
	s.transcript = append([]byte(nil), s.transcript[keepFrom:]...)
}

func sessionEnv(base []string, home string) []string {
	env := make([]string, 0, len(base)+3)
	for _, item := range base {
		if stringsHasAnyPrefix(item, "HOME=", "TERM=") {
			continue
		}
		env = append(env, item)
	}
	if home != "" {
		env = append(env, "HOME="+home)
	}
	env = append(env, "TERM=xterm-256color")
	return env
}

func stringsHasAnyPrefix(value string, prefixes ...string) bool {
	for _, prefix := range prefixes {
		if len(value) >= len(prefix) && value[:len(prefix)] == prefix {
			return true
		}
	}
	return false
}
