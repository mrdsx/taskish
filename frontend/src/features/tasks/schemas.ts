import z from "zod";

export const MAX_TITLE_LENGTH = 50;
const titleSchema = z.string().max(MAX_TITLE_LENGTH);

export const taskSchema = z.object({
  id: z.number(),
  title: titleSchema,
  subTasks: z.array(titleSchema),
});

export const taskInSchema = taskSchema.pick({
  title: true,
  subTasks: true,
});
