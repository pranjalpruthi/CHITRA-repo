"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent/50"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            type="button"
            aria-label="Toggle theme"
        >
            <span className="relative size-5 rounded-full">
                {/* Dark mode (Moon) */}
                <span
                    className={cn(
                        "absolute inset-0 rotate-90 transform-gpu rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 transition-all duration-300",
                        theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
                {/* Moon craters */}
                <span
                    className={cn(
                        "absolute top-1 left-1.5 h-1.5 w-1.5 transform-gpu rounded-full bg-neutral-200/50 transition-all duration-300",
                        theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
                <span
                    className={cn(
                        "absolute bottom-1 right-2 h-1 w-1 transform-gpu rounded-full bg-neutral-200/50 transition-all duration-300",
                        theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
                {/* Light mode (Sun) */}
                <span
                    className={cn(
                        "absolute inset-0 transform-gpu rounded-full bg-gradient-to-tr from-amber-300 to-rose-400 transition-all duration-300",
                        theme === "light" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
                {/* Sun ray */}
                <span
                    className={cn(
                        "absolute top-0 right-0 size-2 origin-top-right transform-gpu rounded-full bg-white transition-all duration-300",
                        theme === "light" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
            </span>
        </button>
    );
}
