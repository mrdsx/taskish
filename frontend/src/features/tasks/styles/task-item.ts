export const taskItemStyles = {
  taskItem:
    "relative flex justify-between gap-2 overflow-hidden rounded-lg border bg-neutral-50 p-2 dark:bg-neutral-900",
  shield: "absolute inset-0 bg-muted opacity-50",

  content: "flex w-auto flex-col justify-center",
  title: "wrap-anywhere line-clamp-2 font-semibold text-lg",
  expirationLabel: "text-sm text-muted-foreground",
  subTasksList: "flex flex-wrap gap-1 mt-2",
  subTask:
    "wrap-anywhere flex w-fit items-center rounded-md bg-blue-200 px-2 dark:bg-blue-900",
  actions: "flex gap-2",
} as const satisfies Record<string, string>;
