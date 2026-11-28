"use client";

import { useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { STATUSES, STATUS_LABEL, type Status } from "@/lib/constants";
import { positionBetween, sortByPosition } from "@/lib/position";
import type { TaskDTO } from "@/lib/types";
import { cn, formatDue, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { useUI } from "@/stores/ui.store";

type Items = Record<Status, string[]>; // column -> ordered task ids

const COL = "col:"; // droppable ids for the columns themselves
const isColumn = (id: string) => id.startsWith(COL);

function group(tasks: TaskDTO[]): Items {
    const out: Items = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    for (const t of sortByPosition(tasks)) out[t.status].push(t.id);
    return out;
}

function findContainer(items: Items, id: string): Status | undefined {
    if (isColumn(id)) return id.slice(COL.length) as Status;
    return STATUSES.find((s) => items[s].includes(id));
}

export type MoveInput = { id: string; status: Status; position: string };

export function Board({
    allTasks,
    visibleTasks,
    readOnly,
    onMove,
}: {
    allTasks: TaskDTO[];
    visibleTasks: TaskDTO[];
    readOnly: boolean;
    onMove: (m: MoveInput) => void;
}) {
    const byId = useMemo(() => new Map(allTasks.map((t) => [t.id, t])), [allTasks]);
    const base = useMemo(() => group(visibleTasks), [visibleTasks]);

    // While dragging we rearrange a local copy. Nothing is saved until the drop.
    const [draft, setDraft] = useState<Items | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const items = draft ?? base;
    const activeTask = activeId ? byId.get(activeId) : undefined;

    const sensors = useSensors(
        // 6px threshold so a plain click isn't mistaken for a drag
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const noSensors = useSensors(); // viewers can look but not drag

    function onDragStart(e: DragStartEvent) {
        setActiveId(String(e.active.id));
        setDraft(base);
    }

    // Fires as the card crosses into another column: move it in the draft.
    function onDragOver({ active, over }: DragOverEvent) {
        if (!over) return;
        const activeKey = String(active.id);
        const overKey = String(over.id);
        setDraft((prev) => {
            const cur = prev ?? base;
            const from = findContainer(cur, activeKey);
            const to = findContainer(cur, overKey);
            if (!from || !to || from === to) return prev;

            const overItems = cur[to];
            const overIndex = isColumn(overKey) ? overItems.length : overItems.indexOf(overKey);
            const translated = active.rect.current.translated;
            const below =
                !!translated && !isColumn(overKey) && translated.top > over.rect.top + over.rect.height / 2;
            const insertAt = overIndex < 0 ? overItems.length : overIndex + (below ? 1 : 0);

            return {
                ...cur,
                [from]: cur[from].filter((id) => id !== activeKey),
                [to]: [...overItems.slice(0, insertAt), activeKey, ...overItems.slice(insertAt)],
            };
        });
    }

    // The drop: work out the final column + index, then save ONE position.
    function onDragEnd({ active, over }: DragEndEvent) {
        const id = String(active.id);
        let cur = draft ?? base;
        const status = findContainer(cur, id);

        // reorder within the same column
        if (status && over && !isColumn(String(over.id)) && String(over.id) !== id) {
            const overStatus = findContainer(cur, String(over.id));
            if (overStatus === status) {
                const from = cur[status].indexOf(id);
                const to = cur[status].indexOf(String(over.id));
                if (from !== to && from >= 0 && to >= 0) {
                    cur = { ...cur, [status]: arrayMove(cur[status], from, to) };
                }
            }
        }

        setActiveId(null);
        setDraft(null);
        if (!status) return;

        const column = cur[status];
        const index = column.indexOf(id);
        const original = byId.get(id);
        if (!original) return;

        const unchanged = original.status === status && base[status].indexOf(id) === index;
        if (unchanged) return;

        // The new key goes strictly between the two neighbours' keys.
        const prevPos = index > 0 ? (byId.get(column[index - 1])?.position ?? null) : null;
        const nextPos =
            index < column.length - 1 ? (byId.get(column[index + 1])?.position ?? null) : null;

        try {
            onMove({ id, status, position: positionBetween(prevPos, nextPos) });
        } catch {
            toast.error("Couldn't work out the new position. Refresh and try again.");
        }
    }

    return (
        <DndContext
            sensors={readOnly ? noSensors : sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
                setActiveId(null);
                setDraft(null);
            }}
            accessibility={{
                announcements: {
                    onDragStart: ({ active }) => `Picked up ${byId.get(String(active.id))?.key ?? "task"}.`,
                    onDragOver: ({ active, over }) => {
                        const s = over && findContainer(items, String(over.id));
                        return s ? `${byId.get(String(active.id))?.key} is over ${STATUS_LABEL[s]}.` : undefined;
                    },
                    onDragEnd: ({ active, over }) => {
                        const s = over && findContainer(items, String(over.id));
                        return s
                            ? `Dropped ${byId.get(String(active.id))?.key} in ${STATUS_LABEL[s]}.`
                            : `Dropped ${byId.get(String(active.id))?.key}.`;
                    },
                    onDragCancel: ({ active }) =>
                        `Cancelled. ${byId.get(String(active.id))?.key} did not move.`,
                },
            }}
        >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-start gap-4">
                {STATUSES.map((s) => (
                    <Column key={s} status={s} ids={items[s]} byId={byId} readOnly={readOnly} />
                ))}
            </div>
            <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
        </DndContext>
    );
}

function Column({
    status,
    ids,
    byId,
    readOnly,
}: {
    status: Status;
    ids: string[];
    byId: Map<string, TaskDTO>;
    readOnly: boolean;
}) {
    // Droppable so you can drop into an EMPTY column
    const { setNodeRef, isOver } = useDroppable({ id: `${COL}${status}` });
    return (
        <section aria-label={STATUS_LABEL[status]} className="flex min-w-0 flex-col gap-2.5">
            <h2 className="text-sm font-semibold text-muted">
                {STATUS_LABEL[status]} <span aria-label={`${ids.length} tasks`}>· {ids.length}</span>
            </h2>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <ul
                    ref={setNodeRef}
                    className={cn(
                        "flex min-h-24 flex-col gap-2.5 rounded-xl p-1 transition-colors",
                        isOver && "bg-accent-soft",
                    )}
                >
                    {ids.length === 0 && (
                        <li className="rounded-lg border border-dashed border-line p-4 text-center text-xs text-muted">
                            {readOnly ? "Nothing here." : "Nothing here. Drag a task in, or use New task."}
                        </li>
                    )}
                    {ids.map((id) => {
                        const t = byId.get(id);
                        return t ? <SortableCard key={id} task={t} readOnly={readOnly} /> : null;
                    })}
                </ul>
            </SortableContext>
        </section>
    );
}

function SortableCard({ task, readOnly }: { task: TaskDTO; readOnly: boolean }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id, disabled: readOnly });
    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(isDragging && "opacity-40")}
        >
            <TaskCard
                task={task}
                handle={
                    readOnly ? null : (
                        // A dedicated handle, so clicking the title is never a drag
                        <button
                            ref={setActivatorNodeRef}
                            type="button"
                            aria-label={`Drag ${task.key}. Press space to pick up, arrow keys to move.`}
                            className="-ml-1 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted hover:bg-accent-soft active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical size={16} aria-hidden />
                        </button>
                    )
                }
            />
        </li>
    );
}

function TaskCard({
    task,
    handle,
    overlay,
}: {
    task: TaskDTO;
    handle?: React.ReactNode;
    overlay?: boolean;
}) {
    const selectTask = useUI((s) => s.selectTask);
    const overdue = isOverdue(task.dueDate, task.status);

    return (
        <div
            className={cn(
                "flex flex-col gap-2 rounded-xl border border-line bg-surface p-3",
                overlay && "rotate-1 border-accent shadow-xl",
            )}
        >
            <div className="flex items-center gap-1">
                {handle}
                <span className="text-xs text-muted">{task.key}</span>
            </div>
            <button
                type="button"
                onClick={() => selectTask(task.id)}
                className="text-left text-sm font-semibold leading-snug hover:underline"
            >
                {task.title}
            </button>
            <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                    <span
                        className={cn("text-xs", overdue ? "font-semibold text-red-700 dark:text-red-300" : "text-muted")}
                    >
                        {overdue && "Overdue · "}
                        {formatDue(task.dueDate)}
                    </span>
                )}
            </div>
        </div>
    );
}