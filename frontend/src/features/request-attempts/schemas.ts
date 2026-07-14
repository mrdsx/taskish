import z from "zod";

export const requestAttemptSchema = z.object({
  id: z.number(),
  host: z.string(),
  attempts: z.number(),
  lastAttempt: z.string(),
});
