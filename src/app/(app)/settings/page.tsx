import type { Metadata } from "next";
import Link from "next/link";
import { OrganizationProfile } from "@clerk/nextjs";
import { requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
    const ctx = await requireWorkspace();

    if (ctx.isPersonal) {
        return (
            <main className="flex max-w-xl flex-col gap-4 p-4 md:p-8">
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm">You are in your personal workspace. Only you can see it.</p>
                <p className="text-sm text-muted">
                    To work with other people, create a team workspace. You can then invite teammates, give
                    them roles and assign tasks. Your personal workspace is kept, and you can switch between
                    the two from the sidebar.
                </p>
                <Link
                    href="/onboarding"
                    className="inline-flex min-h-11 w-fit items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90"
                >
                    Create a team workspace
                </Link>
            </main>
        );
    }

    return (
        <main className="flex flex-col gap-4 p-4 md:p-8">
            <h1 className="text-xl font-semibold">Workspace settings</h1>
            <p className="max-w-xl text-sm text-muted">
                Invite people and change roles here. Admins manage everything. Project leads create
                projects and assign work to anyone. Members create, edit and move tasks, and can take
                tasks for themselves. Viewers have read-only access.
            </p>
            <OrganizationProfile routing="hash" />
        </main>
    );
}