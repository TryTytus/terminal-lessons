//go:build windows

package terminal

import (
	"context"
	"errors"
)

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

type Session struct{}

func Start(_ context.Context, _ Config) (*Session, error) {
	return nil, errors.New("terminal sessions are only supported on macOS and Linux in the MVP")
}

func (s *Session) ID() string {
	return ""
}

func (s *Session) Input(_ string) error {
	return errors.New("terminal sessions are only supported on macOS and Linux in the MVP")
}

func (s *Session) Resize(_, _ int) error {
	return errors.New("terminal sessions are only supported on macOS and Linux in the MVP")
}

func (s *Session) Stop() error {
	return nil
}

func (s *Session) Done() <-chan struct{} {
	done := make(chan struct{})
	close(done)
	return done
}

func (s *Session) Transcript() string {
	return ""
}
