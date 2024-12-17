"use client"

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // After mounting, we have access to the theme
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="opacity-0">
                <Sun className="w-5 h-5" />
                <span className="sr-only">Loading theme</span>
            </Button>
        );
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className={`hover:bg-inherit ${
                theme === "dark" 
                    ? "border-zinc-900 bg-[#0c0c0d]" 
                    : "border-zinc-100 bg-inherit"
            }`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}