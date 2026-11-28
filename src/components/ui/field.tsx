import { cn } from "@/lib/utils";

const base =
    "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted";

export function Input({ className, ...p }: React.ComponentProps<"input">) {
    return <input className={cn(base, "min-h-11", className)} {...p} />;
}

export function Select({ className, ...p }: React.ComponentProps<"select">) {
    return <select className={cn(base, "min-h-11", className)} {...p} />;
}

export function Textarea({ className, ...p }: React.ComponentProps<"textarea">) {
    return <textarea className={cn(base, "py-2", className)} {...p} />;
}

export function Label({
    children,
    className,
    ...p
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label className={cn("flex flex-col gap-1.5 text-sm font-semibold", className)} {...p}>
            {children}
        </label>
    );
}