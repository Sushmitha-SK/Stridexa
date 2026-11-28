import { z } from "zod";
import { PRIORITIES, STATUSES } from "@/lib/constants";

export const taskFields = {
    title: z.string().trim().min(1, "Enter a title").max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    // yyyy-mm-dd from <input type="date">, or null to clear
    dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable()
        .optional(),
};

export const createTaskSchema = z.object({
    projectKey: z.string().min(1),
    ...taskFields,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const moveTaskSchema = z.object({
    id: z.string().min(1),
    status: z.enum(STATUSES),
    position: z.string().min(1).max(64),
});

export const updateTaskSchema = z.object({
    id: z.string().min(1),
    title: taskFields.title.optional(),
    description: taskFields.description,
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    dueDate: taskFields.dueDate,
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;