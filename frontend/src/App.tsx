import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ListRoadmaps,
  ListLessons,
  LoadRoadmap,
  ResetLesson,
  RunChecks,
  SelectAndImportLesson,
  SelectAndImportRoadmap,
  StartLesson,
  StartRoadmapLesson,
  StopLesson
} from "../wailsjs/go/main/App"
import { CheckResults } from "@/components/CheckResults"
import { LessonDetail } from "@/components/LessonDetail"
import { RoadmapOverview } from "@/components/RoadmapOverview"
import { RoadmapSidebar } from "@/components/RoadmapSidebar"
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
import type {
  CheckResult,
  LessonSessionState,
  LessonSummary,
  Roadmap,
  RoadmapSummary
} from "@/types"

type MainView = "roadmap" | "lesson"

const completedLessonsStorageKey = "terminal-lessons.completedLessons.v1"

function loadCompletedLessons() {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const value = window.localStorage.getItem(completedLessonsStorageKey)
    if (!value) {
      return []
    }
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export default function App() {
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | undefined>()
  const [session, setSession] = useState<LessonSessionState | undefined>()
  const [checkResults, setCheckResults] = useState<CheckResult[]>([])
  const [completedLessonIDs, setCompletedLessonIDs] = useState<string[]>(
    loadCompletedLessons
  )
  const [mainView, setMainView] = useState<MainView>("roadmap")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [terminalExit, setTerminalExit] = useState<number | undefined>()

  const completedLessonSet = useMemo(
    () => new Set(completedLessonIDs),
    [completedLessonIDs]
  )

  const loadLessons = useCallback(async () => {
    const loaded = await ListLessons()
    setLessons(loaded)
    return loaded
  }, [])

  const loadRoadmaps = useCallback(async () => {
    const loaded = await ListRoadmaps()
    setRoadmaps(loaded)
    return loaded
  }, [])

  useEffect(() => {
    async function loadInitialData() {
      const [loadedLessons, loadedRoadmaps] = await Promise.all([
        ListLessons(),
        ListRoadmaps()
      ])
      setLessons(loadedLessons)
      setRoadmaps(loadedRoadmaps)
      if (loadedRoadmaps.length > 0) {
        const roadmap = await LoadRoadmap(loadedRoadmaps[0].id)
        setSelectedRoadmap(roadmap)
      }
    }

    loadInitialData().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err))
    })
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        completedLessonsStorageKey,
        JSON.stringify(completedLessonIDs)
      )
    } catch {
      // Progress persistence is best-effort.
    }
  }, [completedLessonIDs])

  const selectRoadmap = useCallback(
    async (roadmapID: string) => {
      setBusy(true)
      setError(undefined)
      try {
        if (selectedRoadmap?.id === roadmapID) {
          setMainView("roadmap")
          return
        }
        const roadmap = await LoadRoadmap(roadmapID)
        setSelectedRoadmap(roadmap)
        setMainView("roadmap")
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [selectedRoadmap?.id]
  )

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

  const importRoadmap = useCallback(async () => {
    setBusy(true)
    setError(undefined)
    try {
      const summary = await SelectAndImportRoadmap()
      await loadRoadmaps()
      const roadmap = await LoadRoadmap(summary.id)
      setSelectedRoadmap(roadmap)
      setMainView("roadmap")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!message.includes("no roadmap folder selected")) {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }, [loadRoadmaps])

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
        setMainView("lesson")
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [session]
  )

  const startRoadmapLesson = useCallback(
    async (roadmapID: string, lessonID: string) => {
      setBusy(true)
      setError(undefined)
      setCheckResults([])
      setTerminalExit(undefined)
      try {
        if (session) {
          await StopLesson(session.sessionID).catch(() => undefined)
        }
        if (selectedRoadmap?.id !== roadmapID) {
          const roadmap = await LoadRoadmap(roadmapID)
          setSelectedRoadmap(roadmap)
        }
        const nextSession = await StartRoadmapLesson(roadmapID, lessonID)
        setSession(nextSession)
        setMainView("lesson")
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [selectedRoadmap?.id, session]
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
      if (results.length > 0 && results.every((result) => result.passed)) {
        setCompletedLessonIDs((ids) => {
          if (ids.includes(session.lessonID)) {
            return ids
          }
          return [...ids, session.lessonID].sort()
        })
      }
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
      <RoadmapSidebar
        roadmaps={roadmaps}
        selectedRoadmap={selectedRoadmap}
        lessons={lessons}
        activeRoadmapID={session?.roadmapID}
        activeLessonID={session?.lessonID}
        completedLessonIDs={completedLessonSet}
        onImportLesson={importLesson}
        onImportRoadmap={importRoadmap}
        onSelectRoadmap={(roadmapID) => {
          selectRoadmap(roadmapID).catch((err: unknown) => {
            setError(err instanceof Error ? err.message : String(err))
          })
        }}
        onStartLesson={startLesson}
        onStartRoadmapLesson={startRoadmapLesson}
        busy={busy}
      />

      <section className="flex min-h-0 flex-1 flex-col">
        {mainView === "roadmap" ? (
          <RoadmapOverview
            roadmap={selectedRoadmap}
            roadmaps={roadmaps}
            completedLessonIDs={completedLessonSet}
            activeRoadmapID={session?.roadmapID}
            activeLessonID={session?.lessonID}
            onImportLesson={importLesson}
            onImportRoadmap={importRoadmap}
            onSelectRoadmap={(roadmapID) => {
              selectRoadmap(roadmapID).catch((err: unknown) => {
                setError(err instanceof Error ? err.message : String(err))
              })
            }}
            onStartRoadmapLesson={startRoadmapLesson}
            onShowLesson={() => setMainView("lesson")}
            busy={busy}
          />
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="flex min-h-0 flex-1 flex-col bg-[#1b211d] p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#d8dfd0]">
                  <div className="min-w-0 break-words">
                    {session ? (
                      <>
                        Workspace:{" "}
                        <span className="font-mono">{session.workspaceDir}</span>
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
          </>
        )}

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
      </section>
    </main>
  )
}
