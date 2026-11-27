export type Role = "admin" | "lead" | "member" | "viewer";

export function roleFromClerk(orgRole: string | null | undefined): Role {
    switch (orgRole) {
        case "org:admin":
            return "admin";
        case "org:project_lead":
            return "lead";
        case "org:member":
            return "member";
        default:
            return "viewer"; // unknown role: least privilege
    }
}

export const ROLE_LABEL: Record<Role, string> = {
    admin: "Admin",
    lead: "Project lead",
    member: "Member",
    viewer: "Viewer",
};

export type Action =
    | "task.create"
    | "task.edit"
    | "task.move"
    | "task.delete"
    | "comment.create"
    | "label.create"
    | "project.create"
    | "project.archive";

export function can(role: Role, action: Action, opts: { isOwner?: boolean } = {}): boolean {
    if (role === "viewer") return false;
    switch (action) {
        case "task.create":
        case "task.edit":
        case "task.move":
        case "comment.create":
        case "label.create":
            return true;
        case "task.delete":
            return role === "admin" || role === "lead" || !!opts.isOwner;
        case "project.create":
            return role === "admin" || role === "lead";
        case "project.archive":
            return role === "admin";
    }
}

/** Leads and admins assign anyone. Members may only take a task or hand back their own. */
export function canSetAssignee(
    role: Role,
    actorId: string,
    currentAssigneeId: string | null,
    nextAssigneeId: string | null,
): boolean {
    if (role === "viewer") return false;
    if (nextAssigneeId === currentAssigneeId) return true; // no change
    if (role === "admin" || role === "lead") return true;
    // member
    if (nextAssigneeId === actorId) return true; // "assign to me"
    if (nextAssigneeId === null && currentAssigneeId === actorId) return true; // unassign myself
    return false;
}

/** Leads and admins pick any reviewer. Members can ask for a review on tasks they own or reported. */
export function canSetReviewer(
    role: Role,
    actorId: string,
    task: { assigneeId: string | null; createdById: string },
): boolean {
    if (role === "viewer") return false;
    if (role === "admin" || role === "lead") return true;
    return task.assigneeId === actorId || task.createdById === actorId;
}

/** Who can appear in the assignee dropdown for this role. */
export function assignableMembers<T extends { id: string }>(
    role: Role,
    actorId: string,
    members: T[],
): T[] {
    if (role === "viewer") return [];
    if (role === "admin" || role === "lead") return members;
    return members.filter((m) => m.id === actorId);
}