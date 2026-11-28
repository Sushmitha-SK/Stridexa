import { Priority, Status } from "./constants";

export type Member = { id: string; name: string; imageUrl: string };

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type TaskDTO = {
    id: string;
    projectId: string;
    number: number;
    key: string; 
    title: string;
    description: string | null;
    status: Status;
    priority: Priority;
    position: string;
    assigneeId: string | null;
    createdById: string;
    dueDate: string | null; 
    createdAt: string; 
};