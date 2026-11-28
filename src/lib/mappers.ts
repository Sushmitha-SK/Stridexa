import type { TaskDTO } from "./types";
import type { Priority, Status } from "./constants";

export type TaskRow = {
    id: string;
    projectId: string;
    number: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    position: string;
    assigneeId: string | null;
    createdById: string;
    dueDate: Date | null;
    createdAt: Date;
};

export function toTaskDTO(t: TaskRow, projectKey: string): TaskDTO {
    return {
        id: t.id,
        projectId: t.projectId,
        number: t.number,
        key: `${projectKey}-${t.number}`,
        title: t.title,
        description: t.description,
        status: t.status as Status,
        priority: t.priority as Priority,
        position: t.position,
        assigneeId: t.assigneeId,
        createdById: t.createdById,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
    };
}