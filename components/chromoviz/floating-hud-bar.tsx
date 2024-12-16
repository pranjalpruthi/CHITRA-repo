'use client'

import { motion } from "framer-motion";
import React, { useState } from "react";
import { 
  ArrowRight, 
  FileText,
  RefreshCw,
  BookOpen,
  TableProperties,
  Pin,
  PinOff,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AiButton from "@/components/animata/button/ai-button";
import { Separator } from "@/components/ui/separator";
import { FilterDrawer } from '@/components/chromoviz/filter-drawer';
import { GuideSheet } from "@/components/chromoviz/guide";
import { FileUploaderGroup } from '@/components/chromoviz/file-uploader';
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";
import { cn } from "@/lib/utils";

interface FloatingHUDBarProps {
  onGenerateVisualization: () => void;
  onLoadExample: (path: string) => void;
  canGenerateVisualization: boolean;
  isLoading: boolean;
  selectedSpecies: string[];
  setSelectedSpecies: (species: string[]) => void;
  selectedChromosomes: string[];
  setSelectedChromosomes: (chromosomes: string[]) => void;
  speciesOptions: { label: string; value: string; }[];
  chromosomeOptions: { [species: string]: { label: string; value: string; species: string; }[] };
  referenceGenomeData: any;
  syntenyData?: {
    ref_chr: string;
    query_chr: string;
    query_name: string;
  }[];
  onDataLoad: {
    synteny: (data: any) => void;
    species: (data: any) => void;
    reference: (data: any) => void;
    annotations: (data: any) => void;
  };
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export function FloatingHUDBar({
  onGenerateVisualization,
  onLoadExample,
  canGenerateVisualization,
  isLoading,
  selectedSpecies,
  setSelectedSpecies,
  selectedChromosomes,
  setSelectedChromosomes,
  speciesOptions,
  chromosomeOptions,
  referenceGenomeData,
  syntenyData,
  onDataLoad,
  isFullScreen = false,
  onToggleFullScreen = () => {}
}: FloatingHUDBarProps) {
  const [isPinned, setIsPinned] = useState(true);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      drag={!isPinned}
      dragMomentum={false}
      dragElastic={0.1}
      whileHover={{ scale: isPinned ? 1 : 1.02 }}
      whileDrag={{ scale: 1.05 }}
      className={cn(
        "fixed mx-auto w-fit z-50",
        isPinned 
          ? "bottom-4 sm:bottom-8 inset-x-0"
          : "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-300/30 dark:bg-blue-500/30 blur-2xl rounded-2xl" />
        <div className="absolute inset-0 bg-blue-300/20 dark:bg-blue-400/20 blur-xl rounded-2xl" />
        
        <div className="relative bg-white/90 dark:bg-black/50 backdrop-blur-md border-[1.5px] border-indigo-200 dark:border-white/20 rounded-2xl px-2 sm:px-4 py-1.5 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPinned(!isPinned)}
            className="absolute -top-3 -right-3 h-6 w-6 p-0.5 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
          >
            {isPinned ? (
              <Pin className="h-3.5 w-3.5 text-blue-500" />
            ) : (
              <PinOff className="h-3.5 w-3.5 text-gray-500" />
            )}
          </Button>

          <div className="flex items-center justify-center gap-1 sm:gap-2 [&>*]:!text-gray-700 dark:[&>*]:!text-white [&_svg]:!stroke-gray-600 dark:[&_svg]:!stroke-white">
            {/* 1. Upload Button */}
            <FileUploaderGroup onDataLoad={onDataLoad} />

            {/* 2. Generate Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onGenerateVisualization}
              disabled={!canGenerateVisualization || isLoading}
              className="h-8 px-2 text-xs hover:bg-white/10 hover:text-white transition-colors group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin group-hover:text-blue-400" />
                  <span className="hidden sm:inline ml-1.5">Gen...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:text-blue-400" />
                  <span className="hidden sm:inline ml-1.5">Generate</span>
                </>
              )}
            </Button>

            {/* 3. Example Files Button */}
            <ExampleFilesDrawer onLoadExample={onLoadExample}>
              <AiButton 
                variant="simple"
                className="h-8 px-2 text-xs hover:bg-white/10 hover:text-white transition-colors group"
              >
                <FileText className="h-3.5 w-3.5 group-hover:text-blue-400" />
                <span className="hidden sm:inline ml-1.5">Quick Demos</span>
              </AiButton>
            </ExampleFilesDrawer>

            {/* 4. Filter Button */}
            <FilterDrawer
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              selectedChromosomes={selectedChromosomes}
              setSelectedChromosomes={setSelectedChromosomes}
              speciesOptions={speciesOptions}
              chromosomeOptions={chromosomeOptions}
              referenceGenomeData={referenceGenomeData}
              syntenyData={syntenyData}
              isLoading={isLoading}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs hover:bg-white/10 hover:text-white transition-colors group"
              >
                <TableProperties className="h-3.5 w-3.5 group-hover:text-blue-400" />
                <span className="hidden sm:inline ml-1.5">Filter</span>
              </Button>
            </FilterDrawer>

            {/* Separator */}
            <Separator orientation="vertical" className="h-6 mx-1 bg-white/20 hidden sm:block" />

            {/* 5. Guide Button */}
            <GuideSheet>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs hover:bg-white/10 hover:text-white transition-colors group"
              >
                <BookOpen className="h-3.5 w-3.5 group-hover:text-blue-400" />
                <span className="hidden sm:inline ml-1.5">Guide</span>
              </Button>
            </GuideSheet>

            {/* 6. Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullScreen}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
