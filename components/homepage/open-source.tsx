import { Github } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function OpenSource() {
    return (
        <div className="w-full max-w-[1100px] mx-auto px-4 py-24">
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Left Content */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            oss/acc
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                            Open-source
                        </h2>
                    </div>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        We believe strongly in the value of open source: our codebase and development process is available to learn from and contribute to.
                    </p>

                    <Link 
                        href="https://github.com/pranjalpruthi" 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button 
                            variant="outline" 
                            className="h-11 px-6 gap-2 bg-background/50 hover:bg-muted/50"
                        >
                            <Github className="w-5 h-5" />
                            Star us on GitHub
                        </Button>
                    </Link>
                </div>

                {/* Right Content - GitHub Card */}
                <div className="relative aspect-[4/3] w-full">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Image
                                src="/assets/github-card.svg"
                                alt="GitHub Card"
                                width={200}
                                height={200}
                                className="w-48 h-48 opacity-80"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-neutral-950/0" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
