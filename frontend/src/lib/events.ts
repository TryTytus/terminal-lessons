import { EventsOn } from "../../wailsjs/runtime/runtime"
import type {
  CheckResultsEvent,
  CourseGenerationLogEvent,
  CourseGenerationState,
  TerminalErrorEvent,
  TerminalExitEvent,
  TerminalOutputEvent
} from "@/types"

export const events = {
  terminalOutput: "terminal:output",
  terminalExit: "terminal:exit",
  terminalError: "terminal:error",
  lessonState: "lesson:state",
  roadmapState: "roadmap:state",
  checksResult: "checks:result",
  coursegenState: "coursegen:state",
  coursegenLog: "coursegen:log"
} as const

type Handler<T> = (payload: T) => void

export function onTerminalOutput(handler: Handler<TerminalOutputEvent>) {
  return EventsOn(events.terminalOutput, (payload) => handler(payload as TerminalOutputEvent))
}

export function onTerminalExit(handler: Handler<TerminalExitEvent>) {
  return EventsOn(events.terminalExit, (payload) => handler(payload as TerminalExitEvent))
}

export function onTerminalError(handler: Handler<TerminalErrorEvent>) {
  return EventsOn(events.terminalError, (payload) => handler(payload as TerminalErrorEvent))
}

export function onCheckResults(handler: Handler<CheckResultsEvent>) {
  return EventsOn(events.checksResult, (payload) => handler(payload as CheckResultsEvent))
}

export function onCourseGenerationState(handler: Handler<CourseGenerationState>) {
  return EventsOn(events.coursegenState, (payload) =>
    handler(payload as CourseGenerationState)
  )
}

export function onCourseGenerationLog(handler: Handler<CourseGenerationLogEvent>) {
  return EventsOn(events.coursegenLog, (payload) =>
    handler(payload as CourseGenerationLogEvent)
  )
}
