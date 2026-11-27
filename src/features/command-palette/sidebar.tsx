"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const ITEMS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/settings", label: "Settings" },
];

export function Sidebar({ projects }: { projects: { key: string; name: string }[] }) {
    const pathname = usePathname();

    const link = (href: string, label: string) => {
        // "/projects" must match exactly, or it would stay highlighted on every project page
        const active = href === "/projects" ? pathname === href : pathname.startsWith(href);
        return (
            <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm",
                    active ? "bg-accent-soft font-semibold" : "hover:bg-accent-soft",
                )}
            >
                {label}
            </Link>
        );
    };

    return (
        <aside className="flex flex-col gap-3 border-b border-line bg-surface p-3 md:sticky md:top-0 md:h-dvh md:overflow-y-auto md:border-r md:border-b-0 md:p-4">
            <div className="flex items-center justify-between gap-2">
                <span className="px-2 text-base font-semibold">STRIDEXA</span>
                <UserButton />
            </div>
            <OrganizationSwitcher
                afterSelectOrganizationUrl="/dashboard"
                afterSelectPersonalUrl="/dashboard"
                afterCreateOrganizationUrl="/dashboard"
            />
            <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col">
                {ITEMS.map((i) => link(i.href, i.label))}
            </nav>
            {projects.length > 0 && (
                <nav aria-label="Projects" className="hidden flex-col gap-1 md:flex">
                    <span className="px-3 pt-3 text-xs font-semibold text-muted">Your projects</span>
                    {projects.map((p) => link(`/projects/${p.key}`, p.name))}
                </nav>
            )}
        </aside>
    );
}