import { requireWorkspace } from '@/lib/auth'
import { ROLE_LABEL } from '@/lib/permissions';
import { Metadata } from 'next'

export const metadata: Metadata = { title: "Dashboard" }

export default async function Dashboard() {
    const ctx = await requireWorkspace();

    return (
        <main className="flex flex-col gap-3 p-4 md:p-8">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Workspace</dt>
                <dd>{ctx.isPersonal ? "Personal" : "Team"}</dd>
                <dt className="text-muted">Your role</dt>
                <dd>{ROLE_LABEL[ctx.role]}</dd>
                <dt className="text-muted">Workspace id</dt>
                <dd className="font-mono">{ctx.workspaceId}</dd>
            </dl>
        </main>
    )
}
