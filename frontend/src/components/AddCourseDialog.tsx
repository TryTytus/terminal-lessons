import {
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  TerminalSquare,
  XCircle
} from "lucide-react"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type {
  CourseGenerationFormat,
  CourseGenerationLogEvent,
  CourseGenerationPhase,
  CourseGenerationProvider,
  CourseGenerationRequest,
  CourseGenerationState
} from "@/types"

const phases: Array<{ phase: CourseGenerationPhase; label: string }> = [
  { phase: "preparing", label: "Prepare" },
  { phase: "prompting", label: "Prompt" },
  { phase: "running", label: "Run CLI" },
  { phase: "validating", label: "Validate" },
  { phase: "importing", label: "Import" },
  { phase: "completed", label: "Done" }
]

const activePhases = new Set<CourseGenerationPhase>([
  "preparing",
  "prompting",
  "running",
  "validating",
  "importing"
])

const statusCopy = [
  "Writing focused tasks with deterministic checks",
  "Keeping generated files inside the staging folder",
  "Checking YAML shape before anything is imported",
  "Making lesson intros explicit enough to act on"
]

interface AddCourseDialogProps {
  open: boolean
  state?: CourseGenerationState
  logs: CourseGenerationLogEvent[]
  onOpenChange: (open: boolean) => void
  onStart: (request: CourseGenerationRequest) => Promise<void>
  onCancel: (runID: string) => Promise<void>
}

export function AddCourseDialog({
  open,
  state,
  logs,
  onOpenChange,
  onStart,
  onCancel
}: AddCourseDialogProps) {
  const [provider, setProvider] = useState<CourseGenerationProvider>("codex")
  const [format, setFormat] = useState<CourseGenerationFormat>("roadmap")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("beginner")
  const [commands, setCommands] = useState("")
  const [roadmapSize, setRoadmapSize] = useState("standard")
  const [extraInstructions, setExtraInstructions] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const active = state ? activePhases.has(state.phase) : false
  const phaseIndex = state
    ? Math.max(
        phases.findIndex((item) => item.phase === state.phase),
        state.phase === "failed" || state.phase === "canceled" ? 0 : -1
      )
    : -1
  const elapsed = useMemo(() => {
    if (!state?.startedAt) {
      return "0:00"
    }
    const start = new Date(state.startedAt).getTime()
    const end = state.completedAt ? new Date(state.completedAt).getTime() : now
    const seconds = Math.max(0, Math.floor((end - start) / 1000))
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
  }, [now, state?.completedAt, state?.startedAt])
  const statusLine = state
    ? statusCopy[
        Math.min(statusCopy.length - 1, Math.max(0, phaseIndex)) %
          statusCopy.length
      ]
    : "Describe the course and choose who should generate it"

  useEffect(() => {
    if (!active) {
      return
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [active])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!topic.trim()) {
      return
    }

    setSubmitting(true)
    try {
      await onStart({
        provider,
        format,
        topic: topic.trim(),
        difficulty,
        commands: commands
          .split(",")
          .map((command) => command.trim())
          .filter(Boolean),
        extraInstructions: extraInstructions.trim(),
        roadmapSize
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,860px)] gap-0 overflow-hidden p-0">
        <div className="grid min-h-[560px] lg:grid-cols-[minmax(0,1fr)_330px]">
          <form onSubmit={handleSubmit} className="grid min-h-0 gap-5 p-5">
            <DialogHeader>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-[#2d6b55]">
                <Sparkles aria-hidden className="h-4 w-4" />
                Add course with AI
              </div>
              <DialogTitle className="text-2xl font-semibold text-[#17211a]">
                Generate a lesson or roadmap
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-[#5a6b60]">
                Codex or Claude writes files in a temporary staging folder. The app
                imports only content that passes the existing validators.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <SegmentedControl
                label="Provider"
                options={[
                  { value: "codex", label: "Codex" },
                  { value: "claude", label: "Claude" }
                ]}
                value={provider}
                disabled={active || submitting}
                onChange={(value) => setProvider(value as CourseGenerationProvider)}
              />

              <SegmentedControl
                label="Format"
                options={[
                  { value: "roadmap", label: "Roadmap" },
                  { value: "lesson", label: "Lesson" }
                ]}
                value={format}
                disabled={active || submitting}
                onChange={(value) => setFormat(value as CourseGenerationFormat)}
              />

              <label className="grid gap-2 text-sm font-medium text-[#17211a]">
                Topic
                <textarea
                  className="min-h-[96px] resize-none rounded-md border border-[#b8c8bc] bg-white px-3 py-2 text-sm leading-6 outline-none ring-[#2d6b55] transition focus:ring-2"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  disabled={active || submitting}
                  placeholder="Example: daily log triage with grep, sort, uniq, and redirection"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#17211a]">
                  Difficulty
                  <select
                    className="h-9 rounded-md border border-[#b8c8bc] bg-white px-3 text-sm outline-none ring-[#2d6b55] transition focus:ring-2"
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    disabled={active || submitting}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="beginner to intermediate">
                      Beginner to intermediate
                    </option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#17211a]">
                  Roadmap size
                  <select
                    className="h-9 rounded-md border border-[#b8c8bc] bg-white px-3 text-sm outline-none ring-[#2d6b55] transition focus:ring-2 disabled:bg-[#eef3ed]"
                    value={roadmapSize}
                    onChange={(event) => setRoadmapSize(event.target.value)}
                    disabled={format !== "roadmap" || active || submitting}
                  >
                    <option value="small">Small</option>
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-[#17211a]">
                Commands
                <input
                  className="h-9 rounded-md border border-[#b8c8bc] bg-white px-3 text-sm outline-none ring-[#2d6b55] transition focus:ring-2"
                  value={commands}
                  onChange={(event) => setCommands(event.target.value)}
                  disabled={active || submitting}
                  placeholder="grep, awk, sed"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#17211a]">
                Extra instructions
                <textarea
                  className="min-h-[82px] resize-none rounded-md border border-[#b8c8bc] bg-white px-3 py-2 text-sm leading-6 outline-none ring-[#2d6b55] transition focus:ring-2"
                  value={extraInstructions}
                  onChange={(event) => setExtraInstructions(event.target.value)}
                  disabled={active || submitting}
                  placeholder="Optional: focus on pipes, avoid git, make the tasks beginner friendly"
                />
              </label>
            </div>

            <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-[#d4ded6] pt-4">
              {active && state ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCancel(state.runID)}
                >
                  Cancel run
                </Button>
              ) : null}
              <Button
                type="submit"
                disabled={active || submitting || topic.trim().length === 0}
              >
                <Sparkles aria-hidden className="mr-2 h-4 w-4" />
                {submitting ? "Starting..." : "Generate course"}
              </Button>
            </div>
          </form>

          <aside className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] border-t border-[#c9d6cb] bg-[#17211a] text-[#dce7dd] lg:border-l lg:border-t-0">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#8fd8b3]">
                  <TerminalSquare aria-hidden className="h-4 w-4" />
                  Generation console
                </div>
                <div className="flex items-center gap-1 text-xs text-[#aebbac]">
                  <Clock3 aria-hidden className="h-3.5 w-3.5" />
                  {elapsed}
                </div>
              </div>
              <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3 font-mono text-xs leading-6">
                <div className="flex items-center gap-2 text-[#f0c85a]">
                  {state?.phase === "completed" ? (
                    <CheckCircle2 aria-hidden className="h-4 w-4 text-[#8fd8b3]" />
                  ) : state?.phase === "failed" || state?.phase === "canceled" ? (
                    <XCircle aria-hidden className="h-4 w-4 text-[#f29b9b]" />
                  ) : active ? (
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bot aria-hidden className="h-4 w-4 text-[#8fd8b3]" />
                  )}
                  <span>{state?.message ?? statusLine}</span>
                  {active ? <span className="coursegen-cursor" /> : null}
                </div>
                {state?.sourceDir ? (
                  <div className="mt-2 break-all text-[#aebbac]">{state.sourceDir}</div>
                ) : null}
                {state?.error ? (
                  <div className="mt-2 break-words text-[#f29b9b]">{state.error}</div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 border-b border-white/10 p-5">
              {phases.map((item, index) => {
                const complete =
                  state?.phase === "completed" ||
                  (phaseIndex >= 0 && index < phaseIndex)
                const current = state?.phase === item.phase
                return (
                  <div
                    key={item.phase}
                    className="grid grid-cols-[22px_minmax(0,1fr)] items-center gap-2 text-xs"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px]",
                        complete && "border-[#8fd8b3] bg-[#8fd8b3] text-[#17211a]",
                        current && "border-[#f0c85a] text-[#f0c85a]"
                      )}
                    >
                      {complete ? "OK" : index + 1}
                    </span>
                    <span
                      className={cn(
                        "truncate text-[#aebbac]",
                        current && "font-semibold text-white",
                        complete && "text-[#dce7dd]"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="min-h-0 overflow-auto p-5">
              <div className="mb-2 text-xs font-semibold uppercase text-[#8fd8b3]">
                CLI output
              </div>
              {logs.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/15 p-3 font-mono text-xs leading-6 text-[#aebbac]">
                  {statusLine}
                </div>
              ) : (
                <div className="grid gap-1 font-mono text-xs leading-5">
                  {logs.slice(-24).map((log, index) => (
                    <div
                      key={`${log.runID}-${index}-${log.line}`}
                      className="grid grid-cols-[46px_minmax(0,1fr)] gap-2"
                    >
                      <span
                        className={cn(
                          "uppercase text-[#8fd8b3]",
                          log.stream === "stderr" && "text-[#f0c85a]"
                        )}
                      >
                        {log.stream}
                      </span>
                      <span className="break-words text-[#dce7dd]">{log.line}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SegmentedControlProps {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  disabled?: boolean
  onChange: (value: string) => void
}

function SegmentedControl({
  label,
  value,
  options,
  disabled,
  onChange
}: SegmentedControlProps) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-[#17211a]">{label}</div>
      <div className="grid grid-cols-2 rounded-md border border-[#b8c8bc] bg-[#edf3ed] p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "h-8 rounded-sm px-3 text-sm font-medium text-[#53635a] transition-colors disabled:opacity-60",
              value === option.value && "bg-white text-[#17211a] shadow-sm"
            )}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
