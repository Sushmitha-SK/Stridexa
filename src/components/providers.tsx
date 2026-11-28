"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: true } },
            }),
    );
    return (
        <QueryClientProvider client={client}>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
        </QueryClientProvider>
    );
}