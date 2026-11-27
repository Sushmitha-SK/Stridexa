import { Sidebar } from '@/features/command-palette/sidebar'
import { requireWorkspace } from '@/lib/auth';
import React from 'react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    await requireWorkspace();
    return (
        <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[232px_1fr]">
            <Sidebar />
            <div className="min-w-0">{children}</div>
        </div>
    )
}
