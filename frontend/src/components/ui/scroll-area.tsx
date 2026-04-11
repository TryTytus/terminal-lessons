import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

export function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root className={cn("overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none bg-muted p-0.5"
        orientation="vertical"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-sm bg-muted-foreground/40" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
