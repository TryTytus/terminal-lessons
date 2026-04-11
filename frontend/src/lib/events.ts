import { EventsOn } from "../../wailsjs/runtime/runtime"
import type {
  CheckResultsEvent,
  TerminalErrorEvent,
  TerminalExitEvent,
  TerminalOutputEvent
} from "@/types"

export const events = {
  terminalOutput: "terminal:output",
  terminalExit: "terminal:exit",
  terminalError: "terminal:error",
  lessonState: "lesson:state",
  checksResult: "checks:result"
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
