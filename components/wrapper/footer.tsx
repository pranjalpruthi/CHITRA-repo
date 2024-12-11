"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Github, Copy, CheckCheck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import HyperText from '../ui/hyper-text';
import { Button } from '../ui/button';

export default function Footer() {
    const ref = useRef(null);
    const isInView = useInView(ref);
    const [hasCopied, setHasCopied] = useState(false);

    const citation = `Sharma, et al. (2024). CHITRA: CHromosome Interactive Tool for Rearrangement Analysis. GitHub repository`;

    const handleCopyCitation = async () => {
        await navigator.clipboard.writeText(citation);
        setHasCopied(true);
        toast.success("Citation copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <footer className="relative border-t bg-black/95 backdrop-blur-xl">
            <div className="mx-auto max-w-screen-xl px-4 py-6 sm:py-8">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
                    {/* Logo and Brand Section */}
                    <div className="sm:col-span-2 lg:col-span-5 space-y-3">
                        <div className="space-y-1.5">
                            <HyperText 
                                text="CHITRA"
                                className="text-base sm:text-lg font-bold text-white/90"
                                duration={1000}
                            />
                            <p className="text-xs text-white/60">
                                Supported by
                            </p>
                        </div>

                        {/* Logos Grid - Apple-style cards */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[240px]">
                            {/* CSIR-IGIB Logo */}
                            <div className={cn(
                                "relative overflow-hidden rounded-lg",
                                "bg-gradient-to-b from-zinc-900/90 to-zinc-900/50",
                                "border border-white/[0.08]",
                                "backdrop-blur-md backdrop-saturate-150",
                                "group transition-all duration-300",
                                "hover:border-white/[0.12] hover:bg-zinc-800/50"
                            )}>
                                <div className="p-2 sm:p-3 relative z-10">
                                    <Image
                                        src="/assets/igib.png"
                                        alt="CSIR-IGIB Logo"
                                        width={60}
                                        height={60}
                                        className="object-contain w-full h-auto aspect-square"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Rockefeller Logo - Same styling */}
                            <div className={cn(
                                "relative overflow-hidden rounded-lg",
                                "bg-gradient-to-b from-zinc-900/90 to-zinc-900/50",
                                "border border-white/[0.08]",
                                "backdrop-blur-md backdrop-saturate-150",
                                "group transition-all duration-300",
                                "hover:border-white/[0.12] hover:bg-zinc-800/50"
                            )}>
                                <div className="p-2 sm:p-3 relative z-10">
                                    <Image
                                        src="/assets/rf.jpg"
                                        alt="Rockefeller Logo"
                                        width={60}
                                        height={60}
                                        className="object-contain w-full h-auto aspect-square"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Lab Logo - Same styling */}
                            <div className={cn(
                                "relative overflow-hidden rounded-lg",
                                "bg-gradient-to-b from-zinc-900/90 to-zinc-900/50",
                                "border border-white/[0.08]",
                                "backdrop-blur-md backdrop-saturate-150",
                                "group transition-all duration-300",
                                "hover:border-white/[0.12] hover:bg-zinc-800/50"
                            )}>
                                <div className="p-2 sm:p-3 relative z-10">
                                    <Image
                                        src="/assets/jnlab.png"
                                        alt="Lab Logo"
                                        width={60}
                                        height={60}
                                        className="object-contain w-full h-auto aspect-square"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Status and Citation Section - Apple-style */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full px-3 py-1.5 w-fit border border-white/[0.08]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-white/60">All systems operational</span>
                        </div>

                        <Button
                            variant="outline"
                            className={cn(
                                "h-8 px-3 text-xs",
                                "bg-zinc-900/50 hover:bg-zinc-800/50",
                                "text-white/80 hover:text-white/90",
                                "border-white/[0.08] hover:border-white/[0.12]",
                                "backdrop-blur-md backdrop-saturate-150",
                                "transition-all duration-300"
                            )}
                            onClick={handleCopyCitation}
                        >
                            {hasCopied ? (
                                <>
                                    <CheckCheck className="mr-2 h-3 w-3" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-3 w-3" />
                                    Copy Citation
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Resources Section - Apple-style */}
                    <div className="lg:col-span-3 space-y-3">
                        <h3 className="text-sm font-medium text-white/90">Resources</h3>
                        <ul className="space-y-1.5">
                            {["Documentation", "API", "GitHub"].map((item) => (
                                <li key={item}>
                                    <Link 
                                        href={item === "GitHub" ? "https://github.com/your-repo" : `/${item.toLowerCase()}`}
                                        className="text-white/60 hover:text-white/90 transition-colors text-xs"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section - Apple-style */}
                <motion.div 
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 pt-4 border-t border-white/[0.08]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div>
                                <p className="text-xs font-medium text-white/90">CSIR-IGIB</p>
                                <p className="text-[10px] text-white/60">Lab of Bioinformatics and Big Data</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-white/60 sm:justify-end">
                            <Link href="/privacy" className="hover:text-white/90 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white/90 transition-colors">
                                Terms of Service
                            </Link>
                            <span>&copy; {new Date().getFullYear()} CHITRA</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}