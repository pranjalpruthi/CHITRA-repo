"use client"
import Link from 'next/link';
import { Github, Mail, Building2, GraduationCap, BookOpen, FileText, Code } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { RainbowGlow } from '@/components/ui/rainbow-glow';

export default function Footer() {
    return (
        <footer className="relative border-t dark:bg-black">
            <RainbowGlow 
                className="opacity-20 absolute top-0 w-full h-[400px] blur-[50px]"
            />
            <div className="mx-auto max-w-screen-xl px-4 py-6 sm:py-8">
                <motion.div 
                    className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                >
                    <div className="space-y-2">
                        <h3 className="font-medium">About</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <BookOpen className="h-4 w-4" />
                                    <span>About</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/methodology" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <FileText className="h-4 w-4" />
                                    <span>Methodology</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/docs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <FileText className="h-4 w-4" />
                                    <span>Docs</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/examples" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <Code className="h-4 w-4" />
                                    <span>Examples</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/api" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <Code className="h-4 w-4" />
                                    <span>API</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium">Connect</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a 
                                    href="https://github.com/your-repo/chromoviz" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="h-4 w-4" />
                                    <span>GitHub</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="mailto:support@chromoviz.com" 
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>Contact</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium">Affiliations</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">CSIR Institute of Genomics and Integrative Biology (CSIR-IGIB)</p>
                                    <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
                                        Lab of Bioinformatics and Big Data
                                    </Badge>
                                </div>
                            </li>
                            <li className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Funded by Rockefeller Foundation</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>

                <div className="mt-6 pt-6">
                    <Separator className="mb-6" />
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <p className="text-xs text-muted-foreground order-2 sm:order-1">
                            &copy; {new Date().getFullYear()} CHITRA. All rights reserved.
                        </p>
                        <ul className="flex flex-wrap gap-4 text-xs order-1 sm:order-2">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}