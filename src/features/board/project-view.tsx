"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { createTask, deleteTask, listTasks, moveTask, updateTask } from "@/features/tasks/actions";
import { NewTaskDialog } from "@/features/tasks/new-task-dialog";
import { TaskPanel } from "@/features/tasks/task-panel";
import { PRIORITIES, PRIORITY_LABEL, type Priority } from "@/lib/constants";
import { filterTasks } from "@/lib/filter";
import { can, type Role } from "@/lib/permissions";
import type { TaskDTO } from "@/lib/types";
import { unwrap } from "@/lib/unwrap";
import { cn } from "@/lib/utils";
import { useUI } from "@/stores/ui.store";
import { Board, type MoveInput } from "./board";
import { ListView } from "./list-view";

function isTyping(t: EventTarget | null) {
    const el = t as HTMLElement | null;
    return !!el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
}

export function ProjectView({
    projectKey,
    projectName,
    currentUserId,
    role,
    initialTasks,
}: {
    projectKey: string;
    projectName: string;
    currentUserId: string;
    role: Role;
    initialTasks: TaskDTO[];
}) {
    const qc = useQueryClient();
    const key = useMemo(() => ["tasks", projectKey], [projectKey]);
    const ui = useUI();
    const searchRef = useRef<HTMLInputElement>(null);
    const readOnly = role === "viewer";

    const { data: tasks = initialTasks } = useQuery({
        queryKey: key,
        queryFn: () => unwrap(listTasks(projectKey)),
        initialData: initialTasks,
        refetchInterval: 8_000,
    });

    // Filters belong to a project: start clean when you open another one.
    useEffect(() => {
        useUI.getState().resetFilters();
        useUI.getState().selectTask(null);
    }, [projectKey]);

    const visible = useMemo(
        () => filterTasks(tasks, { search: ui.search, priority: ui.priority }),
        [tasks, ui.search, ui.priority],
    );
    const filtered = visible.length !== tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const selected = tasks.find((t) => t.id === ui.selectedTaskId);

    // ---- optimistic helpers ----
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

    const update = useMutation({
        mutationFn: (v: { id: string } & Record<string, unknown>) => unwrap(updateTask(v)),
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    function handleUpdate(id: string, patch: Record<string, unknown>) {
        // The server stores dates as noon UTC; mirror that so the card matches after the refetch.
        const optimistic: Partial<TaskDTO> = {};
        for (const [k, v] of Object.entries(patch)) {
            if (k === "dueDate") optimistic.dueDate = v ? `${v}T12:00:00.000Z` : null;
            else (optimistic as Record<string, unknown>)[k] = v;
        }
        const prev = patchCache(id, optimistic);
        update.mutate(
            { id, ...patch },
            {
                onError: (e: Error) => {
                    qc.setQueryData(key, prev);
                    toast.error(e.message);
                },
            },
        );
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

    const remove = useMutation({
        mutationFn: (id: string) => unwrap(deleteTask(id)),
        onSuccess: () => {
            toast.success("Task deleted");
            ui.selectTask(null);
            qc.invalidateQueries({ queryKey: key });
        },
        onError: (e: Error) => toast.error(e.message),
    });

    // ---- keyboard shortcuts: C new task, / search, G then B or L switches view ----
    useEffect(() => {
        let gPending = false;
        let timer: ReturnType<typeof setTimeout>;
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
            const k = e.key.toLowerCase();
            if (gPending) {
                gPending = false;
                if (k === "b") useUI.getState().setView("board");
                if (k === "l") useUI.getState().setView("list");
                return;
            }
            if (k === "c" && !readOnly) {
                e.preventDefault();
                useUI.getState().setNewTaskOpen(true);
            } else if (k === "/") {
                e.preventDefault();
                searchRef.current?.focus();
            } else if (k === "g") {
                gPending = true;
                clearTimeout(timer);
                timer = setTimeout(() => (gPending = false), 1200);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            clearTimeout(timer);
        };
    }, [readOnly]);

    const tab = (v: "board" | "list", label: string) => (
        <button
            type="button"
            aria-pressed={ui.view === v}
            onClick={() => ui.setView(v)}
            className={cn(
                "min-h-11 rounded-lg px-3 text-sm",
                ui.view === v ? "bg-accent-soft font-semibold text-ink" : "text-muted hover:bg-accent-soft",
            )}
        >
            {label}
        </button>
    );

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
                            New task <kbd className="rounded border border-white/40 px-1 text-xs">C</kbd>
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="View and filters">
                <div className="flex gap-1">
                    {tab("board", "Board")}
                    {tab("list", "List")}
                </div>
                <Input
                    ref={searchRef}
                    type="search"
                    value={ui.search}
                    onChange={(e) => ui.setSearch(e.target.value)}
                    placeholder="Search tasks  ( / )"
                    aria-label="Search tasks"
                    className="max-w-56"
                />
                <Select
                    aria-label="Filter by priority"
                    value={ui.priority}
                    onChange={(e) => ui.setPriority(e.target.value as Priority | "ALL")}
                    className="w-auto"
                >
                    <option value="ALL">All priorities</option>
                    {PRIORITIES.filter((p) => p !== "NONE").map((p) => (
                        <option key={p} value={p}>
                            {PRIORITY_LABEL[p]}
                        </option>
                    ))}
                </Select>
                {(filtered || ui.search) && (
                    <Button variant="ghost" onClick={ui.resetFilters}>
                        Clear filters
                    </Button>
                )}
                {/* Announces filter results to screen readers */}
                <span className="sr-only" aria-live="polite">
                    Showing {visible.length} of {tasks.length} tasks
                </span>
            </div>

            {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
                    {readOnly ? (
                        "No tasks yet."
                    ) : (
                        <>
                            No tasks yet. Press <kbd className="rounded border border-line px-1">C</kbd> or choose
                            “New task” to add the first one.
                        </>
                    )}
                </div>
            ) : ui.view === "board" ? (
                <Board
                    allTasks={tasks}
                    visibleTasks={visible}
                    readOnly={readOnly}
                    onMove={handleMove}
                />
            ) : (
                <ListView tasks={visible} />
            )}

            <NewTaskDialog
                open={ui.newTaskOpen && !readOnly}
                onClose={() => ui.setNewTaskOpen(false)}
                pending={create.isPending}
                onCreate={(v) => create.mutate(v)}
            />
            <TaskPanel
                task={selected}
                role={role}
                canDelete={can(role, "task.delete", { isOwner: selected?.createdById === currentUserId })}
                onClose={() => ui.selectTask(null)}
                onUpdate={handleUpdate}
                onDelete={(id) => remove.mutate(id)}
            />
        </main>
    );
}