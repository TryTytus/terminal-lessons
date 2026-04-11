export interface LessonSummary {
  id: string
  title: string
  commands: string[]
  difficulty: string
  intro: string
  checkCount: number
  hintCount: number
}

export interface Lesson {
  version: number
  id: string
  title: string
  commands: string[]
  difficulty: string
  intro: string
  workspace: {
    files: Array<{ path: string; content: string }>
  }
  hints: string[]
  solution: {
    commands: string[]
    explanation: string
  }
  checks: LessonCheck[]
}

export interface LessonCheck {
  type: string
  path?: string
  expected?: string
  pattern?: string
  trim?: boolean
}

export interface LessonSessionState {
  sessionID: string
  lessonID: string
  workspaceDir: string
  lesson?: Lesson
}

export interface TerminalOutputEvent {
  sessionID: string
  data: string
}

export interface TerminalExitEvent {
  sessionID: string
  exitCode: number
}

export interface TerminalErrorEvent {
  sessionID: string
  message: string
}

export interface CheckResult {
  type: string
  path?: string
  passed: boolean
  message: string
}

export interface CheckResultsEvent {
  sessionID: string
  results: CheckResult[]
}
