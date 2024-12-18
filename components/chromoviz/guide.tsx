"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Loader2 } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GuideStep {
    title: string;
    description: string;
    image?: string;
}

const guideSteps: GuideStep[] = [
    {
        title: "Upload Your Data",
        description: "Start by uploading your chromosome data files. CHITRA supports various file formats including CSV and TSV.",
    },
    {
        title: "Visualize",
        description: "Once uploaded, your data will be automatically processed and visualized in an interactive format.",
    },
    {
        title: "Analyze",
        description: "Use our powerful analysis tools to explore chromosomal rearrangements and patterns.",
    },
    {
        title: "Export Results",
        description: "Export your visualizations and analysis results in multiple formats for further use or publication.",
    },
];

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export function GuideSheet({ children }: { children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleOpenGuide = () => {
        setIsLoading(true);
        setIsOpen(true);
        // Simulate loading time for content
        setTimeout(() => setIsLoading(false), 500);
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
            <DrawerTrigger asChild>
                {children || (
                    <Button 
                        variant="ghost" 
                        className="hover:bg-accent/50 h-9"
                        onClick={handleOpenGuide}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Guide
                            </>
                        )}
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="fixed bottom-0 left-0 right-0 rounded-t-[10px] bg-background/80 backdrop-blur-xl border-t shadow-lg">
                <div className="mx-auto w-full max-w-none md:max-w-none px-4 pb-8">
                    {/* Handle - only show on mobile */}
                    <div className="sticky top-0 flex w-full items-center justify-center bg-transparent pt-4 md:hidden">
                        <div className="h-1.5 w-12 rounded-full bg-muted" />
                    </div>

                    {/* Adjust height based on screen size */}
                    <div className="h-[90vh] md:h-[80vh] overflow-y-auto overscroll-contain">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeIn}>
                                <DrawerHeader className="mt-4">
                                    <DrawerTitle className="text-2xl font-medium">Getting Started with CHITRA</DrawerTitle>
                                    <DrawerDescription className="text-base text-muted-foreground">
                                        Follow this guide to learn how to use CHITRA effectively for your chromosome analysis.
                                    </DrawerDescription>
                                </DrawerHeader>
                            </motion.div>
                            
                            {/* Update layout for desktop */}
                            <div className="mt-6 space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
                                {/* Quick Start - full width on mobile, left column on desktop */}
                                <motion.div 
                                    className="md:col-span-1"
                                    variants={fadeIn}
                                >
                                    <h3 className="text-lg font-medium mb-4">Quick Start Guide</h3>
                                    <motion.div 
                                        className="space-y-6"
                                        variants={staggerContainer}
                                    >
                                        {guideSteps.map((step, index) => (
                                            <motion.div
                                                key={step.title}
                                                variants={fadeIn}
                                                className={cn(
                                                    "space-y-3 rounded-lg border bg-card/50 p-4",
                                                    "hover:bg-accent/10 transition-colors"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="text-base font-medium">{step.title}</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-11">{step.description}</p>
                                                {step.image && (
                                                    <img 
                                                        src={step.image} 
                                                        alt={step.title} 
                                                        className="rounded-lg border mt-2 pl-8"
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>

                                {/* Right column for desktop */}
                                <motion.div 
                                    className="space-y-8 md:col-span-1"
                                    variants={fadeIn}
                                >
                                    {/* Tips & Tricks */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Tips & Tricks</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {[
                                                "Use the zoom controls to explore detailed regions",
                                                "Save your visualization settings for future use",
                                                "Export high-resolution images for publications",
                                                "Use keyboard shortcuts for faster navigation"
                                            ].map((tip, i) => (
                                                <div 
                                                    key={i} 
                                                    className="rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors"
                                                >
                                                    <p className="text-sm text-muted-foreground">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Resources */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Additional Resources</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {[
                                                { title: "Documentation", desc: "Detailed guides and API references" },
                                                { title: "Video Tutorials", desc: "Step-by-step visual instructions" },
                                                { title: "Example Datasets", desc: "Sample data to get started" },
                                                { title: "API Reference", desc: "Complete API documentation" }
                                            ].map((resource, i) => (
                                                <div 
                                                    key={i} 
                                                    className="rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors"
                                                >
                                                    <h4 className="font-medium mb-1">{resource.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{resource.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div variants={fadeIn}>
                                <DrawerFooter className="mt-8">
                                    <DrawerClose asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-full rounded-full md:max-w-[200px]"
                                        >
                                            Close Guide
                                        </Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
