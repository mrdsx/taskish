import type z from "zod";
import type { requestAttemptSchema } from "./schemas";

export type RequestAttempt = z.infer<typeof requestAttemptSchema>;
