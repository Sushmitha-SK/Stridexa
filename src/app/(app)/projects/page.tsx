import type { Metadata } from "next";
import Link from "next/link";
import { requireWorkspace } from "@/lib/auth";
import { getProjects } from "@/lib/queries";
import { can } from "@/lib/permissions";
import { NewProject } from "@/features/projects/new-project";

export const metadata: Metadata = { title: "Projects" };

export default async function Projects() {
    const ctx = await requireWorkspace();
    const projects = await getProjects(ctx.workspaceId);
    const canCreate = can(ctx.role, "project.create");

    return (
        <main className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">Projects</h1>
                {canCreate && <NewProject />}
            </div>

            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
                    {canCreate
                        ? "No projects yet. Create one to start adding tasks."
                        : "No projects yet. Ask an admin or project lead to create one."}
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {projects.map((p) => (
                        <li key={p.id}>
                            <Link
                                href={`/projects/${p.key}`}
                                className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 hover:border-accent"
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="font-semibold">{p.name}</span>
                                    <span className="text-xs text-muted">{p.key}</span>
                                </div>
                                {p.description && (
                                    <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
                                )}

                                <div className="mt-auto flex flex-col gap-1.5">
                                    <div
                                        role="progressbar"
                                        aria-label={`${p.name} progress`}
                                        aria-valuenow={p.percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        className="h-1.5 rounded-full bg-line"
                                    >
                                        <div className="h-1.5 rounded-full bg-accent" style={{ width: `${p.percent}%` }} />
                                    </div>
                                    <span className="text-xs text-muted">
                                        {p.done} of {p.total} tasks done
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}