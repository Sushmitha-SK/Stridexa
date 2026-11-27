import type { Prisma } from "@/generated/prisma/client";
import type { ActivityTypeName } from "./constants";

type Tx = Prisma.TransactionClient;

/**
 * Every mutation calls this inside its own transaction so the timeline
 * can never drift from the data.
 */
export async function recordActivity(
    tx: Tx,
    input: {
        workspaceId: string;
        projectId: string | null;
        taskId: string | null;
        actorId: string;
        type: ActivityTypeName;
        metadata: Record<string, unknown>;
    },
) {
    return tx.activity.create({
        data: { ...input, metadata: input.metadata as Prisma.InputJsonValue },
    });
}