import { useCallback, useEffect, useState } from "react"
import {
  ListLessons,
  ResetLesson,
  RunChecks,
  SelectAndImportLesson,
  StartLesson,
  StopLesson
} from "../wailsjs/go/main/App"
import { CheckResults } from "@/components/CheckResults"
import { LessonDetail } from "@/components/LessonDetail"
import { LessonList } from "@/components/LessonList"
import { TerminalPane } from "@/components/TerminalPane"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { CheckResult, LessonSessionState, LessonSummary } from "@/types"

export default function App() {
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [session, setSession] = useState<LessonSessionState | undefined>()
  const [checkResults, setCheckResults] = useState<CheckResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [terminalExit, setTerminalExit] = useState<number | undefined>()

  const loadLessons = useCallback(async () => {
    const loaded = await ListLessons()
    setLessons(loaded)
  }, [])

  useEffect(() => {
    loadLessons().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err))
    })
  }, [loadLessons])

  const importLesson = useCallback(async () => {
    setBusy(true)
    setError(undefined)
    try {
      await SelectAndImportLesson()
      await loadLessons()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!message.includes("no lesson file selected")) {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }, [loadLessons])

  const startLesson = useCallback(
    async (lessonID: string) => {
      setBusy(true)
      setError(undefined)
      setCheckResults([])
      setTerminalExit(undefined)
      try {
        if (session) {
          await StopLesson(session.sessionID).catch(() => undefined)
        }
        const nextSession = await StartLesson(lessonID)
        setSession(nextSession)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [session]
  )

  const runChecks = useCallback(async () => {
    if (!session) {
      return
    }
    setBusy(true)
    setError(undefined)
    try {
      const results = await RunChecks(session.sessionID)
      setCheckResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [session])

  const resetLesson = useCallback(async () => {
    if (!session) {
      return
    }
    setBusy(true)
    setError(undefined)
    setCheckResults([])
    setTerminalExit(undefined)
    try {
      const nextSession = await ResetLesson(session.sessionID)
      setSession(nextSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [session])

  const onTerminalError = useCallback((message: string) => {
    setError(message)
  }, [])

  const onTerminalExit = useCallback((exitCode: number) => {
    setTerminalExit(exitCode)
  }, [])

  return (
    <main className="flex h-full min-h-0 flex-col bg-background text-foreground md:flex-row">
      <LessonList
        lessons={lessons}
        activeLessonID={session?.lessonID}
        onImport={importLesson}
        onStart={startLesson}
        busy={busy}
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-h-0 flex-1 flex-col bg-[#1b211d] p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#d8dfd0]">
              <div className="min-w-0 break-words">
                {session ? (
                  <>
                    Workspace: <span className="font-mono">{session.workspaceDir}</span>
                  </>
                ) : (
                  "No active lesson"
                )}
              </div>
              {terminalExit !== undefined ? (
                <span>Shell exited with code {terminalExit}</span>
              ) : null}
            </div>
            <TerminalPane
              key={session?.sessionID ?? "empty"}
              sessionID={session?.sessionID}
              onError={onTerminalError}
              onExit={onTerminalExit}
            />
          </div>

          <LessonDetail
            session={session}
            onRunChecks={runChecks}
            onReset={resetLesson}
            busy={busy}
          />
        </div>
        <CheckResults results={checkResults} />
      </section>

      <Dialog open={error !== undefined} onOpenChange={(open) => !open && setError(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action failed</DialogTitle>
            <DialogDescription className="break-words leading-6">
              {error}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={() => setError(undefined)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
