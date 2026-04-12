import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  FolderPlus,
  Import,
  Play,
  Route,
  TerminalSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownContent } from "@/components/MarkdownContent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Roadmap, RoadmapSummary } from "@/types"

interface RoadmapOverviewProps {
  roadmap?: Roadmap
  roadmaps: RoadmapSummary[]
  completedLessonIDs: Set<string>
  activeRoadmapID?: string
  activeLessonID?: string
  busy: boolean
  onImportRoadmap: () => void
  onImportLesson: () => void
  onSelectRoadmap: (roadmapID: string) => void
  onStartRoadmapLesson: (roadmapID: string, lessonID: string) => void
  onShowCommandManual: (commandName: string) => void
  onShowLesson: () => void
}

export function RoadmapOverview({
  roadmap,
  roadmaps,
  completedLessonIDs,
  activeRoadmapID,
  activeLessonID,
  busy,
  onImportRoadmap,
  onImportLesson,
  onSelectRoadmap,
  onStartRoadmapLesson,
  onShowCommandManual,
  onShowLesson
}: RoadmapOverviewProps) {
  if (!roadmap) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-[#eef3ed]">
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-8 p-6 lg:p-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-[#2d6b55]">
                <Route aria-hidden className="h-4 w-4" />
                Roadmap
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#17211a]">
                Build a command-line course from folders of lessons.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#53635a]">
                Bring in a roadmap with command guides, parameter drills, and
                capstone exercises, then work through it from the agenda.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={onImportRoadmap} disabled={busy}>
                  <FolderPlus aria-hidden className="mr-2 h-4 w-4" />
                  Import roadmap
                </Button>
                <Button onClick={onImportLesson} variant="outline" disabled={busy}>
                  <Import aria-hidden className="mr-2 h-4 w-4" />
                  Import lesson
                </Button>
              </div>
            </div>

            {roadmaps.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roadmaps.map((summary) => (
                  <button
                    key={summary.id}
                    className="grid gap-3 rounded-lg border border-[#c5d1c7] bg-white p-4 text-left transition-colors hover:border-[#2d6b55]"
                    onClick={() => onSelectRoadmap(summary.id)}
                    disabled={busy}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="break-words font-semibold text-[#17211a]">
                          {summary.title}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5d6d63]">
                          {summary.summary}
                        </p>
                      </div>
                      <ArrowRight aria-hidden className="mt-1 h-4 w-4 text-[#2d6b55]" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge>{summary.commandCount} commands</Badge>
                      <Badge>{summary.lessonCount} lessons</Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </section>
    )
  }

  const roadmapLessons = roadmap.commands.flatMap((command) =>
    command.lessons.map((lesson) => ({ lesson }))
  )
  const completedCount = roadmapLessons.filter(({ lesson }) =>
    completedLessonIDs.has(lesson.id)
  ).length
  const progress =
    roadmapLessons.length > 0
      ? Math.round((completedCount / roadmapLessons.length) * 100)
      : 0
  const nextLesson =
    roadmapLessons.find(({ lesson }) => !completedLessonIDs.has(lesson.id)) ??
    roadmapLessons[0]

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#eef3ed]">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto grid w-full max-w-7xl gap-8 p-5 lg:p-8">
          <div className="overflow-hidden rounded-lg bg-[#17211a] text-white">
            <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase text-[#8fd8b3]">
                  <Route aria-hidden className="h-4 w-4" />
                  Roadmap
                  {roadmap.difficulty ? (
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-white">
                      {roadmap.difficulty}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 break-words text-4xl font-semibold leading-tight">
                  {roadmap.title}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#dce7dd]">
                  {roadmap.description || roadmap.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {activeLessonID ? (
                    <Button onClick={onShowLesson} variant="secondary" disabled={busy}>
                      <TerminalSquare aria-hidden className="mr-2 h-4 w-4" />
                      Resume workspace
                    </Button>
                  ) : null}
                  {nextLesson ? (
                    <Button
                      onClick={() =>
                        onStartRoadmapLesson(roadmap.id, nextLesson.lesson.id)
                      }
                      disabled={busy}
                    >
                      <Play aria-hidden className="mr-2 h-4 w-4" />
                      {completedCount > 0 ? "Continue course" : "Start course"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="self-end border-t border-white/15 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#dce7dd]">Progress</div>
                    <div className="mt-1 text-3xl font-semibold">{progress}%</div>
                  </div>
                  <div className="text-right text-sm text-[#dce7dd]">
                    {completedCount}/{roadmapLessons.length} complete
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-md bg-white/20">
                  <div
                    className="h-full rounded-md bg-[#e6b94f]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#dce7dd]">
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {roadmap.commands.length}
                    </div>
                    commands
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {roadmapLessons.length}
                    </div>
                    exercises
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {roadmap.commands.map((command, commandIndex) => {
              const commandCompleted = command.lessons.filter((lesson) =>
                completedLessonIDs.has(lesson.id)
              ).length

              return (
                <article
                  key={command.name}
                  className="grid gap-5 border-t border-[#c5d1c7] py-6 lg:grid-cols-[minmax(0,1fr)_420px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#17211a] px-2 py-1 font-mono text-xs text-white">
                        {String(commandIndex + 1).padStart(2, "0")}
                      </span>
                      <Badge>{commandCompleted}/{command.lessons.length} complete</Badge>
                      <Badge>{command.name}</Badge>
                    </div>
                    <h3 className="mt-4 break-words text-2xl font-semibold text-[#17211a]">
                      {command.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6d63]">
                      {command.summary}
                    </p>

                    <div className="mt-5 grid gap-2">
                      <button
                        className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-[#b8c8bc] bg-white p-3 text-left transition-colors hover:border-[#2d6b55]"
                        onClick={() => onShowCommandManual(command.name)}
                        disabled={busy}
                      >
                        <BookOpen
                          aria-hidden
                          className="mt-0.5 h-5 w-5 text-[#2d6b55]"
                        />
                        <span className="min-w-0">
                          <span className="block break-words font-semibold text-[#17211a]">
                            Command lesson and cheat sheet
                          </span>
                          <span className="mt-2 block text-sm leading-6 text-[#5d6d63]">
                            Read the full {command.name} lesson before starting
                            the drills.
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden
                          className="mt-1 h-4 w-4 text-[#2d6b55]"
                        />
                      </button>

                      {command.lessons.map((lesson) => {
                        const active =
                          activeRoadmapID === roadmap.id &&
                          activeLessonID === lesson.id
                        const completed = completedLessonIDs.has(lesson.id)

                        return (
                          <button
                            key={lesson.id}
                            className={cn(
                              "grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-[#d4ded6] bg-[#f8faf4] p-3 text-left transition-colors hover:border-[#2d6b55]",
                              active && "border-[#2d6b55] bg-[#e8f4eb]"
                            )}
                            onClick={() => onStartRoadmapLesson(roadmap.id, lesson.id)}
                            disabled={busy}
                          >
                            <span className="mt-0.5">
                              {completed ? (
                                <CheckCircle2
                                  aria-hidden
                                  className="h-5 w-5 text-[#2d6b55]"
                                />
                              ) : (
                                <Circle
                                  aria-hidden
                                  className="h-5 w-5 text-[#8b988d]"
                                />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                {lesson.flag ? (
                                  <span className="rounded-md bg-[#f0c85a] px-2 py-1 font-mono text-xs font-semibold text-[#1f2116]">
                                    {lesson.flag}
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-[#dbe7e0] px-2 py-1 text-xs font-semibold text-[#2c5b49]">
                                    {lesson.kind || "foundation"}
                                  </span>
                                )}
                                <span className="break-words font-semibold text-[#17211a]">
                                  {lesson.focus}
                                </span>
                              </span>
                              <span className="mt-2 block break-words text-sm leading-6 text-[#5d6d63]">
                                {lesson.intro}
                              </span>
                            </span>
                            <ArrowRight
                              aria-hidden
                              className="mt-1 h-4 w-4 text-[#2d6b55]"
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="min-w-0 lg:border-l lg:border-[#c5d1c7] lg:pl-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#17211a]">
                      <FileText aria-hidden className="h-4 w-4 text-[#2d6b55]" />
                      Command guide
                    </div>
                    <MarkdownContent
                      markdown={command.guideMarkdown}
                      emptyMessage="No guide content yet."
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
