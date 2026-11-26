export const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    IN_REVIEW: "In review",
    DONE: "Done",
};

export const PRIORITIES = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABEL: Record<Priority, string> = {
    NONE: "No priority",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
};

export const PRIORITY_CLASS: Record<Priority, string> = {
    NONE: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    LOW: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export const PRIORITY_RANK: Record<Priority, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    NONE: 0,
};