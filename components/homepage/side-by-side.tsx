"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs } from "../ui/animated-tabs";
import { ArrowUpRight, MessageSquare, Dna, GitBranch, Database, Microscope } from "lucide-react";
import { BackgroundGradient } from "../ui/background-gradient";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";
import ShineBorder from "../ui/shine-border";
import { RainbowButton } from "../ui/rainbow-button";
import { GradientBentoCard } from "../ui/gradient-bento-card";
import { Button } from "../ui/button";
import Link from "next/link";

export default function SideBySide() {
  const tabs = [
    {
      title: "Synteny Analysis",
      value: "synteny",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
              alt="Chitra Synteny Analysis"
              width={1200}
              height={800}
              className="object-cover w-full h-full rounded-[18px]"
              priority
            />
          </div>
        </BackgroundGradient>
      ),
    },
    {
      title: "Breakpoint Detection",
      value: "breakpoints",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
              alt="Chitra Breakpoint Detection"
              width={1200}
              height={800}
              className="object-cover w-full h-full rounded-[18px]"
              priority
            />
          </div>
        </BackgroundGradient>
      ),
    },
    {
      title: "Gene Annotation",
      value: "annotation",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
              alt="Chitra Gene Annotation"
              width={1200}
              height={800}
              className="object-cover w-full h-full rounded-[18px]"
              priority
            />
          </div>
        </BackgroundGradient>
      ),
    },
    {
      title: "Multi-Species Analysis",
      value: "multi-species",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
              alt="Chitra Multi-Species Analysis"
              width={1200}
              height={800}
              className="object-cover w-full h-full rounded-[18px]"
              priority
            />
          </div>
        </BackgroundGradient>
      ),
    },
  ];

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTabIndex((current) => (current + 1) % tabs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [tabs.length]);

  return (
    <section className="container relative mx-auto px-4 py-24 overflow-hidden">
      <BackgroundBeamsWithCollision className="opacity-20" />
      
      <div className="relative">
        <div className="text-center mb-12">
          
          
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4">
            Chitra: Interactive Chromosome Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Advanced visualization and analysis of synteny data, breakpoints, and gene annotations across multiple species.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
          <GradientBentoCard
            icon={<Dna className="w-5 h-5" />}
            title="Synteny Analysis"
            description="Visualize and analyze syntenic relationships between chromosomes across different species with our interactive visualization tools."
            className={`sm:col-span-1 sm:row-span-2 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-blue-500/10 to-blue-600/10 
              dark:from-blue-400/10 dark:to-blue-500/10 
              border border-blue-500/20 dark:border-blue-400/20
              backdrop-blur-md`}
            size="default"
          />
          <GradientBentoCard
            icon={<GitBranch className="w-5 h-5" />}
            title="Breakpoint Detection"
            description="Identify chromosomal breakpoints and structural variations with precision using our advanced detection algorithms."
            className={`sm:col-span-1 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-purple-500/10 to-purple-600/10 
              dark:from-purple-400/10 dark:to-purple-500/10 
              border border-purple-500/20 dark:border-purple-400/20
              backdrop-blur-md`}
            size="default"
          />
          <GradientBentoCard
            icon={<Database className="w-5 h-5" />}
            title="Gene Annotation"
            description="Comprehensive gene annotation tools for detailed genomic analysis and interpretation."
            className={`sm:col-span-1 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 
              dark:from-emerald-400/10 dark:to-emerald-500/10 
              border border-emerald-500/20 dark:border-emerald-400/20
              backdrop-blur-md`}
            size="default"
          />
          <GradientBentoCard
            icon={<Microscope className="w-5 h-5" />}
            title="Multi-Species Analysis"
            description="Compare genomic features across multiple species simultaneously with advanced comparative analysis tools."
            className={`sm:col-span-2 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-pink-500/10 to-pink-600/10 
              dark:from-pink-400/10 dark:to-pink-500/10 
              border border-pink-500/20 dark:border-pink-400/20
              backdrop-blur-md`}
            size="default"
          />
        </div>

        <div className="h-[600px] [perspective:1000px] relative flex flex-col max-w-6xl mx-auto w-full items-center justify-start">
          <Tabs 
            tabs={tabs}
            containerClassName="mb-8 justify-center"
            activeTabClassName="bg-white/[0.9] dark:bg-zinc-800/[0.9] shadow-lg backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]"
            tabClassName="font-medium px-6 py-3"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
          <Link href="/docs">
            <div className="relative overflow-hidden rounded-full dark:bg-zinc-900 bg-white shadow border dark:border-zinc-800 group border-zinc-400 p-0.5">
              <span className="absolute inset-[-1000%] animate-[spin_5s_linear_infinite_reverse] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#09090B_7%)] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#fff_5%)] group-hover:bg-none" />
              <Button
                variant="outline"
                className="h-12 px-8 rounded-full font-medium backdrop-blur-xl 
                    bg-zinc-50 dark:bg-zinc-900 
                    text-zinc-800 dark:text-zinc-200
                    border-0"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" />
                  View Documentation
                </span>
              </Button>
            </div>
          </Link>
          
          <RainbowButton className="w-full sm:w-auto">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Share Feedback
            </span>
          </RainbowButton>
        </div>
      </div>
    </section>
  );
}
