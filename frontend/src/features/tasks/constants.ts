// `spacing` units (see index.css)
export const DIALOG_PADDING = 6;
// for optimistic updates
export const DEFAULT_EXPIRATION_TIME = "expires in 6 days";

export const queryKeys = {
  tasks: ["tasks"],
  dailyTasks: ["daily-tasks"],
  trash: ["trash"],
} as const satisfies Record<string, readonly string[]>;
