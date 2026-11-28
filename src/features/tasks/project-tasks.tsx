"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { STATUSES, STATUS_LABEL } from "@/lib/constants";
import { can, type Role } from "@/lib/permissions";
import type { TaskDTO } from "@/lib/types";
import { formatDue } from "@/lib/utils";
import { createTask, deleteTask } from "./actions";
import { NewTaskDialog } from "./new-task-dialog";

export function ProjectTasks({
    projectKey,
    projectName,
    role,
    currentUserId,
    tasks,
}: {
    projectKey: string;
    projectName: string;
    role: Role;
    currentUserId: string;
    tasks: TaskDTO[];
}) {
    const [open, setOpen] = useState(false);
    const [pending, start] = useTransition();

    function onCreate(values: Record<string, FormDataEntryValue | null>) {
        start(async () => {
            const res = await createTask({ projectKey, ...values });
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success(`Created ${res.data.key}`);
            setOpen(false);
        });
    }

    function onDelete(t: TaskDTO) {
        start(async () => {
            const res = await deleteTask(t.id);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success(`Deleted ${t.key}`);
        });
    }

    return (
        <main className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">
                    {projectName} <span className="text-sm font-normal text-muted">{projectKey}</span>
                </h1>
                {can(role, "task.create") && (
                    <Button variant="primary" onClick={() => setOpen(true)}>
                        New task
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {STATUSES.map((s) => {
                    const column = tasks.filter((t) => t.status === s);
                    return (
                        <section key={s} aria-label={STATUS_LABEL[s]} className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-muted">
                                {STATUS_LABEL[s]} <span>({column.length})</span>
                            </h2>
                            <ul className="flex flex-col gap-2">
                                {column.map((t) => (
                                    <li key={t.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
                                        <div className="flex items-baseline justify-between gap-2 text-xs text-muted">
                                            <span>{t.key}</span>
                                            {t.dueDate && <span>Due {formatDue(t.dueDate)}</span>}
                                        </div>
                                        <p className="text-sm font-semibold">{t.title}</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <PriorityBadge priority={t.priority} />
                                            {can(role, "task.delete", { isOwner: t.createdById === currentUserId }) && (
                                                <Button
                                                    variant="ghost"
                                                    className="ml-auto min-h-9 px-2"
                                                    disabled={pending}
                                                    aria-label={`Delete ${t.key}`}
                                                    onClick={() => onDelete(t)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>

            <NewTaskDialog open={open} onClose={() => setOpen(false)} pending={pending} onCreate={onCreate} />
        </main>
    );
}