"use client"
import Link from 'next/link';
import { Github, Mail, Building2, GraduationCap, BookOpen, FileText, Code, MoveRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, FormEvent, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function Footer() {
    const [email, setEmail] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref);

    const handleNewsletterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // Add your newsletter logic here
            toast.success("Thanks for subscribing!");
            setEmail('');
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <footer className="relative border-t bg-gradient-to-b from-background to-background/80">
            <div className="mx-auto max-w-screen-xl px-4 py-12 sm:py-16">
                <div className="md:flex justify-between w-full gap-12">
                    {/* Newsletter Section */}
                    <div className="max-w-md">
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            Stay Updated with CHITRA
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Get the latest updates on genomic visualization and analysis
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="mt-6">
                            <div className="relative flex items-center">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pr-32 rounded-full"
                                />
                                <Button 
                                    type="submit"
                                    className="absolute right-1 rounded-full"
                                    size="sm"
                                >
                                    Subscribe
                                    <MoveRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Links Sections */}
                    <div className="flex gap-12 mt-8 md:mt-0">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Platform</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                                        API
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Connect</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="https://github.com/your-repo" className="text-muted-foreground hover:text-foreground transition-colors">
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a href="https://twitter.com/your-handle" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Institute Section */}
                <motion.div 
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 pt-8 border-t"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">CSIR-IGIB</p>
                                <p className="text-sm text-muted-foreground">Lab of Bioinformatics and Big Data</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">
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