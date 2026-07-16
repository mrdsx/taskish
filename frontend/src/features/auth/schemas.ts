import z from "zod";

export const authSessionSchema = z.object({
  id: z.number(),
  host: z.string(),
  location: z.string(),
  flagUrl: z.string(),
  lastLogin: z.string(),
  expiresAt: z.string(),
});
