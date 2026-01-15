"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export function MobileWarning() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if screen width is less than md (768px)
        const checkMobile = () => {
            if (window.innerWidth < 1024) { // Using lg (1024px) as a safer bet for complex viz, or md (768px)
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md lg:hidden"
                >
                    <BackgroundGradient className="rounded-[22px] max-w-sm ml-5 p-4 sm:p-10 bg-white dark:bg-zinc-900">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-violet-600 rounded-full blur-sm opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative p-4 bg-white dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-zinc-800">
                                    <Monitor className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                                    <Smartphone className="w-4 h-4 text-gray-400 absolute bottom-2 right-2" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Desktop Experience Recommended
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    CHITRA's complex synteny visualizations and genome analysis tools are optimized for larger screens.
                                </p>
                                <div className="py-2">
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                                        Please switch to a desktop or laptop
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsVisible(false)}
                                className="w-full mt-4 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                Continue Anyway
                            </Button>
                        </div>
                    </BackgroundGradient>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
