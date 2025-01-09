"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs } from "../ui/animated-tabs";
import { ArrowUpRight, MessageSquare, Dna, GitBranch, Database, Microscope } from "lucide-react";
import { BackgroundGradient } from "../ui/background-gradient";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";
import { RainbowButton } from "../ui/rainbow-button";
import { GradientBentoCard } from "../ui/gradient-bento-card";
import { Button } from "../ui/button";
import Link from "next/link";

export default function SideBySide() {
  const tabs = [
    {
      title: "Chromosome Visualization",
      value: "visualization",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden" animate={false}>
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="/media/image1.png"
              alt="Chitra Chromosome Visualization"
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
      title: "Multi-Species Comparison",
      value: "comparison",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="/media/image2.png"
              alt="Chitra Multi-Species Comparison"
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
      title: "Syntenic Relationships",
      value: "synteny",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="/media/image3.png"
              alt="Chitra Syntenic Relationships"
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
      title: "Interactive Analysis",
      value: "analysis",
      content: (
        <BackgroundGradient className="rounded-[22px] p-1 overflow-hidden">
          <div className="w-full overflow-hidden relative h-full rounded-[20px] bg-white/[0.7] dark:bg-black/[0.7] backdrop-blur-xl border border-white/[0.2] dark:border-white/[0.1]">
            <Image
              src="/media/image4.png"
              alt="Chitra Interactive Analysis"
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

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setActiveTabIndex((current) => (current + 1) % tabs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isClient, tabs.length]);

  if (!isClient) {
    return null;
  }

  return (
    <section className="container relative mx-auto px-4 py-24 overflow-hidden">
      <BackgroundBeamsWithCollision className="opacity-20" />
      
      <div className="relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4">
            Visualize Genomic Data with Precision
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your genomic data into interactive, publication-ready visualizations with Chitra's powerful rendering engine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
          <GradientBentoCard
            icon={<Dna className="w-5 h-5 text-indigo-500" />}
            title="Chromosome Visualization"
            description="Create stunning, interactive visualizations of chromosomal data with customizable layouts and styling options."
            className={`sm:col-span-1 sm:row-span-2 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-sky-500/10
              dark:from-indigo-400/10 dark:via-blue-400/10 dark:to-sky-400/10
              border border-indigo-500/20 dark:border-indigo-400/20
              backdrop-blur-md shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]
              hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.45)]
              transition-all duration-300`}
            gradient="linear-gradient(135deg, rgba(129,140,248,0.8), rgba(99,102,241,0.8), rgba(79,70,229,0.8))"
            size="default"
          />
          <GradientBentoCard
            icon={<GitBranch className="w-5 h-5 text-rose-500" />}
            title="Syntenic Relationships"
            description="Explore and visualize syntenic relationships between different species with intuitive, interactive displays."
            className={`sm:col-span-1 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-red-500/10
              dark:from-rose-400/10 dark:via-pink-400/10 dark:to-red-400/10
              border border-rose-500/20 dark:border-rose-400/20
              backdrop-blur-md shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]
              hover:shadow-[0_0_35px_-5px_rgba(244,63,94,0.45)]
              transition-all duration-300`}
            gradient="linear-gradient(135deg, rgba(251,113,133,0.8), rgba(244,63,94,0.8), rgba(225,29,72,0.8))"
            size="default"
          />
          <GradientBentoCard
            icon={<Database className="w-5 h-5 text-teal-500" />}
            title="Data Integration"
            description="Import and integrate various genomic data formats seamlessly for comprehensive visualization and analysis."
            className={`sm:col-span-1 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-green-500/10
              dark:from-teal-400/10 dark:via-emerald-400/10 dark:to-green-400/10
              border border-teal-500/20 dark:border-teal-400/20
              backdrop-blur-md shadow-[0_0_25px_-5px_rgba(20,184,166,0.3)]
              hover:shadow-[0_0_35px_-5px_rgba(20,184,166,0.45)]
              transition-all duration-300`}
            gradient="linear-gradient(135deg, rgba(45,212,191,0.8), rgba(20,184,166,0.8), rgba(13,148,136,0.8))"
            size="default"
          />
          <GradientBentoCard
            icon={<Microscope className="w-5 h-5 text-violet-500" />}
            title="Interactive Analysis"
            description="Perform dynamic analysis with real-time updates and interactive features for deeper insights into your genomic data."
            className={`sm:col-span-2 p-4 sm:p-6 h-full 
              bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10
              dark:from-violet-400/10 dark:via-purple-400/10 dark:to-fuchsia-400/10
              border border-violet-500/20 dark:border-violet-400/20
              backdrop-blur-md shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)]
              hover:shadow-[0_0_35px_-5px_rgba(139,92,246,0.45)]
              transition-all duration-300`}
            gradient="linear-gradient(135deg, rgba(167,139,250,0.8), rgba(139,92,246,0.8), rgba(124,58,237,0.8))"
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
