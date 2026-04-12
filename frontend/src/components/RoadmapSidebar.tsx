import {
  BookOpen,
  CheckCircle2,
  Circle,
  FolderPlus,
  Import,
  LibraryBig,
  Map,
  Play,
  Route
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { LessonSummary, Roadmap, RoadmapSummary } from "@/types"

interface RoadmapSidebarProps {
  roadmaps: RoadmapSummary[]
  selectedRoadmap?: Roadmap
  lessons: LessonSummary[]
  activeRoadmapID?: string
  activeLessonID?: string
  completedLessonIDs: Set<string>
  busy: boolean
  onImportLesson: () => void
  onImportRoadmap: () => void
  onSelectRoadmap: (roadmapID: string) => void
  onStartLesson: (lessonID: string) => void
  onStartRoadmapLesson: (roadmapID: string, lessonID: string) => void
}

export function RoadmapSidebar({
  roadmaps,
  selectedRoadmap,
  lessons,
  activeRoadmapID,
  activeLessonID,
  completedLessonIDs,
  busy,
  onImportLesson,
  onImportRoadmap,
  onSelectRoadmap,
  onStartLesson,
  onStartRoadmapLesson
}: RoadmapSidebarProps) {
  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-[#b8c8bc] bg-[#f7faf4] md:w-[380px]">
      <div className="border-b border-[#c9d6cb] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#2d6b55]">
              <Route aria-hidden className="h-4 w-4" />
              Terminal Lessons
            </div>
            <h1 className="mt-2 break-words text-xl font-semibold text-[#17211a]">
              Course roadmaps
            </h1>
            <p className="mt-1 text-sm leading-5 text-[#526156]">
              Learn commands through focused drills, flags, and capstones.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={onImportRoadmap} size="sm" disabled={busy}>
            <FolderPlus aria-hidden className="mr-2 h-4 w-4" />
            Roadmap
          </Button>
          <Button onClick={onImportLesson} variant="outline" size="sm" disabled={busy}>
            <Import aria-hidden className="mr-2 h-4 w-4" />
            Lesson
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-5 p-3">
          <section className="grid gap-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#17211a]">
                <Map aria-hidden className="h-4 w-4 text-[#2d6b55]" />
                Imported roadmaps
              </div>
              <Badge>{roadmaps.length}</Badge>
            </div>

            {roadmaps.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#b8c8bc] bg-white/70 p-4 text-sm leading-6 text-[#5a6b60]">
                Import a roadmap folder with `roadmap.yaml`, command guides, and
                lesson YAML files.
              </div>
            ) : null}

            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.id}
                className={cn(
                  "grid gap-2 rounded-lg border border-[#c9d6cb] bg-white p-3 text-left transition-colors hover:border-[#2d6b55]",
                  selectedRoadmap?.id === roadmap.id && "border-[#2d6b55] bg-[#eef6ef]"
                )}
                onClick={() => onSelectRoadmap(roadmap.id)}
                disabled={busy}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="break-words text-sm font-semibold text-[#17211a]">
                      {roadmap.title}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#5a6b60]">
                      {roadmap.summary}
                    </p>
                  </div>
                  {activeRoadmapID === roadmap.id ? (
                    <Play aria-hidden className="mt-0.5 h-4 w-4 text-[#2d6b55]" />
                  ) : (
                    <LibraryBig aria-hidden className="mt-0.5 h-4 w-4 text-[#718075]" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge>{roadmap.commandCount} commands</Badge>
                  <Badge>{roadmap.lessonCount} lessons</Badge>
                  {roadmap.difficulty ? <Badge>{roadmap.difficulty}</Badge> : null}
                </div>
              </button>
            ))}
          </section>

          {selectedRoadmap ? (
            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="text-sm font-semibold text-[#17211a]">Agenda</div>
                <Button
                  onClick={() => onSelectRoadmap(selectedRoadmap.id)}
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                >
                  Preview
                </Button>
              </div>

              {selectedRoadmap.commands.map((command) => (
                <div
                  key={command.name}
                  className="rounded-lg border border-[#c9d6cb] bg-white/90 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-[#2d6b55]">
                        {command.name}
                      </div>
                      <div className="mt-1 break-words text-sm font-semibold text-[#17211a]">
                        {command.title}
                      </div>
                    </div>
                    <Badge>{command.lessons.length}</Badge>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    {command.lessons.map((lesson) => {
                      const active =
                        activeRoadmapID === selectedRoadmap.id &&
                        activeLessonID === lesson.id
                      const completed = completedLessonIDs.has(lesson.id)

                      return (
                        <button
                          key={lesson.id}
                          className={cn(
                            "grid grid-cols-[18px_minmax(0,1fr)] items-start gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-[#edf5ef]",
                            active && "bg-[#dfeee4]"
                          )}
                          onClick={() =>
                            onStartRoadmapLesson(selectedRoadmap.id, lesson.id)
                          }
                          disabled={busy}
                        >
                          {completed ? (
                            <CheckCircle2
                              aria-hidden
                              className="mt-0.5 h-4 w-4 text-[#2d6b55]"
                            />
                          ) : (
                            <Circle
                              aria-hidden
                              className="mt-0.5 h-4 w-4 text-[#8a988d]"
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block break-words font-medium text-[#17211a]">
                              {lesson.focus}
                            </span>
                            <span className="mt-1 flex flex-wrap gap-1 text-[#657268]">
                              {lesson.flag ? (
                                <span className="font-mono">{lesson.flag}</span>
                              ) : null}
                              <span>{lesson.checkCount} checks</span>
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          <section className="grid gap-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#17211a]">
                <BookOpen aria-hidden className="h-4 w-4 text-[#2d6b55]" />
                Single lessons
              </div>
              <Badge>{lessons.length}</Badge>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#b8c8bc] bg-white/70 p-4 text-sm leading-6 text-[#5a6b60]">
                Import a standalone YAML lesson to practice outside a roadmap.
              </div>
            ) : null}

            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={cn(
                  "grid gap-2 rounded-lg border border-[#c9d6cb] bg-white p-3 text-left transition-colors hover:border-[#2d6b55]",
                  !activeRoadmapID &&
                    activeLessonID === lesson.id &&
                    "border-[#2d6b55] bg-[#eef6ef]"
                )}
                onClick={() => onStartLesson(lesson.id)}
                disabled={busy}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="break-words text-sm font-semibold text-[#17211a]">
                      {lesson.title}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge>{lesson.difficulty || "practice"}</Badge>
                      <Badge>{lesson.checkCount} checks</Badge>
                    </div>
                  </div>
                  {!activeRoadmapID && activeLessonID === lesson.id ? (
                    <Play aria-hidden className="mt-0.5 h-4 w-4 text-[#2d6b55]" />
                  ) : (
                    <BookOpen aria-hidden className="mt-0.5 h-4 w-4 text-[#718075]" />
                  )}
                </div>
                <p className="line-clamp-2 text-xs leading-5 text-[#5a6b60]">
                  {lesson.intro}
                </p>
              </button>
            ))}
          </section>
        </div>
      </ScrollArea>
    </aside>
  )
}
