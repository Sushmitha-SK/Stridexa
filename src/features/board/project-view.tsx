"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createTask, listTasks, moveTask } from "@/features/tasks/actions";
import { NewTaskDialog } from "@/features/tasks/new-task-dialog";
import type { Role } from "@/lib/permissions";
import type { TaskDTO } from "@/lib/types";
import { unwrap } from "@/lib/unwrap";
import { useUI } from "@/stores/ui.store";
import { Board, type MoveInput } from "./board";

export function ProjectView({
    projectKey,
    projectName,
    role,
    initialTasks,
}: {
    projectKey: string;
    projectName: string;
    role: Role;
    initialTasks: TaskDTO[];
}) {
    const qc = useQueryClient();
    const key = useMemo(() => ["tasks", projectKey], [projectKey]);
    const ui = useUI();
    const readOnly = role === "viewer";
    const { data: tasks = initialTasks } = useQuery({
        queryKey: key,
        queryFn: () => unwrap(listTasks(projectKey)),
        initialData: initialTasks,
        refetchInterval: 8_000,
    });

    const done = tasks.filter((t) => t.status === "DONE").length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    function patchCache(id: string, patch: Partial<TaskDTO>) {
        qc.cancelQueries({ queryKey: key }); 
        const prev = qc.getQueryData<TaskDTO[]>(key); 
        qc.setQueryData<TaskDTO[]>(key, (old) => old?.map((t) => (t.id === id ? { ...t, ...patch } : t)));
        return prev;
    }

    const move = useMutation({
        mutationFn: (v: MoveInput) => unwrap(moveTask(v)),
        onSettled: () => qc.invalidateQueries({ queryKey: key }), 
    });

    function handleMove(v: MoveInput) {
        const prev = patchCache(v.id, { status: v.status, position: v.position });
        move.mutate(v, {
            onError: (e: Error) => {
                qc.setQueryData(key, prev);
                toast.error(`Couldn't move the task, so it was put back. ${e.message}`);
            },
        });
    }

    const create = useMutation({
        mutationFn: (v: Record<string, unknown>) => unwrap(createTask({ projectKey, ...v })),
        onSuccess: (t) => {
            toast.success(`Created ${t.key}`);
            ui.setNewTaskOpen(false);
            qc.invalidateQueries({ queryKey: key });
        },
        onError: (e: Error) => toast.error(e.message),
    });

    return (
        <main className="flex flex-col gap-5 p-4 md:p-8">
            <header className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold">{projectName}</h1>
                <span className="text-sm text-muted">{projectKey}</span>
                {readOnly && (
                    <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold">View only</span>
                )}
                <div className="ml-auto flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span>{percent}% complete</span>
                        <div
                            role="progressbar"
                            aria-label="Project progress"
                            aria-valuenow={percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            className="h-1.5 w-32 rounded-full bg-line"
                        >
                            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                    {!readOnly && (
                        <Button variant="primary" onClick={() => ui.setNewTaskOpen(true)}>
                            New task
                        </Button>
                    )}
                </div>
            </header>

            {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
                    {readOnly ? "No tasks yet." : "No tasks yet. Choose “New task” to add the first one."}
                </div>
            ) : (
                <Board
                    allTasks={tasks}
                    visibleTasks={tasks}
                    readOnly={readOnly}
                    onMove={handleMove}
                />
            )}

            <NewTaskDialog
                open={ui.newTaskOpen && !readOnly}
                onClose={() => ui.setNewTaskOpen(false)}
                pending={create.isPending}
                onCreate={(v) => create.mutate(v)}
            />
        </main>
    );
}