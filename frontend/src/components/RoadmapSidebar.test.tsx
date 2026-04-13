import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RoadmapSidebar } from "./RoadmapSidebar"
import type { Roadmap, RoadmapSummary } from "@/types"

const roadmapSummary: RoadmapSummary = {
  id: "text-search",
  title: "Text Search",
  summary: "Practice grep.",
  description: "Find text in daily logs.",
  difficulty: "beginner",
  commands: ["grep"],
  commandCount: 1,
  lessonCount: 1
}

const roadmap: Roadmap = {
  version: 1,
  ...roadmapSummary,
  commands: [
    {
      name: "grep",
      title: "Search text",
      summary: "Find matching lines.",
      guide: "commands/grep.md",
      guideMarkdown: "# grep\n\nShort guide.",
      manual: "manuals/grep.md",
      manualMarkdown: "# grep manual\n\nFull command lesson.",
      lessons: [
        {
          id: "grep-basic",
          path: "lessons/grep-basic.yaml",
          title: "Search exact text",
          intro: "Create errors.txt.",
          difficulty: "beginner",
          commands: ["grep"],
          focus: "Search exact text",
          kind: "foundation",
          checkCount: 1,
          hintCount: 1
        }
      ]
    }
  ]
}

describe("RoadmapSidebar", () => {
  it("shows command lessons in the agenda and opens the full manual", async () => {
    const showCommandManual = vi.fn()
    const startRoadmapLesson = vi.fn()

    render(
      <RoadmapSidebar
        roadmaps={[roadmapSummary]}
        selectedRoadmap={roadmap}
        lessons={[]}
        completedLessonIDs={new Set()}
        busy={false}
        onImportLesson={vi.fn()}
        onImportRoadmap={vi.fn()}
        onSelectRoadmap={vi.fn()}
        onStartLesson={vi.fn()}
        onStartRoadmapLesson={startRoadmapLesson}
        onShowCommandManual={showCommandManual}
      />
    )

    await userEvent.click(
      screen.getByRole("button", { name: /Command lesson Full grep reference/i })
    )

    expect(showCommandManual).toHaveBeenCalledWith("grep")

    await userEvent.click(screen.getByRole("button", { name: /Search exact text/i }))

    expect(startRoadmapLesson).toHaveBeenCalledWith("text-search", "grep-basic")
  })
})
