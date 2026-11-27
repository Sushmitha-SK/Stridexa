import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
    primary: "bg-accent text-accent-ink font-semibold hover:opacity-90",
    secondary: "border border-line bg-surface text-ink hover:bg-accent-soft",
    ghost: "text-muted hover:bg-accent-soft hover:text-ink",
    danger:
        "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950",
};

export function Button({ variant = "secondary", className, type = "button", ...props }: Props) {
    return (
        <button
            type={type}
            className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}