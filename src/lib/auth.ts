import "server-only";
import { cache } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";
import type { Member } from "./types";
import { roleFromClerk, type Role } from "./permissions";

export type Ctx = {
    userId: string;
    /** The active Clerk organization, or null in the personal workspace. */
    orgId: string | null;
    workspaceId: string;
    isPersonal: boolean;
    role: Role;
    isAdmin: boolean;
};

function displayName(u: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    emailAddresses: { emailAddress: string }[];
}) {
    return (
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        u.emailAddresses[0]?.emailAddress ||
        "Me"
    );
}

/**
 * The one door into every page and action. Returns the signed-in user and the
 * workspace they are acting in, or redirects to sign in.
 *
 *  - With an active Clerk organization, the workspace is that team's.
 *  - With NO organization, the workspace is the person's own private one, keyed by
 *    their user id (user_...), which can never collide with an org id (org_...).
 *
 * Never trust IDs that come from the client: always scope queries by ctx.workspaceId.
 */
export const requireWorkspace = cache(async (): Promise<Ctx> => {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) redirect("/sign-in");

    const key = orgId ?? userId;
    let workspace = await db.workspace.findUnique({ where: { clerkOrgId: key } });
    if (!workspace) {
        const client = await clerkClient();
        let name: string;
        let slug: string;
        if (orgId) {
            const org = await client.organizations.getOrganization({ organizationId: orgId });
            name = org.name;
            slug = org.slug ?? orgId.toLowerCase();
        } else {
            const user = await client.users.getUser(userId);
            name = `${displayName(user)}'s workspace`;
            slug = userId.toLowerCase();
        }
        // upsert, not create: two simultaneous first requests must not crash on the unique key
        workspace = await db.workspace.upsert({
            where: { clerkOrgId: key },
            update: {},
            create: { clerkOrgId: key, name, slug },
        });
    }

    const role: Role = orgId ? roleFromClerk(orgRole) : "admin";
    return {
        userId,
        orgId: orgId ?? null,
        workspaceId: workspace.id,
        isPersonal: !orgId,
        role,
        isAdmin: role === "admin",
    };
});

/** People who can be assigned: the org's members, or just you in a personal workspace. */
export const getMembers = cache(
    async (orgId: string | null, userId: string): Promise<Member[]> => {
        const client = await clerkClient();
        if (!orgId) {
            const u = await client.users.getUser(userId);
            return [{ id: userId, name: displayName(u), imageUrl: u.imageUrl }];
        }
        const list = await client.organizations.getOrganizationMembershipList({
            organizationId: orgId,
            limit: 100,
        });
        return list.data.flatMap((m) => {
            const u = m.publicUserData;
            if (!u?.userId) return [];
            const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.identifier;
            return [{ id: u.userId, name, imageUrl: u.imageUrl }];
        });
    },
);