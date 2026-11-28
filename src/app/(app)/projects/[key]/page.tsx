import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/auth";
import { getProjectByKey, getProjectTasks } from "@/lib/queries";
import { ProjectView } from "@/features/board/project-view";

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
    const project = await getProjectByKey(ctx.workspaceId, key.toUpperCase());
    if (!project) notFound();
    const tasks = await getProjectTasks(project.id, project.key);
    return (
        <ProjectView
            projectKey={project.key}
            projectName={project.name}
            role={ctx.role}
            initialTasks={tasks}
        />
    );
}