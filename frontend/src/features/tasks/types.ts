import type z from "zod";
import type {
  dailyTaskInSchema,
  dailyTaskSchema,
  deletedTaskSchema,
  exportedTasksSchema,
  taskInSchema,
  taskSchema,
} from "./schemas";

export type Task = z.infer<typeof taskSchema>;
export type TaskIn = z.infer<typeof taskInSchema>;
export type DeletedTask = z.infer<typeof deletedTaskSchema>;
export type DailyTask = z.infer<typeof dailyTaskSchema>;
export type DailyTaskIn = z.infer<typeof dailyTaskInSchema>;
export type ExportedTasks = z.infer<typeof exportedTasksSchema>;
