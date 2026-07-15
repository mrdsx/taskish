import type z from "zod";
import type {
  deletedTaskSchema,
  exportedTasksSchema,
  taskInSchema,
  taskSchema,
} from "./schemas";

export type TaskIn = z.infer<typeof taskInSchema>;
export type Task = z.infer<typeof taskSchema>;
export type DeletedTask = z.infer<typeof deletedTaskSchema>;
export type ExportedTasks = z.infer<typeof exportedTasksSchema>;
