import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/auth";
import { getProjectByKey, getProjectTasks } from "@/lib/queries";
import { ProjectTasks } from "@/features/tasks/project-tasks";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ key: string }>;
}): Promise<Metadata> {
    const { key } = await params;
    return { title: key.toUpperCase() };
}

export default async function ProjectPage({ params }: { params: Promise<{ key: string }> }) {
    const { key } = await params;
    const ctx = await requireWorkspace();
    // Scoped by workspaceId: another team's project with the same key is invisible here.
    const project = await getProjectByKey(ctx.workspaceId, key.toUpperCase());
    if (!project) notFound();
    const tasks = await getProjectTasks(project.id, project.key);
    return (
        // <main className="flex flex-col gap-2 p-4 md:p-8">
        //     <h1 className="text-xl font-semibold">
        //         {project.name} <span className="text-sm font-normal text-muted">{project.key}</span>
        //     </h1>
        //     <p className="text-sm text-muted">No tasks yet.</p>
        // </main>
        <ProjectTasks
            projectKey={project.key}
            projectName={project.name}
            role={ctx.role}
            currentUserId={ctx.userId}
            tasks={tasks}
        />
    );
}