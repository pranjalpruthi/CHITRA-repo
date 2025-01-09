"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Github, Copy, CheckCheck, Building } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import HyperText from '../ui/hyper-text';
import { Button } from '../ui/button';
import AnimatedText from '../ui/animated-text';

export default function Footer() {
    const ref = useRef(null);
    const isInView = useInView(ref);
    const [hasCopied, setHasCopied] = useState(false);

    const citation = `Pruthi, P., Narayan, J., Agarwal, P., Shukla, N., & Bhatia, A. (2024). CHITRA: Chromosome Interactive Tool for Rearrangement Analysis. CSIR-IGIB.`;

    const handleCopyCitation = async () => {
        await navigator.clipboard.writeText(citation);
        setHasCopied(true);
        toast.success("Citation copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <footer className="relative mt-auto border-t bg-black/95 backdrop-blur-xl">
            <div className="mx-auto max-w-screen-xl px-3 py-4 sm:px-4 sm:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Logo and Brand Section */}
                    <div className="sm:col-span-2 lg:col-span-5 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HyperText 
                                    text="Supported by"
                                    className="text-xs text-white/60"
                                    duration={1000}
                                />
                            </div>
                        </div>

                        {/* Logos */}
                        <div className="flex gap-3 items-center">
                            <Image
                                src="/assets/logocloud.svg"
                                alt="Logo Cloud"
                                width={120}
                                height={80}
                                className="object-contain h-auto"
                            />
                            <Image
                                src="/assets/rf.jpg"
                                alt="Rockefeller Logo"
                                width={120}
                                height={80}
                                className="object-contain h-auto"
                            />
                        </div>
                    </div>

                    {/* Status and Citation Section */}
                    <div className="lg:col-span-4 space-y-2">
                        <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full px-2 py-1 w-fit border border-white/[0.08]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-white/60">All systems operational</span>
                        </div>

                        <Button
                            variant="outline"
                            className={cn(
                                "h-7 px-2 text-xs",
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
                                    <CheckCheck className="mr-1 h-3 w-3" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-1 h-3 w-3" />
                                    Copy Citation
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Resources Section */}
                    <div className="lg:col-span-3 space-y-2">
                        <h3 className="text-xs font-medium text-white/90">Resources</h3>
                        <ul className="space-y-1">
                            {[
                                { name: "Documentation", url: "/docs" },
                                { name: "Lab", url: "https://jitendralab.igib.res.in" },
                                { name: "GitHub", url: "https://github.com/pranjalpruthi/CHITRA" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        href={item.url}
                                        className="text-white/60 hover:text-white/90 transition-colors text-xs"
                                        target={item.url.startsWith('http') ? '_blank' : '_self'}
                                        rel={item.url.startsWith('http') ? 'noopener noreferrer' : ''}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <motion.div 
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 pt-3 border-t border-white/[0.08]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <Building className="h-6 w-6 text-white/60" />
                            <div>
                                <p className="text-xs font-medium text-white/90">CSIR-IGIB</p>
                                <p className="text-[10px] text-white/60">Lab of Bioinformatics and Big Data</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-white/60 sm:justify-end">
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

            {/* Animated text - made more subtle */}
            <div className="relative h-16 w-full overflow-hidden opacity-20 select-none pointer-events-none">
                <AnimatedText 
                    text="CHITRA" 
                    className="!text-[8vw] font-black tracking-tighter text-white/80"
                />
            </div>
        </footer>
    );
}