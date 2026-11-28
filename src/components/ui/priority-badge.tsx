import { PRIORITY_CLASS, PRIORITY_LABEL, type Priority } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
    if (priority === "NONE") return null;
    return (
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", PRIORITY_CLASS[priority])}>
            {PRIORITY_LABEL[priority]}
        </span>
    );
}