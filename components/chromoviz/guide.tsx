"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Loader2, Link as LinkIcon, X, FileText, Video, Database } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay"
import { ExampleFilesDrawer } from "./example-files-drawer";
import Link from "next/link";

interface GuideStep {
    title: string;
    description: string;
    image?: string;
}

const guideSteps: GuideStep[] = [
    {
        title: "Chromosome Visualization",
        description: "Interactive visualization of chromosomal data",
        image: "/media/i1.webp",
    },
    {
        title: "Multi-Species Comparison",
        description: "Compare genomic data across species",
        image: "/media/i2.webp",
    },
    {
        title: "Syntenic Relationships",
        description: "Explore syntenic relationships",
        image: "/media/i3.webp",
    },
    {
        title: "Interactive Analysis",
        description: "Real-time genomic data analysis",
        image: "/media/i4.webp",
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

interface GuideSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GuideSheet({ open, onOpenChange }: GuideSheetProps) {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )
    const [isExampleDrawerOpen, setIsExampleDrawerOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

    const openLightbox = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setSelectedImage(null);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
            <DrawerContent className="fixed bottom-0 left-0 right-0 rounded-t-[10px] bg-background/80 backdrop-blur-xl border-t shadow-lg">
                <div className="mx-auto w-full max-w-7xl">
                    {/* Sticky Header */}
                    <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-10 pt-4">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4 md:hidden" />
                        <DrawerHeader className="px-4">
                            <DrawerTitle className="text-2xl font-medium">Getting Started with CHITRA</DrawerTitle>
                            <DrawerDescription className="text-base text-muted-foreground">
                                Follow this guide to learn how to use CHITRA effectively for your chromosome analysis.
                            </DrawerDescription>
                        </DrawerHeader>
                        <Separator className="my-2" />
                    </div>

                    {/* Scrollable Content */}
                    <div className="h-[calc(90vh-120px)] overflow-y-auto px-4 pb-4">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="mt-6 space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0"
                        >
                            {/* Left Column */}
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
                                            className="space-y-3 rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <h4 className="text-base font-medium">{step.title}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground pl-11">{step.description}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div 
                                className="space-y-8 md:col-span-1"
                                variants={fadeIn}
                            >
                                <div className="w-full relative">
                                    <Carousel
                                        plugins={[plugin.current]}
                                        onMouseEnter={plugin.current.stop}
                                        onMouseLeave={plugin.current.reset}
                                    >
                                        <CarouselContent>
                                            {guideSteps.map((step, index) => (
                                                <CarouselItem key={index} onClick={() => step.image && openLightbox(step.image)}>
                                                    <div className="p-1 cursor-pointer">
                                                        <img src={step.image} alt={step.title} className="rounded-lg border" />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                                    </Carousel>
                                </div>
                                
                                <Separator className="my-8" />

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Additional Resources</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Link href="/docs" target="_blank" rel="noopener noreferrer" className="rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors">
                                            <h4 className="font-medium mb-1">Documentation</h4>
                                            <p className="text-sm text-muted-foreground">Detailed guides and references</p>
                                        </Link>
                                        <Link href="/" className="rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors">
                                            <h4 className="font-medium mb-1">Video Tutorials</h4>
                                            <p className="text-sm text-muted-foreground">Step-by-step visual instructions</p>
                                        </Link>
                                        <button onClick={() => setIsExampleDrawerOpen(true)} className="text-left rounded-lg border bg-card/50 p-4 hover:bg-accent/10 transition-colors">
                                            <h4 className="font-medium mb-1">Example Datasets</h4>
                                            <p className="text-sm text-muted-foreground">Sample data to get started</p>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Sticky Footer */}
                    <DrawerFooter className="sticky bottom-0 bg-background/80 backdrop-blur-xl z-10 border-t">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <X className="h-4 w-4 mr-2" />
                                    Close
                                </Button>
                            </DrawerClose>
                            <Link href="/docs" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Documentation
                                </Button>
                            </Link>
                            <ExampleFilesDrawer onLoadExample={() => {}}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Database className="h-4 w-4 mr-2" />
                                    Example Datasets
                                </Button>
                            </ExampleFilesDrawer>
                            <Link href="/" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full">
                                    <Video className="h-4 w-4 mr-2" />
                                    Video Tutorials
                                </Button>
                            </Link>
                        </div>
                    </DrawerFooter>
                </div>
                <ExampleFilesDrawer open={isExampleDrawerOpen} onOpenChange={setIsExampleDrawerOpen} onLoadExample={() => {}} />

                {isLightboxOpen && selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={closeLightbox} 
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-w-[90vw] max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
                        >
                            <img 
                                src={selectedImage} 
                                alt="Full view" 
                                className="object-contain w-full h-full rounded-lg shadow-2xl"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full"
                                onClick={closeLightbox}
                            >
                                <X className="h-6 w-6" />
                                <span className="sr-only">Close lightbox</span>
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </DrawerContent>
        </Drawer>
    );
}
