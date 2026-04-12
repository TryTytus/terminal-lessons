import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RoadmapOverview } from "./RoadmapOverview"
import type { Roadmap } from "@/types"

const roadmap: Roadmap = {
  version: 1,
  id: "text-search",
  title: "Text Search",
  summary: "Practice grep.",
  description: "Find text in daily logs.",
  difficulty: "beginner",
  commands: [
    {
      name: "grep",
      title: "Search text",
      summary: "Find matching lines.",
      guide: "commands/grep.md",
      guideMarkdown: "# grep\n\nUse `grep -i` for case-insensitive search.",
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
        },
        {
          id: "grep-ignore-case",
          path: "lessons/grep-ignore-case.yaml",
          title: "Ignore case",
          intro: "Create api-lines.txt.",
          difficulty: "beginner",
          commands: ["grep"],
          focus: "Ignore case",
          flag: "-i / --ignore-case",
          kind: "parameter",
          checkCount: 1,
          hintCount: 1
        }
      ]
    }
  ]
}

describe("RoadmapOverview", () => {
  it("renders roadmap progress, guide markdown, and starts the first lesson", async () => {
    const startRoadmapLesson = vi.fn()
    const showCommandManual = vi.fn()

    render(
      <RoadmapOverview
        roadmap={roadmap}
        roadmaps={[]}
        completedLessonIDs={new Set(["grep-basic"])}
        activeRoadmapID="text-search"
        activeLessonID="grep-basic"
        busy={false}
        onImportRoadmap={vi.fn()}
        onImportLesson={vi.fn()}
        onSelectRoadmap={vi.fn()}
        onStartRoadmapLesson={startRoadmapLesson}
        onShowCommandManual={showCommandManual}
        onShowLesson={vi.fn()}
      />
    )

    expect(screen.getByRole("heading", { name: "Text Search" })).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "grep" })).toBeInTheDocument()
    expect(screen.getByText("grep -i")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Continue course/i }))

    expect(startRoadmapLesson).toHaveBeenCalledWith(
      "text-search",
      "grep-ignore-case"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /Command lesson and cheat sheet/i })
    )
    expect(showCommandManual).toHaveBeenCalledWith("grep")
  })
})
