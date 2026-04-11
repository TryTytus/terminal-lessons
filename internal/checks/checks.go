package checks

import (
	"errors"
	"fmt"
	"os"
	"regexp"
	"strings"

	"terminal-lessons/internal/lessons"
)

type Result struct {
	Type    string `json:"type"`
	Path    string `json:"path,omitempty"`
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}

func Run(lesson *lessons.Lesson, workspaceDir, transcript string) []Result {
	results := make([]Result, 0, len(lesson.Checks))
	for _, check := range lesson.Checks {
		results = append(results, runOne(check, workspaceDir, transcript))
	}
	return results
}

func runOne(check lessons.Check, workspaceDir, transcript string) Result {
	result := Result{Type: check.Type, Path: check.Path}

	switch check.Type {
	case "file_exists":
		result.Passed = fileExists(workspaceDir, check.Path)
		result.Message = passFail(result.Passed, "file exists", "file does not exist")
	case "file_not_exists":
		result.Passed = !fileExists(workspaceDir, check.Path)
		result.Message = passFail(result.Passed, "file is absent", "file exists")
	case "file_equals":
		actual, err := readWorkspaceFile(workspaceDir, check.Path)
		if err != nil {
			return failed(result, err.Error())
		}
		result.Passed = normalize(actual, check.Trim) == normalize(check.Expected, check.Trim)
		result.Message = passFail(result.Passed, "file matches expected content", "file content differs")
	case "file_contains":
		actual, err := readWorkspaceFile(workspaceDir, check.Path)
		if err != nil {
			return failed(result, err.Error())
		}
		result.Passed = strings.Contains(normalize(actual, check.Trim), normalize(check.Expected, check.Trim))
		result.Message = passFail(result.Passed, "file contains expected text", "file does not contain expected text")
	case "stdout_contains":
		result.Passed = strings.Contains(normalize(transcript, check.Trim), normalize(check.Expected, check.Trim))
		result.Message = passFail(result.Passed, "terminal output contains expected text", "terminal output does not contain expected text")
	case "stdout_matches":
		matched, err := regexp.MatchString(check.Pattern, normalize(transcript, check.Trim))
		if err != nil {
			return failed(result, fmt.Sprintf("invalid regexp pattern: %v", err))
		}
		result.Passed = matched
		result.Message = passFail(result.Passed, "terminal output matches pattern", "terminal output does not match pattern")
	default:
		result.Passed = false
		result.Message = "unsupported check type"
	}

	return result
}

func fileExists(workspaceDir, rel string) bool {
	path, err := lessons.ResolveSafePath(workspaceDir, rel)
	if err != nil {
		return false
	}
	_, err = os.Stat(path)
	return err == nil
}

func readWorkspaceFile(workspaceDir, rel string) (string, error) {
	path, err := lessons.ResolveSafePath(workspaceDir, rel)
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return "", fmt.Errorf("file %q does not exist", rel)
	}
	if err != nil {
		return "", fmt.Errorf("read file %q: %w", rel, err)
	}
	return string(data), nil
}

func normalize(value string, trim bool) string {
	value = strings.ReplaceAll(value, "\r\n", "\n")
	value = strings.ReplaceAll(value, "\r", "\n")
	if trim {
		return strings.TrimSpace(value)
	}
	return value
}

func passFail(passed bool, pass, fail string) string {
	if passed {
		return pass
	}
	return fail
}

func failed(result Result, message string) Result {
	result.Passed = false
	result.Message = message
	return result
}
