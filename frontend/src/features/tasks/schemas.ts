import z from "zod";

export const MAX_TITLE_LENGTH = 50;
const titleSchema = z.string();
const titleInSchema = titleSchema.max(MAX_TITLE_LENGTH);

export const taskSchema = z.object({
  id: z.number(),
  title: titleSchema,
  subTasks: z.array(titleSchema),
});

export const taskInSchema = z.object({
  title: titleInSchema,
  subTasks: z.array(titleInSchema),
});

export const deletedTaskSchema = taskSchema.extend({
  expiresAt: z.string(),
});
