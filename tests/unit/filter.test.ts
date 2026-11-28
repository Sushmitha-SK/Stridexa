import { describe, expect, it } from "vitest";
import { filterTasks } from "@/lib/filter";
import type { TaskDTO } from "@/lib/types";

const task = (o: Partial<TaskDTO>): TaskDTO => ({
    id: "1",
    projectId: "p",
    number: 1,
    key: "WEB-1",
    title: "Build pricing table",
    description: null,
    status: "TODO",
    priority: "HIGH",
    position: "a0",
    assigneeId: null,
    createdById: "u1",
    dueDate: null,
    createdAt: new Date().toISOString(),
    ...o,
});

const all = { search: "", priority: "ALL" } as const;

describe("filterTasks", () => {
    const tasks = [
        task({ id: "1" }),
        task({ id: "2", key: "WEB-2", title: "Fix login bug", priority: "URGENT" }),
    ];

    it("returns everything with no filters", () => {
        expect(filterTasks(tasks, all)).toHaveLength(2);
    });
    it("searches by title and key, ignoring case", () => {
        expect(filterTasks(tasks, { ...all, search: "LOGIN" }).map((t) => t.id)).toEqual(["2"]);
        expect(filterTasks(tasks, { ...all, search: "web-1" }).map((t) => t.id)).toEqual(["1"]);
    });
    it("treats a whitespace-only search as no search", () => {
        expect(filterTasks(tasks, { ...all, search: "   " })).toHaveLength(2);
    });
    it("filters by priority", () => {
        expect(filterTasks(tasks, { ...all, priority: "URGENT" }).map((t) => t.id)).toEqual(["2"]);
    });
    it("combines filters with AND", () => {
        expect(filterTasks(tasks, { search: "pricing", priority: "URGENT" })).toHaveLength(0);
    });
});