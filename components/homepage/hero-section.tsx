"use client";
import { ArrowRight, Github, Loader2 } from 'lucide-react';
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { useState } from 'react';
import { cn } from "@/lib/utils";
import Particles from "../ui/particles";
import { BlurIn } from "../ui/Blur-in";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";
import { ProgressSlider, SliderBtnGroup, SliderBtn, SliderWrapper } from "../ui/progress-carousel";
import { Dialog, DialogContent } from "../ui/dialog";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { useRef } from "react";
import { 
  BarChart3, 
  Network, 
  LineChart,
  Dna,
  Microscope,
  Brain
} from "lucide-react";
import { DataFlowDiagram } from "./data-flow-diagram";
import AnimatedText from '../ui/animated-text';
import HyperText from '../ui/hyper-text';

const videos = [
  { 
    id: "v1", 
    src: "/media/v1.mp4",
    title: "Synteny Block Visualization",
    desc: "Interactive visualization of synteny blocks across chromosomes"
  },
  { 
    id: "v2", 
    src: "/media/v2.mp4",
    title: "Multi-Species Comparison",
    desc: "Compare genomic structures across multiple species"
  },
  { 
    id: "v3", 
    src: "/media/v3.mp4",
    title: "Breakpoint Analysis",
    desc: "Detailed analysis of chromosomal breakpoints"
  },
  { 
    id: "v4", 
    src: "/media/v4.mp4",
    title: "Interactive Visualization",
    desc: "Dynamic and interactive genome visualization tools"
  },
];

export default function HeroSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGithubHovered, setIsGithubHovered] = useState(false);
    const [fullscreenVideo, setFullscreenVideo] = useState<{id: string, src: string} | null>(null);

    const handleGetStarted = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen w-full overflow-hidden">
            <Particles
                className="fixed inset-0 -z-10"
                quantity={100}
                staticity={30}
                color="#3b82f6"
                ease={20}
                size={1.2}
            />

            <div className="relative z-10 flex min-h-screen w-full items-center justify-center py-0">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-8 lg:grid-cols-[0.7fr,1.3fr] lg:gap-20">
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="w-full space-y-8"
                            >
                                <Badge 
                                    variant="outline" 
                                    className="bg-blue-500/5 text-blue-600 dark:text-blue-400 text-sm font-medium px-6 py-2 rounded-full mx-auto lg:ml-0"
                                >
                                    <span className="relative flex h-2 w-2 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Visualize Chromosomal Data Like Never Before
                                </Badge>

                                <div className="space-y-4">
                                    <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white text-center lg:text-left">
                                        CHITRA
                                    </h1>
                                    <div className="relative">
                                        <HyperText 
                                            text="Chromosome Interactive Tool for Rearrangement Analysis"
                                            className="text-sm sm:text-base text-muted-foreground font-medium"
                                            duration={1000}
                                        />
                                    </div>
                                </div>

                                <p className="text-xl lg:text-2xl text-muted-foreground font-light max-w-xl mx-auto lg:ml-0">
                                    An advanced visualization tool for studying chromosomal rearrangements through interactive synteny block analysis and chromosome breakpoint mapping.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center sm:justify-center lg:justify-start w-full">
                                    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-black/20 
                                        rounded-full p-3 sm:p-6 shadow-lg w-full sm:w-auto">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex items-center justify-center gap-2 sm:gap-3 w-full"
                                        >
                                            <Link href="/chitra" className="flex-1 sm:flex-none" onClick={handleGetStarted}>
                                                <div className="relative overflow-hidden rounded-full shadow group p-0.5 w-full sm:w-auto">
                                                    <span className={cn(
                                                        "absolute inset-[-1000%] animate-[spin_5s_linear_infinite_reverse]",
                                                        "bg-[conic-gradient(from_90deg_at_50%_50%,#4f46e5_0%,#06b6d4_25%,#3b82f6_50%,#4f46e5_75%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1d4ed8_0%,#2563eb_25%,#3b82f6_50%,#60a5fa_75%)]"
                                                    )} />
                                                    <Button 
                                                        variant="outline"
                                                        disabled={isLoading}
                                                        className={cn(
                                                            "h-9 sm:h-12 px-4 sm:px-8 rounded-full font-medium w-full sm:w-auto",
                                                            "bg-white/80 dark:bg-black/80 backdrop-blur-xl",
                                                            "text-zinc-800 dark:text-zinc-200",
                                                            "border-0 transition-colors duration-300",
                                                            "relative z-10",
                                                            "text-sm sm:text-base"
                                                        )}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Loading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Get Started
                                                                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Link>

                                            <Link 
                                                href="https://github.com/pranjalpruthi/CHITRA" 
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
                                                        className="relative h-9 sm:h-12 w-9 sm:w-12 rounded-full backdrop-blur-xl 
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
                            </motion.div>
                        </div>

                        <motion.div 
                            className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[2/1] cursor-none"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="relative h-full w-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm bg-white/5">
                                <ProgressSlider
                                    activeSlider={videos[0].id}
                                    duration={10000}
                                    className="w-full h-full"
                                    items={videos}
                                >
                                    <div className="relative h-full">
                                        {videos.map((video) => (
                                            <SliderWrapper
                                                key={video.id}
                                                value={video.id}
                                                className="absolute inset-0"
                                                onClick={() => setFullscreenVideo(video)}
                                            >
                                                <video
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                    onLoadedData={(e) => {
                                                        const videoElement = e.target as HTMLVideoElement;
                                                        switch(video.id) {
                                                            case 'v1':
                                                                videoElement.currentTime = 15;
                                                                break;
                                                            case 'v2':
                                                                videoElement.currentTime = 23;
                                                                break;
                                                            case 'v3':
                                                                videoElement.currentTime = 23;
                                                                break;
                                                            case 'v4':
                                                                videoElement.currentTime = 13;
                                                                break;
                                                            default:
                                                                videoElement.currentTime = 0;
                                                        }
                                                    }}
                                                >
                                                    <source src={video.src} type="video/mp4" />
                                                </video>
                                            </SliderWrapper>
                                        ))}
                                    </div>

                                    <SliderBtnGroup>
                                        {videos.map((video) => (
                                            <SliderBtn
                                                key={video.id}
                                                value={video.id}
                                                className={cn(
                                                    "text-center p-1.5 sm:p-2 rounded-xl",
                                                    "hover:bg-white/10 transition-colors",
                                                    "w-full sm:w-[200px] md:w-[250px]",
                                                    "flex flex-col gap-0.5 sm:gap-1"
                                                )}
                                                progressBarClass="bg-blue-500 h-0.5"
                                            >
                                                <h3 className={cn(
                                                    "text-white font-medium",
                                                    "text-xs sm:text-sm",
                                                    "px-1",
                                                    "whitespace-normal",
                                                    "min-h-[2.5em]",
                                                    "flex items-center justify-center"
                                                )}>
                                                    {video.title}
                                                </h3>
                                            </SliderBtn>
                                        ))}
                                    </SliderBtnGroup>
                                </ProgressSlider>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Dialog open={!!fullscreenVideo} onOpenChange={() => setFullscreenVideo(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
                    {fullscreenVideo && (
                        <video
                            autoPlay
                            controls
                            className="w-full h-full object-contain"
                        >
                            <source src={fullscreenVideo.src} type="video/mp4" />
                        </video>
                    )}
                </DialogContent>
            </Dialog>

            <div className="mt-0 hidden md:block">
                <div className="container mx-auto px-4">
                    <DataFlowDiagram />
                </div>
            </div>
        </section>
    );
}

