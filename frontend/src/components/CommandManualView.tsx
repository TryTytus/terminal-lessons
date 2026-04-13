import { ArrowLeft, BookOpen, TerminalSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownContent } from "@/components/MarkdownContent"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RoadmapCommand } from "@/types"

interface CommandManualViewProps {
  command: RoadmapCommand
  roadmapTitle: string
  hasActiveLesson: boolean
  backLabel: string
  onBack: () => void
  onShowLesson: () => void
}

export function CommandManualView({
  command,
  roadmapTitle,
  hasActiveLesson,
  backLabel,
  onBack,
  onShowLesson
}: CommandManualViewProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#eef3ed]">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto grid w-full max-w-5xl gap-8 p-5 lg:p-8">
          <div className="border-b border-[#c5d1c7] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft aria-hidden className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
              {hasActiveLesson ? (
                <Button onClick={onShowLesson} variant="secondary">
                  <TerminalSquare aria-hidden className="mr-2 h-4 w-4" />
                  Workspace
                </Button>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase text-[#2d6b55]">
              <BookOpen aria-hidden className="h-4 w-4" />
              Command lesson
              <Badge>{roadmapTitle}</Badge>
              <Badge>{command.name}</Badge>
            </div>
            <h2 className="mt-4 break-words text-4xl font-semibold leading-tight text-[#17211a]">
              {command.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#53635a]">
              {command.summary}
            </p>
          </div>

          <article className="min-w-0 border-b border-[#c5d1c7] pb-12">
            <MarkdownContent
              markdown={command.manualMarkdown || command.guideMarkdown}
              variant="manual"
              emptyMessage="No command lesson content yet."
            />
          </article>
        </div>
      </ScrollArea>
    </section>
  )
}
