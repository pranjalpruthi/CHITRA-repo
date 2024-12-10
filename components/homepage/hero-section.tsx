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



export default function HeroSection() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    // Define feature data
    const features = [
        {
            icon: Microscope,
            title: "Interactive Visualization",
            description: "Powerful tools for exploring chromosomal rearrangements with intuitive controls",
            gradient: "from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10",
            iconColor: "text-blue-500 dark:text-blue-400",
            borderColor: "border-blue-500/20 dark:border-blue-400/20"
        },
        {
            icon: FileSpreadsheet,
            title: "Multiple File Formats",
            description: "Support for various data formats including CSV and TSV for easy data import",
            gradient: "from-purple-500/10 to-purple-600/10 dark:from-purple-400/10 dark:to-purple-500/10",
            iconColor: "text-purple-500 dark:text-purple-400",
            borderColor: "border-purple-500/20 dark:border-purple-400/20"
        },
        {
            icon: BarChart3,
            title: "Research-Grade Analysis",
            description: "Advanced features for scientific research and publication-ready visualizations",
            gradient: "from-emerald-500/10 to-emerald-600/10 dark:from-emerald-400/10 dark:to-emerald-500/10",
            iconColor: "text-emerald-500 dark:text-emerald-400",
            borderColor: "border-emerald-500/20 dark:border-emerald-400/20"
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center leading-6 relative z-10 px-4 w-full 
            py-8 sm:py-16 md:py-24 
            pt-16 sm:pt-20 md:pt-24">
            {/* Beta Badge */}
            <motion.div 
                className="mb-4 sm:mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium 
                    bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300 
                    backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20
                    shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    🚀 Coming Soon - Beta Access
                </span>
            </motion.div>

            {/* Title with improved spacing */}
            <h1 className={`${TITLE_TAILWIND_CLASS} scroll-m-20 font-semibold tracking-tight text-center 
                max-w-[1120px] text-2xl sm:text-3xl lg:text-5xl mb-3
                bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent`}>
                CHITRA
                <span className="block text-lg sm:text-xl lg:text-3xl mt-3 font-normal">
                    CHromosome Interactive Tool for Rearrangement Analysis
                </span>
            </h1>
            
            {/* Description with improved spacing */}
            <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 text-center 
                mt-4 mb-6 text-sm lg:text-base px-4">
                A powerful visualization tool for exploring chromosomal rearrangements and synteny blocks, 
                designed for researchers and scientists in genomics
            </p>

            {/* Beta Access Form with improved spacing */}
            <motion.form 
                onSubmit={handleBetaSignup} 
                className="flex flex-col sm:flex-row gap-2 mt-6 w-full max-w-md px-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Input
                    type="email"
                    placeholder="Enter your email for beta access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 backdrop-blur-xl bg-white/10 dark:bg-gray-900/50 
                        border-gray-200/30 dark:border-gray-700/30
                        placeholder:text-gray-500 dark:placeholder:text-gray-400
                        focus:border-blue-500/50 dark:focus:border-blue-400/50
                        shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                />
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-12 px-6 w-full sm:w-auto bg-gradient-to-b from-blue-500 to-blue-600 
                        hover:from-blue-400 hover:to-blue-500
                        dark:from-blue-400 dark:to-blue-500 
                        dark:hover:from-blue-300 dark:hover:to-blue-400
                        text-white border-0 shadow-lg shadow-blue-500/25
                        dark:shadow-blue-400/20 transition-all duration-300"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Joining...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Join Beta
                        </span>
                    )}
                </Button>
            </motion.form>

            {/* Action Buttons with improved spacing */}
            <motion.div 
                className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full px-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <Link href="/chromoviz">
                    <RainbowButton 
                        className="group relative h-12 px-8 text-sm font-medium"
                    >
                        Get Started
                        <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
                    </RainbowButton>
                </Link>

                <Link
                    href="https://www.researchgate.net/profile/Jitendra-Narayan-3"
                    target='_blank'
                    aria-label="View Research Publications"
                >
                    <Button 
                        variant="outline" 
                        className="h-12 bg-background/50 hover:bg-muted/50
                            border-border hover:border-border
                            text-foreground"
                    >
                        Publications
                        <BookOpen className='w-4 h-4 ml-2' />
                    </Button>
                </Link>

                <Link
                    href="https://github.com/pranjalpruthi"
                    target='_blank'
                    aria-label="View CHITRA on GitHub"
                >
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-background/50 hover:bg-muted/50
                            border-border hover:border-border
                            text-foreground transition-transform hover:scale-105"
                    >
                        <Github className='w-5 h-5' />
                    </Button>
                </Link>
            </motion.div>

            {/* Feature cards with improved spacing */}
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[1100px] px-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        className={cn(
                            "group relative rounded-xl p-4 hover:shadow-md transition-all duration-300",
                            "backdrop-blur-sm border",
                            feature.borderColor,
                            "hover:scale-[1.02]"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50",
                            feature.gradient
                        )} />
                        
                        <div className="relative space-y-2">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                "bg-white/50 dark:bg-gray-900/50",
                                "border",
                                feature.borderColor
                            )}>
                                <feature.icon className={cn(
                                    "w-4 h-4",
                                    feature.iconColor
                                )} />
                            </div>

                            <h3 className="font-medium text-sm text-foreground">
                                {feature.title}
                            </h3>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
