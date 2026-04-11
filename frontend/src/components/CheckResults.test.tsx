import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CheckResults } from "./CheckResults"

describe("CheckResults", () => {
  it("renders empty state", () => {
    render(<CheckResults results={[]} />)

    expect(screen.getByText(/Run checks/)).toBeInTheDocument()
  })

  it("renders pass count and result messages", () => {
    render(
      <CheckResults
        results={[
          {
            type: "file_equals",
            path: "sorted.txt",
            passed: true,
            message: "file matches expected content"
          },
          {
            type: "stdout_contains",
            passed: false,
            message: "terminal output does not contain expected text"
          }
        ]}
      />
    )

    expect(screen.getByText("1/2 passed")).toBeInTheDocument()
    expect(screen.getByText("file_equals: sorted.txt")).toBeInTheDocument()
    expect(
      screen.getByText("terminal output does not contain expected text")
    ).toBeInTheDocument()
  })
})
