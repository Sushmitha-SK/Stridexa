import { requireWorkspace } from "@/lib/auth";
import { getProjects } from "@/lib/queries";
import { Sidebar } from "@/features/command-palette/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const ctx = await requireWorkspace(); // creates the Workspace row on first visit
    const projects = await getProjects(ctx.workspaceId);
    const nav = projects.map((p) => ({ key: p.key, name: p.name }));

    return (
        <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[232px_1fr]">
            <Sidebar projects={nav} />
            <div className="min-w-0">{children}</div>
        </div>
    );
}