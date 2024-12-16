"use client";
import { ArrowRight, Github } from 'lucide-react';
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
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isGithubHovered, setIsGithubHovered] = useState(false);

    const handleBetaSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call - replace with your actual API endpoint
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Thanks for joining the beta waitlist!");
            setEmail('');
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center leading-6 relative z-10 w-full 
            min-h-[85vh]
            pt-32 sm:pt-36 md:pt-40 lg:pt-44
            pb-16 sm:pb-20 md:pb-24
            px-4 sm:px-6 lg:px-8
            overflow-hidden"
        >
            {/* Background SVG */}
            <div 
                className="absolute inset-0 -z-20"
                style={{
                    backgroundImage: "url('/assets/hero-2.svg')",
                    backgroundSize: '90% auto',
                    backgroundPosition: '50% 70px',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            <BackgroundBeamsWithCollision className="absolute inset-0 -z-20 opacity-20" />
            <Particles
                className="absolute inset-0 -z-10"
                quantity={200}
                staticity={20}
                color="#3b82f6"
                ease={20}
                size={1}
                vx={0.2}
                vy={0.1}
            />

            <div className="relative z-10 flex flex-col items-center w-full max-w-screen-xl mx-auto space-y-6 sm:space-y-8">
                {/* Beta Badge */}
                <motion.div 
                    className="mb-4 sm:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* ... existing Beta Badge content ... */}
                </motion.div>

                {/* Title Section - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-4 max-w-[650px] mx-auto px-4"
                >
                    <BlurIn>
                        <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                            CHITRA
                        </span>
                    </BlurIn>
                    
                    <div className="mt-3">
                        <div className="inline-flex items-center justify-center">
                            <div className={cn(
                                "px-4 py-1.5",
                                "text-xs sm:text-sm md:text-base",
                                "text-muted-foreground/90",
                                "bg-white/30 dark:bg-black/30 backdrop-blur-xl",
                                "border border-white/20 dark:border-black/20",
                                "rounded-full shadow-sm",
                                "font-medium tracking-tight",
                                "transition-all duration-300"
                            )}>
                                Chromosome Interactive Tool for Rearrangement Analysis
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Glass Card for Beta Signup Form and Buttons */}
                <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-black/20 rounded-full p-6 shadow-lg">
                    {/* Beta Signup Form */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onSubmit={handleBetaSignup}
                        className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md mx-auto"
                    >
                        <div className="flex-1">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 px-4 rounded-full bg-background/50 backdrop-blur-sm border-muted 
                                    focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
                                    hover:border-blue-500/30"
                                required
                            />
                        </div>
                        <div className="relative overflow-hidden rounded-full">
                            <RainbowButton
                                type="submit"
                                disabled={isLoading}
                                className="h-11 px-6 rounded-full font-medium w-full sm:w-auto text-sm"
                            >
                                {isLoading ? "Joining..." : (
                                    <>
                                        Join Beta
                                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                    </>
                                )}
                            </RainbowButton>
                        </div>
                    </motion.form>

                    {/* Preview and GitHub Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 flex items-center justify-center gap-3 w-full"
                    >
                        <Link href="/chromoviz" onClick={() => setIsPreviewLoading(true)}>
                            <div className="relative overflow-hidden rounded-full dark:bg-zinc-900 bg-white shadow border dark:border-zinc-800 group border-zinc-400 p-0.5">
                                <span className={cn(
                                    "absolute inset-[-1000%] animate-[spin_5s_linear_infinite_reverse]",
                                    "dark:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#09090B_7%)]",
                                    "bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#fff_5%)]",
                                    isPreviewLoading ? "opacity-50" : "group-hover:bg-none"
                                )} />
                                <Button 
                                    variant="outline"
                                    className={cn(
                                        "h-10 sm:h-12 px-6 sm:px-8 rounded-full font-medium backdrop-blur-xl",
                                        "bg-zinc-50 dark:bg-zinc-900",
                                        "text-zinc-800 dark:text-zinc-200",
                                        "border-0 transition-colors duration-300",
                                        isPreviewLoading && "text-blue-500 dark:text-blue-400"
                                    )}
                                    disabled={isPreviewLoading}
                                >
                                    {isPreviewLoading ? (
                                        "Loading..."
                                    ) : (
                                        <>
                                            Preview Demo
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Link>

                        <Link 
                            href="https://github.com/yourusername/yourrepo" 
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
                                    className="relative h-10 sm:h-12 w-10 sm:w-12 rounded-full backdrop-blur-xl 
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
