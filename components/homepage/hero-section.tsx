"use client";
import { ArrowRight, Github, BookOpen, Mail } from 'lucide-react';
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { TITLE_TAILWIND_CLASS } from '@/utils/constants';
import { GradientBentoCard } from "../ui/gradient-bento-card";
import { AboutSheet } from "../chromoviz/about";
import { GuideSheet } from "../chromoviz/guide";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import { motion } from "framer-motion";
import { useState } from 'react';
import { RainbowButton } from "../ui/rainbow-button";
import { 
  Microscope, 
  FileSpreadsheet, 
  BarChart3 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Particles from "../ui/particles";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { BlurIn } from "../ui/Blur-in";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";
import Image from "next/image";
import HyperText from "../ui/hyper-text";

// Create separate components for each feature card
function FeatureOne() {
    return (
        <GradientBentoCard
            title="Interactive Visualization"
            className={`p-3 sm:p-6 h-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 
                dark:from-blue-400/10 dark:to-blue-500/10 
                border border-blue-500/20 dark:border-blue-400/20`}
        >
            <Microscope className="h-5 w-5 sm:h-8 sm:w-8 text-blue-500 dark:text-blue-400 mb-1 sm:mb-4" />
            <div className="hidden sm:block space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground">
                    Powerful tools for exploring chromosomal rearrangements with intuitive controls
                </p>
                <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                    <li>Real-time chromosome visualization</li>
                    <li>Interactive zoom and pan controls</li>
                    <li>Customizable color schemes</li>
                    <li>Detailed region annotations</li>
                    <li>Compare multiple samples side by side</li>
                    <li>Export high-resolution images</li>
                </ul>
            </div>
        </GradientBentoCard>
    );
}

function FeatureTwo() {
    return (
        <GradientBentoCard
            title="Multiple File Formats"
            className={`p-3 sm:p-6 h-full bg-gradient-to-br from-purple-500/10 to-purple-600/10 
                dark:from-purple-400/10 dark:to-purple-500/10 
                border border-purple-500/20 dark:border-purple-400/20`}
        >
            <FileSpreadsheet className="h-5 w-5 sm:h-8 sm:w-8 text-purple-500 dark:text-purple-400 mb-1 sm:mb-4" />
            <p className="hidden sm:block text-muted-foreground">
                Support for various data formats including CSV and TSV for easy data import
            </p>
        </GradientBentoCard>
    );
}

function FeatureThree() {
    return (
        <GradientBentoCard
            title="Research-Grade Analysis"
            className={`p-3 sm:p-6 h-full bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 
                dark:from-emerald-400/10 dark:to-emerald-500/10 
                border border-emerald-500/20 dark:border-emerald-400/20`}
        >
            <BarChart3 className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-500 dark:text-emerald-400 mb-1 sm:mb-4" />
            <p className="hidden sm:block text-muted-foreground">
                Advanced features for scientific research and publication-ready visualizations
            </p>
        </GradientBentoCard>
    );
}

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
        <div className="flex flex-col items-center justify-center leading-6 relative z-10 px-4 w-full 
            min-h-[85vh] py-8 sm:py-16 md:py-24 
            pt-16 sm:pt-20 md:pt-24
            bg-gradient-to-b from-background via-background/95 to-background/90
            overflow-hidden">
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

            {/* Hero Image Overlay - Updated gradient mask */}
            <div className="absolute left-0 top-0 w-full lg:w-2/3 h-full overflow-hidden pointer-events-none">
                <div className="relative w-full h-full">
                    <Image
                        src="/assets/chitra3.svg"
                        alt="CHITRA Visualization"
                        fill
                        className={cn(
                            "object-cover object-left-top scale-110",
                            "contrast-125 brightness-110",
                            "opacity-30 lg:opacity-40",
                            "dark:mix-blend-lighten light:mix-blend-darken",
                            "select-none"
                        )}
                        priority
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        style={{
                            maskImage: 'linear-gradient(to right, black 30%, black 50%, transparent 90%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 30%, black 50%, transparent 90%)'
                        }}
                    />
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-screen-xl mx-auto">
                {/* Premium Apple-style Beta Badge */}
                <motion.div 
                    className="mb-6 sm:mb-8 md:mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={cn(
                        "group rounded-full",
                        "border border-black/5",
                        // Premium glass effect with subtle gradient
                        "bg-gradient-to-b from-white/80 to-white/50",
                        "dark:from-neutral-900/90 dark:to-neutral-800/90",
                        // Backdrop blur and shadow
                        "backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                        "dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
                        // Hover effects
                        "hover:cursor-pointer",
                        "hover:bg-gradient-to-b hover:from-white/90 hover:to-white/60",
                        "dark:hover:from-neutral-800/90 dark:hover:to-neutral-700/90",
                        // Smooth transition
                        "transition-all duration-300 ease-out",
                        // Fix width and center alignment
                        "inline-flex"
                    )}>
                        <AnimatedShinyText 
                            className={cn(
                                "inline-flex items-center justify-center px-5 py-1.5",
                                // Text styling
                                "text-sm font-medium",
                                // Premium gradient text
                                "text-neutral-800 dark:text-neutral-200",
                                // Remove default styles that might conflict
                                "!bg-none",
                                "!bg-clip-text",
                                // Hover animation
                                "transition-all duration-300",
                                "group-hover:opacity-80",
                                // Fix width issues
                                "whitespace-nowrap"
                            )}
                            shimmerWidth={200}
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                                </span>
                                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                                    Coming Soon - Join the Beta
                                </span>
                            </span>
                            <ArrowRight className="ml-2 size-3.5 transition-transform duration-300 
                                ease-in-out group-hover:translate-x-0.5 text-neutral-800 dark:text-neutral-200" />
                        </AnimatedShinyText>
                    </div>
                </motion.div>

                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center relative"
                >
                    <BlurIn>
                        <span className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                            CHITRA
                        </span>
                    </BlurIn>
                    <div className="mt-3 px-2 sm:px-0">
                        <HyperText 
                            text="CHromosome Interactive Tool for Rearrangement Analysis"
                            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground/90"
                            wrapperClassName="max-w-[95vw] sm:max-w-[800px] mx-auto"
                            duration={2000}
                            responsive={true}
                        />
                    </div>
                </motion.div>

                {/* Beta Signup Form */}
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleBetaSignup}
                    className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-12 w-full max-w-md mx-auto"
                >
                    <div className="flex-1 relative">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 px-4 rounded-full bg-background/50 backdrop-blur-sm border-muted 
                                focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
                                hover:border-blue-500/30"
                            required
                        />
                    </div>
                    <div className="relative overflow-hidden rounded-full">
                        <RainbowButton
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-8 rounded-full font-medium w-full sm:w-auto"
                        >
                            {isLoading ? (
                                "Joining..."
                            ) : (
                                <>
                                    Join Beta
                                    <ArrowRight className="ml-2 h-4 w-4" />
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
                    className="mt-4 flex items-center justify-center gap-4 w-full"
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

                {/* Features Grid */}
                <div className="w-full relative z-10">
                    {/* Updated Features Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-3 sm:gap-6 mt-16 sm:mt-20 w-full max-w-6xl mx-auto px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="col-span-2 sm:row-span-2 sm:col-span-1"
                        >
                            <FeatureOne />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="col-span-1"
                        >
                            <FeatureTwo />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="col-span-1"
                        >
                            <FeatureThree />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
