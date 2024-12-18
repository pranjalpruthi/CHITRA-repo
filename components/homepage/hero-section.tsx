"use client";
import { ArrowRight, Github, Loader2 } from 'lucide-react';
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from 'react';
import { RainbowButton } from "../ui/rainbow-button";
import { cn } from "@/lib/utils";
import Particles from "../ui/particles";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { BlurIn } from "../ui/Blur-in";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";

export default function HeroSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGithubHovered, setIsGithubHovered] = useState(false);

    const handleGetStarted = () => {
        setIsLoading(true);
        // The loading state will be cleared when the navigation completes
        // Next.js handles this automatically
    };

    return (
        <div className="flex flex-col items-center justify-center leading-6 relative z-10 w-full 
            min-h-[85vh]
            pt-20 sm:pt-32 md:pt-36 lg:pt-44
            pb-12 sm:pb-16 md:pb-24
            px-3 sm:px-6 lg:px-8
            overflow-hidden"
        >
            <BackgroundBeamsWithCollision className="absolute inset-0 -z-20 opacity-20" />
            <Particles
                className="absolute inset-0 -z-10"
                quantity={100}
                staticity={30}
                color="#3b82f6"
                ease={20}
                size={1}
                vx={0.2}
                vy={0.1}
            />

            <div className="relative z-10 flex flex-col items-center w-full max-w-screen-xl mx-auto space-y-4 sm:space-y-8">
                <motion.div 
                    className="mb-3 sm:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={cn(
                        "px-3 sm:px-4 py-1.5",
                        "text-xs sm:text-sm font-medium",
                        "bg-blue-500/5 text-blue-600 dark:text-blue-400",
                        "border border-blue-500/20",
                        "rounded-full",
                        "flex items-center gap-2"
                    )}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="line-clamp-1">Visualize Chromosomal Data Like Never Before</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-4 sm:space-y-6 max-w-[800px] mx-auto px-2 sm:px-4"
                >
                    <BlurIn>
                        <span className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent tracking-tight">
                            CHITRA
                        </span>
                    </BlurIn>
                    
                    <div className="mt-2 sm:mt-4">
                        <div className="inline-flex items-center justify-center">
                            <div className={cn(
                                "px-4 sm:px-6 py-2 sm:py-2.5",
                                "text-sm sm:text-base md:text-xl",
                                "text-muted-foreground/90",
                                "bg-white/30 dark:bg-black/30 backdrop-blur-xl",
                                "border border-white/20 dark:border-black/20",
                                "rounded-full shadow-sm",
                                "font-medium tracking-tight",
                                "transition-all duration-300",
                                "leading-relaxed"
                            )}>
                                <span className="line-clamp-2 sm:line-clamp-1">
                                    Chromosome Interactive Tool for Rearrangement Analysis
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-black/20 
                    rounded-full p-3 sm:p-6 shadow-lg w-[95%] sm:w-auto mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-2 sm:gap-3 w-full"
                    >
                        <Link href="/chromoviz" className="flex-1 sm:flex-none" onClick={handleGetStarted}>
                            <div className="relative overflow-hidden rounded-full shadow group p-0.5 w-full sm:w-auto">
                                <span className={cn(
                                    "absolute inset-[-1000%] animate-[spin_5s_linear_infinite_reverse]",
                                    "bg-[conic-gradient(from_90deg_at_50%_50%,#4f46e5_0%,#06b6d4_25%,#3b82f6_50%,#4f46e5_75%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1d4ed8_0%,#2563eb_25%,#3b82f6_50%,#60a5fa_75%)]"
                                )} />
                                <Button 
                                    variant="outline"
                                    disabled={isLoading}
                                    className={cn(
                                        "h-9 sm:h-12 px-4 sm:px-8 rounded-full font-medium w-full sm:w-auto",
                                        "bg-white/80 dark:bg-black/80 backdrop-blur-xl",
                                        "text-zinc-800 dark:text-zinc-200",
                                        "border-0 transition-colors duration-300",
                                        "relative z-10",
                                        "text-sm sm:text-base"
                                    )}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Get Started
                                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Link>

                        <Link 
                            href="https://github.com/pranjalpruthi/CHITRA" 
                            target="_blank"
                            onMouseEnter={() => setIsGithubHovered(true)}
                            onMouseLeave={() => setIsGithubHovered(false)}
                        >
                            <div className="relative overflow-hidden rounded-full dark:bg-zinc-900 bg-white shadow border dark:border-zinc-800 group border-zinc-400 p-0.5">
                                <span className={cn(
                                    "absolute inset-[-1000%] animate-[spin_5s_linear_infinite_reverse]",
                                    "dark:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#09090B_7%)]",
                                    "bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#fff_5%)]",
                                    "group-hover:bg-none"
                                )} />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="relative h-9 sm:h-12 w-9 sm:w-12 rounded-full backdrop-blur-xl 
                                        bg-zinc-50 dark:bg-zinc-900 
                                        text-zinc-800 dark:text-zinc-200
                                        border-0"
                                >
                                    <Github className={cn(
                                        "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300",
                                        isGithubHovered && "scale-110 text-blue-500 dark:text-blue-400"
                                    )} />
                                    <span className="sr-only">GitHub Repository</span>
                                    {isGithubHovered && (
                                        <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
                                    )}
                                </Button>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
