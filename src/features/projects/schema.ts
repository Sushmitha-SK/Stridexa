import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(2, "Enter a project name").max(80),
    key: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{2,5}$/, "Use 2 to 5 letters for the key, like WEB"),
    description: z.string().trim().max(500).optional(),
});