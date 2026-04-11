import { BookOpen, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { LessonSummary } from "@/types"

interface LessonListProps {
  lessons: LessonSummary[]
  activeLessonID?: string
  onImport: () => void
  onStart: (lessonID: string) => void
  busy: boolean
}

export function LessonList({
  lessons,
  activeLessonID,
  onImport,
  onStart,
  busy
}: LessonListProps) {
  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-border bg-card md:w-[320px]">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h1 className="text-lg font-semibold">Terminal Lessons</h1>
          <p className="text-sm text-muted-foreground">Practice POSIX commands</p>
        </div>
        <Button onClick={onImport} size="sm" disabled={busy}>
          Import
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-2 p-3">
          {lessons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Import a YAML lesson to begin.
            </div>
          ) : null}
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={cn(
                "grid gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary",
                activeLessonID === lesson.id && "border-primary"
              )}
              onClick={() => onStart(lesson.id)}
              disabled={busy}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="break-words text-sm font-semibold">{lesson.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge>{lesson.difficulty || "practice"}</Badge>
                    <Badge>{lesson.checkCount} checks</Badge>
                  </div>
                </div>
                {activeLessonID === lesson.id ? (
                  <Play aria-hidden className="mt-0.5 h-4 w-4 text-primary" />
                ) : (
                  <BookOpen aria-hidden className="mt-0.5 h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                {lesson.intro}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
