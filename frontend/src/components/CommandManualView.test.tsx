import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CommandManualView } from "./CommandManualView"
import type { RoadmapCommand } from "@/types"

const command: RoadmapCommand = {
  name: "grep",
  title: "Search text",
  summary: "Find matching lines.",
  guide: "commands/grep.md",
  guideMarkdown: "# grep\n\nShort guide.",
  manual: "manuals/grep.md",
  manualMarkdown:
    "# grep manual\n\n| Flag | Purpose |\n| --- | --- |\n| `-i` | Ignore case |\n",
  lessons: []
}

describe("CommandManualView", () => {
  it("renders the full manual and navigation actions", async () => {
    const backToRoadmap = vi.fn()
    const showLesson = vi.fn()

    render(
      <CommandManualView
        command={command}
        roadmapTitle="Text Search"
        hasActiveLesson={true}
        onBackToRoadmap={backToRoadmap}
        onShowLesson={showLesson}
      />
    )

    expect(screen.getByRole("heading", { name: "Search text" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "grep manual" })).toBeInTheDocument()
    expect(screen.getByText("Ignore case")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Roadmap/i }))
    expect(backToRoadmap).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /Workspace/i }))
    expect(showLesson).toHaveBeenCalled()
  })
})
