package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"terminal-lessons/internal/checks"
	"terminal-lessons/internal/lessons"
	"terminal-lessons/internal/terminal"
	"terminal-lessons/internal/workspace"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	eventTerminalOutput = "terminal:output"
	eventTerminalExit   = "terminal:exit"
	eventTerminalError  = "terminal:error"
	eventLessonState    = "lesson:state"
	eventChecksResult   = "checks:result"
)

type App struct {
	ctx   context.Context
	store *lessons.Store

	mu       sync.Mutex
	sessions map[string]*lessonSession
}

type lessonSession struct {
	lesson *lessons.Lesson
	ws     *workspace.Workspace
	term   *terminal.Session
}

type LessonSessionState struct {
	SessionID    string          `json:"sessionID"`
	LessonID     string          `json:"lessonID"`
	WorkspaceDir string          `json:"workspaceDir"`
	Lesson       *lessons.Lesson `json:"lesson"`
}

type TerminalOutputEvent struct {
	SessionID string `json:"sessionID"`
	Data      string `json:"data"`
}

type TerminalExitEvent struct {
	SessionID string `json:"sessionID"`
	ExitCode  int    `json:"exitCode"`
}

type TerminalErrorEvent struct {
	SessionID string `json:"sessionID"`
	Message   string `json:"message"`
}

type CheckResultsEvent struct {
	SessionID string          `json:"sessionID"`
	Results   []checks.Result `json:"results"`
}

func NewApp() *App {
	return &App{
		sessions: map[string]*lessonSession{},
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.store = lessons.NewStore(appDataDir())
}

func (a *App) shutdown(_ context.Context) {
	a.mu.Lock()
	ids := make([]string, 0, len(a.sessions))
	for id := range a.sessions {
		ids = append(ids, id)
	}
	a.mu.Unlock()

	for _, id := range ids {
		_ = a.StopLesson(id)
	}
}

func (a *App) ListLessons() ([]lessons.Summary, error) {
	if err := a.ensureStore(); err != nil {
		return nil, err
	}
	return a.store.List()
}

func (a *App) SelectAndImportLesson() (*lessons.Summary, error) {
	if a.ctx == nil {
		return nil, errors.New("application is not ready")
	}
	path, err := wailsruntime.OpenFileDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Import lesson",
		Filters: []wailsruntime.FileFilter{
			{DisplayName: "YAML Lessons (*.yaml, *.yml)", Pattern: "*.yaml;*.yml"},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("select lesson file: %w", err)
	}
	if path == "" {
		return nil, errors.New("no lesson file selected")
	}
	return a.ImportLesson(path)
}

func (a *App) ImportLesson(path string) (*lessons.Summary, error) {
	if err := a.ensureStore(); err != nil {
		return nil, err
	}
	lesson, err := a.store.Import(path)
	if err != nil {
		return nil, err
	}
	summary := lesson.Summary()
	a.emit(eventLessonState, summary)
	return &summary, nil
}

func (a *App) StartLesson(lessonID string) (*LessonSessionState, error) {
	if err := a.ensureStore(); err != nil {
		return nil, err
	}
	lesson, err := a.store.Load(lessonID)
	if err != nil {
		return nil, err
	}
	return a.startLesson(lesson)
}

func (a *App) TerminalInput(sessionID, data string) error {
	session, err := a.getSession(sessionID)
	if err != nil {
		return err
	}
	return session.term.Input(data)
}

func (a *App) TerminalResize(sessionID string, cols, rows int) error {
	session, err := a.getSession(sessionID)
	if err != nil {
		return err
	}
	return session.term.Resize(cols, rows)
}

func (a *App) RunChecks(sessionID string) ([]checks.Result, error) {
	session, err := a.getSession(sessionID)
	if err != nil {
		return nil, err
	}
	results := checks.Run(session.lesson, session.ws.Path, session.term.Transcript())
	a.emit(eventChecksResult, CheckResultsEvent{SessionID: sessionID, Results: results})
	return results, nil
}

func (a *App) ResetLesson(sessionID string) (*LessonSessionState, error) {
	session, err := a.removeSession(sessionID)
	if err != nil {
		return nil, err
	}
	lesson := session.lesson
	if err := stopAndRemove(session); err != nil {
		return nil, err
	}
	return a.startLesson(lesson)
}

func (a *App) StopLesson(sessionID string) error {
	session, err := a.removeSession(sessionID)
	if err != nil {
		return err
	}
	return stopAndRemove(session)
}

func (a *App) startLesson(lesson *lessons.Lesson) (*LessonSessionState, error) {
	ws, err := workspace.Create(lesson)
	if err != nil {
		return nil, err
	}

	sessionID, err := newSessionID()
	if err != nil {
		_ = workspace.Remove(ws)
		return nil, err
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	term, err := terminal.Start(ctx, terminal.Config{
		ID:   sessionID,
		CWD:  ws.Path,
		Home: ws.Home,
		Cols: 100,
		Rows: 30,
		OnOutput: func(sessionID, data string) {
			a.emit(eventTerminalOutput, TerminalOutputEvent{SessionID: sessionID, Data: data})
		},
		OnExit: func(sessionID string, exitCode int) {
			a.emit(eventTerminalExit, TerminalExitEvent{SessionID: sessionID, ExitCode: exitCode})
		},
		OnError: func(sessionID string, message string) {
			a.emit(eventTerminalError, TerminalErrorEvent{SessionID: sessionID, Message: message})
		},
	})
	if err != nil {
		_ = workspace.Remove(ws)
		return nil, err
	}

	a.mu.Lock()
	a.sessions[sessionID] = &lessonSession{lesson: lesson, ws: ws, term: term}
	a.mu.Unlock()

	state := &LessonSessionState{
		SessionID:    sessionID,
		LessonID:     lesson.ID,
		WorkspaceDir: ws.Path,
		Lesson:       lesson,
	}
	a.emit(eventLessonState, state)
	return state, nil
}

func (a *App) getSession(sessionID string) (*lessonSession, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	session, ok := a.sessions[sessionID]
	if !ok {
		return nil, fmt.Errorf("session %q not found", sessionID)
	}
	return session, nil
}

func (a *App) removeSession(sessionID string) (*lessonSession, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	session, ok := a.sessions[sessionID]
	if !ok {
		return nil, fmt.Errorf("session %q not found", sessionID)
	}
	delete(a.sessions, sessionID)
	return session, nil
}

func (a *App) ensureStore() error {
	if a.store != nil {
		return nil
	}
	root := appDataDir()
	a.store = lessons.NewStore(root)
	return nil
}

func (a *App) emit(event string, payload interface{}) {
	if a.ctx == nil {
		return
	}
	wailsruntime.EventsEmit(a.ctx, event, payload)
}

func stopAndRemove(session *lessonSession) error {
	if session == nil {
		return nil
	}

	var stopErr error
	if session.term != nil {
		stopErr = session.term.Stop()
		select {
		case <-session.term.Done():
		case <-time.After(500 * time.Millisecond):
		}
	}
	if err := workspace.Remove(session.ws); err != nil && stopErr == nil {
		stopErr = err
	}
	return stopErr
}

func newSessionID() (string, error) {
	var buf [12]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", fmt.Errorf("generate session id: %w", err)
	}
	return hex.EncodeToString(buf[:]), nil
}

func appDataDir() string {
	base, err := os.UserConfigDir()
	if err != nil || base == "" {
		base = os.TempDir()
	}
	return filepath.Join(base, "terminal-lessons")
}
