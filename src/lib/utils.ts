import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDue(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}