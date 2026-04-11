import { FitAddon } from "@xterm/addon-fit"
import { Terminal } from "@xterm/xterm"
import { useEffect, useRef } from "react"
import { TerminalInput, TerminalResize } from "../../wailsjs/go/main/App"
import {
  onTerminalError,
  onTerminalExit,
  onTerminalOutput
} from "@/lib/events"

interface TerminalPaneProps {
  sessionID?: string
  onError: (message: string) => void
  onExit: (exitCode: number) => void
}

export function TerminalPane({ sessionID, onError, onExit }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily:
        '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, monospace',
      fontSize: 13,
      lineHeight: 1.3,
      theme: {
        background: "#121512",
        foreground: "#e5e7dc",
        cursor: "#e4b33f",
        selectionBackground: "#2d5b4a"
      }
    })
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(containerRef.current)
    terminal.write("Choose a lesson to start an isolated practice shell.\r\n")

    const writeDisposable = terminal.onData((data) => {
      if (!sessionID) {
        return
      }
      TerminalInput(sessionID, data).catch((error: unknown) => {
        onError(error instanceof Error ? error.message : String(error))
      })
    })
    const resizeDisposable = terminal.onResize(({ cols, rows }) => {
      if (!sessionID) {
        return
      }
      TerminalResize(sessionID, cols, rows).catch((error: unknown) => {
        onError(error instanceof Error ? error.message : String(error))
      })
    })

    const cancelOutput = onTerminalOutput((payload) => {
      if (payload.sessionID === sessionID) {
        terminal.write(payload.data)
      }
    })
    const cancelExit = onTerminalExit((payload) => {
      if (payload.sessionID === sessionID) {
        terminal.writeln(`\r\n[process exited with code ${payload.exitCode}]`)
        onExit(payload.exitCode)
      }
    })
    const cancelError = onTerminalError((payload) => {
      if (payload.sessionID === sessionID) {
        onError(payload.message)
      }
    })

    const fit = () => {
      fitAddon.fit()
      if (sessionID) {
        const dimensions = fitAddon.proposeDimensions()
        if (dimensions) {
          TerminalResize(sessionID, dimensions.cols, dimensions.rows).catch(() => undefined)
        }
      }
    }
    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(containerRef.current)
    const fitTimer = window.setTimeout(fit, 0)

    return () => {
      window.clearTimeout(fitTimer)
      cancelOutput()
      cancelExit()
      cancelError()
      resizeObserver.disconnect()
      writeDisposable.dispose()
      resizeDisposable.dispose()
      terminal.dispose()
    }
  }, [onError, onExit, sessionID])

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[360px] overflow-hidden rounded-lg border border-[#28362e] bg-[#121512]"
      data-testid="terminal-pane"
    />
  )
}
