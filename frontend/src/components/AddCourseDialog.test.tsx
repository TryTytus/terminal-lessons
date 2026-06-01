import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AddCourseDialog } from "./AddCourseDialog"
import type { CourseGenerationState } from "@/types"

describe("AddCourseDialog", () => {
  it("submits the guided form as a course generation request", async () => {
    const start = vi.fn().mockResolvedValue(undefined)

    render(
      <AddCourseDialog
        open
        logs={[]}
        onOpenChange={vi.fn()}
        onStart={start}
        onCancel={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "Claude" }))
    await userEvent.click(screen.getByRole("button", { name: "Lesson" }))
    await userEvent.type(
      screen.getByLabelText("Topic"),
      "daily log triage with grep"
    )
    await userEvent.type(screen.getByLabelText("Commands"), "grep, sort, uniq")
    await userEvent.type(
      screen.getByLabelText("Extra instructions"),
      "Make the intro explicit."
    )
    await userEvent.click(screen.getByRole("button", { name: /Generate course/i }))

    expect(start).toHaveBeenCalledWith({
      provider: "claude",
      format: "lesson",
      topic: "daily log triage with grep",
      difficulty: "beginner",
      commands: ["grep", "sort", "uniq"],
      extraInstructions: "Make the intro explicit.",
      roadmapSize: "standard"
    })
  })

  it("shows progress, logs, and cancel action while generation is running", async () => {
    const cancel = vi.fn().mockResolvedValue(undefined)
    const state: CourseGenerationState = {
      runID: "run-1",
      phase: "running",
      provider: "codex",
      format: "roadmap",
      message: "Running codex in the staged course folder.",
      sourceDir: "/tmp/source",
      startedAt: new Date().toISOString()
    }

    render(
      <AddCourseDialog
        open
        state={state}
        logs={[{ runID: "run-1", stream: "stdout", line: "creating files" }]}
        onOpenChange={vi.fn()}
        onStart={vi.fn()}
        onCancel={cancel}
      />
    )

    expect(screen.getByText("Running codex in the staged course folder.")).toBeInTheDocument()
    expect(screen.getByText("/tmp/source")).toBeInTheDocument()
    expect(screen.getByText("creating files")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /Cancel run/i }))

    expect(cancel).toHaveBeenCalledWith("run-1")
  })

  it("surfaces failed generation errors inside the dialog", () => {
    const state: CourseGenerationState = {
      runID: "run-2",
      phase: "failed",
      provider: "claude",
      format: "lesson",
      message: "Course generation failed.",
      sourceDir: "/tmp/source",
      error: "claude CLI not found on PATH",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }

    render(
      <AddCourseDialog
        open
        state={state}
        logs={[]}
        onOpenChange={vi.fn()}
        onStart={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText("Course generation failed.")).toBeInTheDocument()
    expect(screen.getByText("claude CLI not found on PATH")).toBeInTheDocument()
  })
})
