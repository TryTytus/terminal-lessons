import { beforeEach, describe, expect, it, vi } from "vitest"
import { onCheckResults, onTerminalOutput } from "./events"
import { EventsOn } from "../../wailsjs/runtime/runtime"

vi.mock("../../wailsjs/runtime/runtime", () => ({
  EventsOn: vi.fn()
}))

describe("events", () => {
  beforeEach(() => {
    vi.mocked(EventsOn).mockReset()
  })

  it("subscribes to terminal output", () => {
    const cancel = vi.fn()
    vi.mocked(EventsOn).mockReturnValueOnce(cancel)
    const handler = vi.fn()

    const returnedCancel = onTerminalOutput(handler)

    expect(EventsOn).toHaveBeenCalledWith("terminal:output", expect.any(Function))
    const callback = vi.mocked(EventsOn).mock.calls[0][1]
    callback({ sessionID: "s1", data: "ok" })
    expect(handler).toHaveBeenCalledWith({ sessionID: "s1", data: "ok" })
    expect(returnedCancel).toBe(cancel)
  })

  it("subscribes to check result events", () => {
    const handler = vi.fn()
    onCheckResults(handler)

    expect(EventsOn).toHaveBeenCalledWith("checks:result", expect.any(Function))
  })
})
