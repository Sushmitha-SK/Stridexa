"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps the native <dialog>: focus trap, Escape to close and inert background
 * come from the browser, so keyboard and screen reader behaviour is correct.
 */
export function Modal({
    open,
    onClose,
    title,
    side = false,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    side?: boolean;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (open && !el.open) el.showModal();
        if (!open && el.open) el.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-label={title}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose(); // click on backdrop
            }}
            className={cn(
                "border border-line p-0 shadow-xl",
                side
                    ? "fixed inset-y-0 right-0 m-0 h-dvh max-h-none w-full max-w-lg rounded-none"
                    : "m-auto w-full max-w-lg rounded-xl",
            )}
        >
            {open && children}
        </dialog>
    );
}