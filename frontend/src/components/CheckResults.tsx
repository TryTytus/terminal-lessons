import { CheckCircle2, XCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CheckResult } from "@/types"

interface CheckResultsProps {
  results: CheckResult[]
}

export function CheckResults({ results }: CheckResultsProps) {
  if (results.length === 0) {
    return (
      <div className="border-t border-border bg-card p-3 text-sm text-muted-foreground">
        Run checks after completing the task.
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium">
        <span>Check results</span>
        <span>
          {results.filter((result) => result.passed).length}/{results.length} passed
        </span>
      </div>
      <ScrollArea className="max-h-40">
        <div className="grid gap-2 p-3 pt-0">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.path ?? "stdout"}-${index}`}
              className="flex items-start gap-2 rounded-md border border-border bg-background p-2 text-sm"
            >
              {result.passed ? (
                <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 text-primary" />
              ) : (
                <XCircle aria-hidden className="mt-0.5 h-4 w-4 text-destructive" />
              )}
              <div className="min-w-0">
                <div className="font-medium">
                  {result.type}
                  {result.path ? `: ${result.path}` : ""}
                </div>
                <div className="break-words text-muted-foreground">{result.message}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
