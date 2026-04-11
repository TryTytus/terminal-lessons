import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { LessonDetail } from "./LessonDetail"
import type { LessonSessionState } from "@/types"

const session: LessonSessionState = {
  sessionID: "s1",
  lessonID: "sort-files-001",
  workspaceDir: "/tmp/lesson",
  lesson: {
    version: 1,
    id: "sort-files-001",
    title: "Sort names",
    commands: ["cat", "sort"],
    difficulty: "beginner",
    intro: "Sort the names.",
    workspace: {
      files: [{ path: "names.txt", content: "zeta\nalpha\n" }]
    },
    hints: ["Use cat first.", "Pipe into sort."],
    solution: {
      commands: ["cat names.txt | sort > sorted.txt"],
      explanation: "sort orders lines."
    },
    checks: [
      {
        type: "file_equals",
        path: "sorted.txt",
        expected: "alpha\nzeta\n"
      }
    ]
  }
}

describe("LessonDetail", () => {
  it("reveals hints incrementally", async () => {
    render(
      <LessonDetail
        session={session}
        onRunChecks={vi.fn()}
        onReset={vi.fn()}
        busy={false}
      />
    )

    expect(screen.queryByText("Use cat first.")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Reveal hint/i }))
    expect(screen.getByText("Use cat first.")).toBeInTheDocument()
    expect(screen.queryByText("Pipe into sort.")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Reveal hint/i }))
    expect(screen.getByText("Pipe into sort.")).toBeInTheDocument()
  })
})
