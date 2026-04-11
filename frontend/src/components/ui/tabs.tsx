import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex rounded-md border border-border bg-muted p-1", className)}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content
