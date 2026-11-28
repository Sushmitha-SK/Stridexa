import "server-only";
import { db } from "./db";
import { toTaskDTO, type TaskRow } from "./mappers";
import { sortByPosition } from "./position";
import type { TaskDTO } from "./types";

export async function getProjects(workspaceId: string) {
    const projects = await db.project.findMany({
        where: { workspaceId, archivedAt: null },
        orderBy: { createdAt: "asc" },
        include: { tasks: { select: { status: true } } },
    });
    return projects.map((p: (typeof projects)[number]) => {
        const total = p.tasks.length;
        const done = p.tasks.filter((t: { status: string }) => t.status === "DONE").length;
        return {
            id: p.id,
            key: p.key,
            name: p.name,
            description: p.description,
            total,
            done,
            percent: total ? Math.round((done / total) * 100) : 0,
        };
    });
}

export async function getProjectByKey(workspaceId: string, key: string) {
    return db.project.findFirst({ where: { workspaceId, key, archivedAt: null } });
}

export async function getProjectTasks(projectId: string, projectKey: string): Promise<TaskDTO[]> {
    const rows = await db.task.findMany({ where: { projectId } });
    return sortByPosition(rows.map((t: TaskRow): TaskDTO => toTaskDTO(t, projectKey)));
}