import { z } from "zod";

export const profileSchema = z.object({
  context_data: z
    .string()
    .min(20, "Context must be at least 20 characters")
    .max(5000, "Context cannot exceed 5000 characters"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
