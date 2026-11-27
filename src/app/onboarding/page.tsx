import type { Metadata } from "next";
import Link from "next/link";
import { CreateOrganization } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Create a team" };

/** Optional. Nobody is sent here automatically: everyone starts in a personal workspace. */
export default function CreateTeam() {
    return (
        <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 p-6">
            <h1 className="text-2xl font-semibold">Create a team workspace</h1>
            <p className="max-w-md text-center text-muted">
                A team workspace lets you invite people, assign work and share projects. Your personal
                workspace stays exactly as it is, and you can switch between them from the sidebar.
            </p>
            <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
            <Link href="/dashboard" className="text-sm font-semibold text-accent underline">
                Not now, continue with my personal workspace
            </Link>
        </main>
    );
}