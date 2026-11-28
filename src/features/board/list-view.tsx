"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { PRIORITY_RANK, STATUS_LABEL, STATUSES } from "@/lib/constants";
import type { TaskDTO } from "@/lib/types";
import { cn, formatDue, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { useUI } from "@/stores/ui.store";

type SortKey = "key" | "title" | "status" | "priority" | "due";

export function ListView({ tasks }: { tasks: TaskDTO[] }) {
    const selectTask = useUI((s) => s.selectTask);
    const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "key", dir: 1 });

    const rows = useMemo(() => {
        const val = (t: TaskDTO): string | number => {
            switch (sort.key) {
                case "key":
                    return t.number;
                case "title":
                    return t.title.toLowerCase();
                case "status":
                    return STATUSES.indexOf(t.status);
                case "priority":
                    return PRIORITY_RANK[t.priority];
                case "due":
                    // tasks without a due date sort last when ascending
                    return t.dueDate ? new Date(t.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            }
        };
        return [...tasks].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
    }, [tasks, sort]);

    const head = (key: SortKey, label: string) => {
        const active = sort.key === key;
        return (
            <th
                scope="col"
                aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                className="px-3 py-2 text-left text-xs font-semibold text-muted"
            >
                <button
                    type="button"
                    onClick={() => setSort({ key, dir: active && sort.dir === 1 ? -1 : 1 })}
                    className="inline-flex min-h-8 items-center gap-1 hover:text-ink"
                >
                    {label}
                    {active && (sort.dir === 1 ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />)}
                </button>
            </th>
        );
    };

    if (!rows.length) {
        return (
            <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
                No tasks match. Clear the filters or add a task.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-160 border-collapse text-sm">
                <thead className="border-b border-line">
                    <tr>
                        {head("key", "Key")}
                        {head("title", "Title")}
                        {head("status", "Status")}
                        {head("priority", "Priority")}
                        {head("due", "Due")}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((t) => (
                        <tr key={t.id} className="border-b border-line last:border-0 hover:bg-accent-soft">
                            <td className="px-3 py-2 text-muted">{t.key}</td>
                            <td className="px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => selectTask(t.id)}
                                    className="min-h-8 text-left font-semibold hover:underline"
                                >
                                    {t.title}
                                </button>
                            </td>
                            <td className="px-3 py-2">{STATUS_LABEL[t.status]}</td>
                            <td className="px-3 py-2">
                                <PriorityBadge priority={t.priority} />
                            </td>
                            <td
                                className={cn(
                                    "px-3 py-2",
                                    isOverdue(t.dueDate, t.status) && "font-semibold text-red-700 dark:text-red-300",
                                )}
                            >
                                {formatDue(t.dueDate) ?? <span className="text-muted">None</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}