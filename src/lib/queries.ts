import "server-only";
import { db } from "./db";

export async function getProjects(workspaceId: string) {
    return db.project.findMany({
        where: { workspaceId, archivedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, key: true, name: true, description: true },
    });
}

export async function getProjectByKey(workspaceId: string, key: string) {
    return db.project.findFirst({ where: { workspaceId, key, archivedAt: null } });
}