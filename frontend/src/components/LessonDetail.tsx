import { BookOpen, Lightbulb, RotateCcw, TestTube2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LessonSessionState } from "@/types"

interface LessonDetailProps {
  session?: LessonSessionState
  onRunChecks: () => void
  onReset: () => void
  manualCommandName?: string
  onOpenCommandManual?: () => void
  busy: boolean
}

export function LessonDetail({
  session,
  onRunChecks,
  onReset,
  manualCommandName,
  onOpenCommandManual,
  busy
}: LessonDetailProps) {
  const [visibleHints, setVisibleHints] = useState(0)
  const lesson = session?.lesson

  const commands = useMemo(() => lesson?.commands ?? [], [lesson])

  useEffect(() => {
    setVisibleHints(0)
  }, [lesson?.id])

  if (!lesson) {
    return (
      <section className="flex h-full min-h-[260px] items-center justify-center border-b border-border bg-background p-6 lg:border-b-0 lg:border-l">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Import or start a lesson</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Each lesson creates a fresh workspace and an active local shell for
            command practice.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-[320px] flex-col border-b border-border bg-background lg:border-b-0 lg:border-l">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold">{lesson.title}</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge>{lesson.difficulty || "practice"}</Badge>
              {commands.map((command) => (
                <Badge key={command}>{command}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenCommandManual ? (
              <Button
                onClick={onOpenCommandManual}
                variant="outline"
                size="sm"
                disabled={busy}
              >
                <BookOpen aria-hidden className="mr-2 h-4 w-4" />
                Command lesson
                {manualCommandName ? (
                  <span className="ml-1 font-mono text-xs text-muted-foreground">
                    {manualCommandName}
                  </span>
                ) : null}
              </Button>
            ) : null}
            <Button onClick={onReset} variant="outline" size="sm" disabled={busy}>
              <RotateCcw aria-hidden className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={onRunChecks} size="sm" disabled={busy}>
              <TestTube2 aria-hidden className="mr-2 h-4 w-4" />
              Check
            </Button>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{lesson.intro}</p>
      </div>

      <Tabs defaultValue="hints" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border p-3">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="min-h-0 flex-1 p-4">
          <TabsContent value="hints" className="m-0 grid gap-3">
            {lesson.hints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hints for this lesson.</p>
            ) : null}
            {lesson.hints.slice(0, visibleHints).map((hint, index) => (
              <div
                key={`${hint}-${index}`}
                className="rounded-lg border border-border bg-card p-3 text-sm leading-6"
              >
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <Lightbulb aria-hidden className="h-4 w-4 text-secondary" />
                  Hint {index + 1}
                </div>
                {hint}
              </div>
            ))}
            {visibleHints < lesson.hints.length ? (
              <Button
                variant="secondary"
                onClick={() => setVisibleHints((count) => count + 1)}
              >
                Reveal hint
              </Button>
            ) : null}
          </TabsContent>

          <TabsContent value="solution" className="m-0 grid gap-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {lesson.solution.explanation || "No explanation provided."}
            </p>
            <Separator />
            <div className="grid gap-2">
              {lesson.solution.commands.map((command) => (
                <code
                  key={command}
                  className="break-words rounded-md bg-[#121512] px-3 py-2 font-mono text-sm text-[#e5e7dc]"
                >
                  {command}
                </code>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="m-0 grid gap-2">
            {lesson.workspace.files.map((file) => (
              <div key={file.path} className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 text-sm font-medium">{file.path}</div>
                <pre className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs">
                  {file.content}
                </pre>
              </div>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </section>
  )
}
