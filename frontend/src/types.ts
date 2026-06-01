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
  roadmapID?: string
  workspaceDir: string
  lesson?: Lesson
}

export interface RoadmapSummary {
  id: string
  title: string
  summary: string
  description: string
  difficulty: string
  commands: string[]
  commandCount: number
  lessonCount: number
}

export interface Roadmap {
  version: number
  id: string
  title: string
  summary: string
  description: string
  difficulty: string
  commands: RoadmapCommand[]
}

export interface RoadmapCommand {
  name: string
  title: string
  summary: string
  guide: string
  guideMarkdown: string
  manual: string
  manualMarkdown: string
  lessons: RoadmapLessonRef[]
}

export interface RoadmapLessonRef {
  id: string
  path: string
  title: string
  intro: string
  difficulty: string
  commands: string[]
  focus: string
  flag?: string
  kind?: string
  checkCount: number
  hintCount: number
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

export type CourseGenerationProvider = "codex" | "claude"
export type CourseGenerationFormat = "roadmap" | "lesson"
export type CourseGenerationPhase =
  | "preparing"
  | "prompting"
  | "running"
  | "validating"
  | "importing"
  | "completed"
  | "failed"
  | "canceled"

export interface CourseGenerationRequest {
  provider: CourseGenerationProvider
  format: CourseGenerationFormat
  topic: string
  difficulty: string
  commands: string[]
  extraInstructions: string
  roadmapSize: string
}

export interface CourseGenerationResult {
  format: CourseGenerationFormat
  sourceDir: string
  lesson?: LessonSummary
  roadmap?: RoadmapSummary
}

export interface CourseGenerationState {
  runID: string
  phase: CourseGenerationPhase
  provider: CourseGenerationProvider
  format: CourseGenerationFormat
  message: string
  sourceDir: string
  result?: CourseGenerationResult
  error?: string
  startedAt: string
  completedAt?: string
}

export interface CourseGenerationLogEvent {
  runID: string
  stream: string
  line: string
}
