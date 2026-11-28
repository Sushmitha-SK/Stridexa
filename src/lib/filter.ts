import type { Priority } from "./constants";
import type { TaskDTO } from "./types";

export type Filters = {
    search: string;
    priority: Priority | "ALL";
};

export function filterTasks(tasks: TaskDTO[], f: Filters) {
    const q = f.search.trim().toLowerCase();
    return tasks.filter((t) => {
        if (q && !`${t.key} ${t.title}`.toLowerCase().includes(q)) return false;
        if (f.priority !== "ALL" && t.priority !== f.priority) return false;
        return true;
    });
}