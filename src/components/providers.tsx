"use client";

import { HospitalProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HospitalProvider>
            {children}
        </HospitalProvider>
    );
}
