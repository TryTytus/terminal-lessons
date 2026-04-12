import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type MarkdownVariant = "compact" | "manual"

interface MarkdownContentProps {
  markdown: string
  variant?: MarkdownVariant
  emptyMessage?: string
}

export function MarkdownContent({
  markdown,
  variant = "compact",
  emptyMessage = "No content yet."
}: MarkdownContentProps) {
  const blocks = parseMarkdown(markdown, variant)

  if (blocks.length === 0) {
    return <p className="text-sm text-[#5d6d63]">{emptyMessage}</p>
  }

  return (
    <div
      className={cn(
        "grid min-w-0 gap-3 text-[#334139]",
        variant === "manual" ? "text-base leading-8" : "text-sm leading-6"
      )}
    >
      {blocks}
    </div>
  )
}

function parseMarkdown(markdown: string, variant: MarkdownVariant): ReactNode[] {
  const blocks: ReactNode[] = []
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  let paragraph: string[] = []
  let list: string[] = []
  let code: string[] | undefined

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return
    }
    blocks.push(
      <p key={`p-${blocks.length}`} className="break-words">
        {renderInline(paragraph.join(" "))}
      </p>
    )
    paragraph = []
  }

  const flushList = () => {
    if (list.length === 0) {
      return
    }
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="grid gap-1 pl-5">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc break-words">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    )
    list = []
  }

  const flushCode = () => {
    if (!code) {
      return
    }
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className={cn(
          "overflow-auto rounded-md bg-[#17211a] p-3 font-mono text-[#edf5ee]",
          variant === "manual" ? "max-h-[520px] text-sm leading-6" : "max-h-56 text-xs leading-5"
        )}
      >
        {code.join("\n")}
      </pre>
    )
    code = undefined
  }

  const flushOpenBlocks = () => {
    flushParagraph()
    flushList()
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (trimmed.startsWith("```")) {
      if (code) {
        flushCode()
      } else {
        flushOpenBlocks()
        code = []
      }
      continue
    }

    if (code) {
      code.push(line)
      continue
    }

    if (trimmed === "") {
      flushOpenBlocks()
      continue
    }

    if (isTableHeader(lines, index)) {
      flushOpenBlocks()
      const tableLines = [trimmed]
      index += 2
      while (index < lines.length && lines[index].includes("|")) {
        tableLines.push(lines[index].trim())
        index += 1
      }
      index -= 1
      blocks.push(renderTable(tableLines, blocks.length))
      continue
    }

    if (trimmed.startsWith("> ")) {
      flushOpenBlocks()
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="border-l-4 border-[#e6b94f] pl-4 text-[#46554b]"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
      continue
    }

    if (trimmed.startsWith("### ")) {
      flushOpenBlocks()
      blocks.push(
        <h5
          key={`h5-${blocks.length}`}
          className={cn(
            "break-words pt-1 font-semibold text-[#17211a]",
            variant === "manual" ? "text-xl" : "text-base"
          )}
        >
          {renderInline(trimmed.slice(4))}
        </h5>
      )
      continue
    }

    if (trimmed.startsWith("## ")) {
      flushOpenBlocks()
      blocks.push(
        <h4
          key={`h4-${blocks.length}`}
          className={cn(
            "break-words pt-3 font-semibold text-[#17211a]",
            variant === "manual" ? "text-2xl" : "text-lg"
          )}
        >
          {renderInline(trimmed.slice(3))}
        </h4>
      )
      continue
    }

    if (trimmed.startsWith("# ")) {
      flushOpenBlocks()
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          className={cn(
            "break-words font-semibold text-[#17211a]",
            variant === "manual" ? "text-4xl leading-tight" : "text-xl"
          )}
        >
          {renderInline(trimmed.slice(2))}
        </h3>
      )
      continue
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph()
      list.push(trimmed.slice(2))
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushOpenBlocks()
  flushCode()
  return blocks
}

function isTableHeader(lines: string[], index: number) {
  const current = lines[index]?.trim() ?? ""
  const next = lines[index + 1]?.trim() ?? ""
  return current.includes("|") && isTableDelimiter(next)
}

function isTableDelimiter(line: string) {
  return line.includes("---") && line.replace(/[|\s:-]/g, "") === ""
}

function renderTable(lines: string[], key: number) {
  const [header, ...rows] = lines.map(splitTableRow)

  return (
    <div key={`table-${key}`} className="overflow-auto rounded-md border border-[#c5d1c7]">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead className="bg-[#e4ece5] text-[#17211a]">
          <tr>
            {header.map((cell, index) => (
              <th key={`${cell}-${index}`} className="border-b border-[#c5d1c7] px-3 py-2">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="odd:bg-white even:bg-[#f8faf4]">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className="border-t border-[#d9e2dc] px-3 py-2 align-top"
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function splitTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded-sm bg-[#dfe9e2] px-1.5 py-0.5 font-mono text-xs text-[#17211a]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
