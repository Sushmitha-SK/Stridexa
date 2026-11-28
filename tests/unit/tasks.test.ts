import { describe, expect, it } from "vitest";
import { createTaskSchema, moveTaskSchema } from "@/features/tasks/schema";
import { toTaskDTO } from "@/lib/mappers";

const base = { projectKey: "WEB", title: "Fix nav", status: "TODO", priority: "NONE" };

describe("createTaskSchema", () => {
    it("accepts a minimal task and trims the title", () => {
        const r = createTaskSchema.parse({ ...base, title: "  Fix nav  " });
        expect(r.title).toBe("Fix nav");
    });
    it("rejects an empty title with a friendly message", () => {
        const r = createTaskSchema.safeParse({ ...base, title: "   " });
        expect(r.success).toBe(false);
        if (!r.success) expect(r.error.issues[0].message).toBe("Enter a title");
    });
    it("rejects unknown status or priority values", () => {
        expect(createTaskSchema.safeParse({ ...base, status: "BLOCKED" }).success).toBe(false);
        expect(createTaskSchema.safeParse({ ...base, priority: "SOON" }).success).toBe(false);
    });
    it("accepts yyyy-mm-dd or null for the due date, nothing else", () => {
        expect(createTaskSchema.safeParse({ ...base, dueDate: "2026-12-01" }).success).toBe(true);
        expect(createTaskSchema.safeParse({ ...base, dueDate: null }).success).toBe(true);
        expect(createTaskSchema.safeParse({ ...base, dueDate: "12/01/2026" }).success).toBe(false);
    });
});

describe("toTaskDTO", () => {
    const row = {
        id: "t1", projectId: "p1", number: 7, title: "x", description: null,
        status: "TODO", priority: "HIGH", position: "a0", assigneeId: null,
        createdById: "u1", dueDate: new Date("2026-12-01T12:00:00.000Z"),
        createdAt: new Date("2026-11-27T00:00:00.000Z"),
    };
    it("builds the human key and serialises dates as ISO strings", () => {
        const dto = toTaskDTO(row, "WEB");
        expect(dto.key).toBe("WEB-7");
        expect(dto.dueDate).toBe("2026-12-01T12:00:00.000Z");
        expect(dto.createdAt).toBe("2026-11-27T00:00:00.000Z");
    });
    it("keeps a missing due date as null", () => {
        expect(toTaskDTO({ ...row, dueDate: null }, "WEB").dueDate).toBeNull();
    });
});

describe("moveTaskSchema", () => {
    it("accepts a valid move", () => {
        expect(moveTaskSchema.safeParse({ id: "t1", status: "DONE", position: "a0V" }).success).toBe(true);
    });
    it("rejects an unknown status", () => {
        expect(moveTaskSchema.safeParse({ id: "t1", status: "BLOCKED", position: "a0" }).success).toBe(false);
    });
    it("rejects empty or oversized positions", () => {
        expect(moveTaskSchema.safeParse({ id: "t1", status: "TODO", position: "" }).success).toBe(false);
        expect(moveTaskSchema.safeParse({ id: "t1", status: "TODO", position: "a".repeat(65) }).success).toBe(false);
    });
});

describe("updateTaskSchema", () => {
    it("needs only an id: every field is optional", () => {
        expect(updateTaskSchema.safeParse({ id: "t1" }).success).toBe(true);
        expect(updateTaskSchema.safeParse({ id: "t1", priority: "HIGH" }).success).toBe(true);
    });
    it("still validates the fields that are present", () => {
        expect(updateTaskSchema.safeParse({ id: "t1", title: "  " }).success).toBe(false);
        expect(updateTaskSchema.safeParse({ id: "t1", status: "NOPE" }).success).toBe(false);
    });
    it("lets description and due date be cleared with null", () => {
        expect(updateTaskSchema.safeParse({ id: "t1", description: null, dueDate: null }).success).toBe(true);
    });
    it("requires an id", () => {
        expect(updateTaskSchema.safeParse({ title: "x" }).success).toBe(false);
    });
});