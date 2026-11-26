import { assignableMembers, can, canSetAssignee, canSetReviewer, roleFromClerk } from "@/lib/permissions";
import { describe, expect, it } from "vitest";


describe("roleFromClerk", () => {
    it("maps the four roles and defaults unknown roles to viewer", () => {
        expect(roleFromClerk("org:admin")).toBe("admin");
        expect(roleFromClerk("org:project_lead")).toBe("lead");
        expect(roleFromClerk("org:member")).toBe("member");
        expect(roleFromClerk("org:viewer")).toBe("viewer");
        expect(roleFromClerk("org:something_new")).toBe("viewer");
        expect(roleFromClerk(null)).toBe("viewer");
    });
});

describe("can", () => {
    it("lets viewers do nothing", () => {
        for (const a of [
            "task.create", "task.edit", "task.move",
            "comment.create", "label.create", "project.create",
        ] as const) {
            expect(can("viewer", a)).toBe(false);
        }
    });
    it("lets members work on tasks but not manage projects", () => {
        expect(can("member", "task.move")).toBe(true);
        expect(can("member", "project.create")).toBe(false);
        expect(can("member", "project.archive")).toBe(false);
    });
    it("limits task deletion for members to tasks they created", () => {
        expect(can("member", "task.delete")).toBe(false);
        expect(can("member", "task.delete", { isOwner: true })).toBe(true);
        expect(can("lead", "task.delete")).toBe(true);
    });
    it("lets leads create projects but only admins archive them", () => {
        expect(can("lead", "project.create")).toBe(true);
        expect(can("lead", "project.archive")).toBe(false);
        expect(can("admin", "project.archive")).toBe(true);
    });
});

describe("canSetAssignee", () => {
    it("lets admins and leads assign anyone", () => {
        expect(canSetAssignee("admin", "me", null, "other")).toBe(true);
        expect(canSetAssignee("lead", "me", "x", "y")).toBe(true);
    });
    it("lets members take a task for themselves", () => {
        expect(canSetAssignee("member", "me", null, "me")).toBe(true);
    });
    it("stops members assigning other people", () => {
        expect(canSetAssignee("member", "me", null, "other")).toBe(false);
        expect(canSetAssignee("member", "me", "other", "me")).toBe(true);
        expect(canSetAssignee("member", "me", "other", null)).toBe(false);
    });
    it("lets members hand back their own task but not someone else's", () => {
        expect(canSetAssignee("member", "me", "me", null)).toBe(true);
    });
    it("treats an unchanged assignee as allowed and blocks viewers", () => {
        expect(canSetAssignee("member", "me", "other", "other")).toBe(true);
        expect(canSetAssignee("viewer", "me", null, "me")).toBe(false);
    });
});

describe("canSetReviewer", () => {
    const task = { assigneeId: "owner", createdById: "reporter" };
    it("lets leads always choose", () => {
        expect(canSetReviewer("lead", "x", task)).toBe(true);
    });
    it("lets the owner or reporter request a review", () => {
        expect(canSetReviewer("member", "owner", task)).toBe(true);
        expect(canSetReviewer("member", "reporter", task)).toBe(true);
        expect(canSetReviewer("member", "stranger", task)).toBe(false);
    });
});

describe("assignableMembers", () => {
    const people = [{ id: "me" }, { id: "a" }, { id: "b" }];
    it("shows everyone to leads, only yourself to members, nobody to viewers", () => {
        expect(assignableMembers("lead", "me", people)).toHaveLength(3);
        expect(assignableMembers("member", "me", people)).toEqual([{ id: "me" }]);
        expect(assignableMembers("viewer", "me", people)).toEqual([]);
    });
});