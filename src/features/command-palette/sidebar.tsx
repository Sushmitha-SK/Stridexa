'use client'

import { cn } from "@/lib/utils";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation"

const ITEMS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
]

export function Sidebar() {
    const pathname = usePathname();

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
                {ITEMS.map(({ href, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "flex min-h-10 items-center rounded-lg px-3 text-sm",
                                active ? "bg-accent-soft font-semibold" : "hover:bg-accent-soft",
                            )}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    )
}
