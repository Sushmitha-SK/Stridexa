"use server";

import { requireWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { TaskRow, toTaskDTO } from "@/lib/mappers";
import { can } from "@/lib/permissions";
import { positionBetween, sortByPosition } from "@/lib/position";
import type { ActionResult, TaskDTO } from "@/lib/types";
import type { Status } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./schema";

const fail = (error: string): ActionResult<never> => ({ ok: false, error });
const VIEW_ONLY = "You have view-only access in this workspace.";

function parseDue(d: string | null | undefined) {
    if (d === undefined) return undefined;
    return d ? new Date(`${d}T12:00:00.000Z`) : null;
}

async function ownTask(taskId: string, workspaceId: string) {
    return db.task.findFirst({
        where: { id: taskId, project: { workspaceId } },
        include: { project: { select: { id: true, key: true } } },
    });
}

async function appendPosition(projectId: string, status: Status) {
    const inColumn: { position: string }[] = await db.task.findMany({
        where: { projectId, status },
        select: { position: true },
    });
    return positionBetween(sortByPosition(inColumn).at(-1)?.position ?? null, null);
}

export async function createTask(input: unknown): Promise<ActionResult<TaskDTO>> {
    const ctx = await requireWorkspace();
    if (!can(ctx.role, "task.create")) return fail(VIEW_ONLY);
    const parsed = createTaskSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid task");
    const v = parsed.data;

    const project = await db.project.findFirst({
        where: { workspaceId: ctx.workspaceId, key: v.projectKey, archivedAt: null },
    });
    if (!project) return fail("Project not found");

    const position = await appendPosition(project.id, v.status);

    const task = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const { taskCounter } = await tx.project.update({
            where: { id: project.id },
            data: { taskCounter: { increment: 1 } },
            select: { taskCounter: true },
        });
        const created = await tx.task.create({
            data: {
                projectId: project.id,
                number: taskCounter,
                title: v.title,
                description: v.description || null,
                status: v.status,
                priority: v.priority,
                dueDate: parseDue(v.dueDate) ?? null,
                position,
                createdById: ctx.userId,
            },
        });
        await recordActivity(tx, {
            workspaceId: ctx.workspaceId,
            projectId: project.id,
            taskId: created.id,
            actorId: ctx.userId,
            type: "TASK_CREATED",
            metadata: { key: `${project.key}-${created.number}`, title: created.title },
        });
        return created;
    });
    return { ok: true, data: toTaskDTO(task, project.key) };
}

export async function deleteTask(taskId: string): Promise<ActionResult<{ id: string }>> {
    const ctx = await requireWorkspace();
    const existing = await ownTask(taskId, ctx.workspaceId);
    if (!existing) return fail("Task not found");
    if (!can(ctx.role, "task.delete", { isOwner: existing.createdById === ctx.userId })) {
        return fail("Only a lead, an admin, or the person who created a task can delete it");
    }
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.task.delete({ where: { id: taskId } });
        await recordActivity(tx, {
            workspaceId: ctx.workspaceId,
            projectId: existing.projectId,
            taskId: null, // the task row is gone
            actorId: ctx.userId,
            type: "TASK_DELETED",
            metadata: { key: `${existing.project.key}-${existing.number}`, title: existing.title },
        });
    });
    return { ok: true, data: { id: taskId } };
}

export async function listTasks(projectKey: string): Promise<ActionResult<TaskDTO[]>> {
    const ctx = await requireWorkspace();
    const project = await db.project.findFirst({
        where: { workspaceId: ctx.workspaceId, key: projectKey, archivedAt: null },
    });
    if (!project) return fail("Project not found");
    const rows = await db.task.findMany({ where: { projectId: project.id } });
    return {
        ok: true,
        data: sortByPosition(rows.map((t: TaskRow) => toTaskDTO(t, project.key))),
    };
}

export async function moveTask(input: unknown): Promise<ActionResult<TaskDTO>> {
    const ctx = await requireWorkspace();
    if (!can(ctx.role, "task.move")) return fail(VIEW_ONLY);
    const parsed = moveTaskSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid move");
    const v = parsed.data;

    const existing = await ownTask(v.id, ctx.workspaceId);
    if (!existing) return fail("Task not found");

    const task = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const updated = await tx.task.update({
            where: { id: v.id },
            data: { status: v.status, position: v.position },
        });
        // Reordering inside a column is not worth an activity entry. Changing column is.
        if (existing.status !== v.status) {
            await recordActivity(tx, {
                workspaceId: ctx.workspaceId,
                projectId: existing.projectId,
                taskId: v.id,
                actorId: ctx.userId,
                type: "TASK_MOVED",
                metadata: {
                    key: `${existing.project.key}-${existing.number}`,
                    title: updated.title,
                    from: existing.status,
                    to: v.status,
                },
            });
        }
        return updated;
    });
    return { ok: true, data: toTaskDTO(task, existing.project.key) };
}


export async function updateTask(input: unknown): Promise<ActionResult<TaskDTO>> {
    const ctx = await requireWorkspace();
    if (!can(ctx.role, "task.edit")) return fail(VIEW_ONLY);
    const parsed = updateTaskSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid update");
    const { id, ...v } = parsed.data;

    const existing = await ownTask(id, ctx.workspaceId);
    if (!existing) return fail("Task not found");

    const statusChanged = v.status !== undefined && v.status !== existing.status;
    // A task that changes column from the panel goes to the bottom of that column.
    const newPosition = statusChanged ? await appendPosition(existing.projectId, v.status!) : undefined;
    const key = `${existing.project.key}-${existing.number}`;

    const task = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // `undefined` means "leave alone"; `null` means "clear it".
        const updated = await tx.task.update({
            where: { id },
            data: {
                ...(v.title !== undefined && { title: v.title }),
                ...(v.description !== undefined && { description: v.description || null }),
                ...(v.status !== undefined && { status: v.status }),
                ...(newPosition !== undefined && { position: newPosition }),
                ...(v.priority !== undefined && { priority: v.priority }),
                ...(v.dueDate !== undefined && { dueDate: parseDue(v.dueDate) }),
            },
        });
        await recordActivity(tx, {
            workspaceId: ctx.workspaceId,
            projectId: existing.projectId,
            taskId: id,
            actorId: ctx.userId,
            type: statusChanged ? "TASK_MOVED" : "TASK_UPDATED",
            metadata: statusChanged
                ? { key, title: updated.title, from: existing.status, to: updated.status }
                : { key, title: updated.title },
        });
        return updated;
    });
    return { ok: true, data: toTaskDTO(task, existing.project.key) };
}