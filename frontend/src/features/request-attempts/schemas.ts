import z from "zod";

export const requestAttemptSchema = z.object({
  id: z.number(),
  host: z.string(),
  lastAttempt: z.string(),
  location: z.string(),
  flagUrl: z.string(),
});
