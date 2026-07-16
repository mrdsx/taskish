import type z from "zod";
import type { authSessionSchema } from "./schemas";

export type AuthSession = z.infer<typeof authSessionSchema>;
