"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";
import { createProjectSchema } from "./schema";

export async function createProject(input: unknown): Promise<ActionResult<{ key: string }>> {
    const ctx = await requireWorkspace();
    if (!can(ctx.role, "project.create")) {
        return { ok: false, error: "Only admins and project leads can create projects" };
    }
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid project" };
    }
    const v = parsed.data;

    const taken = await db.project.findFirst({
        where: { workspaceId: ctx.workspaceId, key: v.key },
    });
    if (taken) return { ok: false, error: `The key ${v.key} is already used in this workspace` };

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const project = await tx.project.create({
            data: {
                workspaceId: ctx.workspaceId,
                name: v.name,
                key: v.key,
                description: v.description || null,
                createdById: ctx.userId,
            },
        });
        await recordActivity(tx, {
            workspaceId: ctx.workspaceId,
            projectId: project.id,
            taskId: null,
            actorId: ctx.userId,
            type: "PROJECT_CREATED",
            metadata: { name: project.name, key: project.key },
        });
    });
    revalidatePath("/", "layout"); // refresh the projects page AND the sidebar list
    return { ok: true, data: { key: v.key } };
}