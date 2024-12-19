'use client'

import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  FileText,
  RefreshCw,
  BookOpen,
  TableProperties,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
  MessageCircle,
  MessageCircleOff,
  RotateCcw,
  X,
  Upload,
  Home,
  GripVertical,
  LayoutGrid,
  LayoutPanelTop,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AiButton from "@/components/animata/button/ai-button";
import { Separator } from "@/components/ui/separator";
import { FilterDrawer } from '@/components/chromoviz/filter-drawer';
import { GuideSheet } from "@/components/chromoviz/guide";
import { FileUploaderGroup } from '@/components/chromoviz/file-uploader';
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";
import { DataViewerDrawer } from "./data-viewer-drawer";
import { cn } from "@/lib/utils";
import { ChromosomeData, SyntenyData } from "@/app/types";

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
  showTooltips: boolean;
  onToggleTooltips: () => void;
  onResetToWelcome: () => void;
  speciesData?: ChromosomeData[];
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
  onToggleFullScreen = () => {},
  showTooltips,
  onToggleTooltips,
  onResetToWelcome,
  speciesData,
}: FloatingHUDBarProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isVertical, setIsVertical] = useState(false);
  const [forceVertical, setForceVertical] = useState(false);

  // Check position relative to window edge
  useEffect(() => {
    const unsubscribeX = x.onChange((latest) => {
      const windowWidth = window.innerWidth;
      if (!forceVertical) {
        setIsVertical(latest > windowWidth - 100);
      }
    });

    return () => {
      unsubscribeX();
    };
  }, [x, forceVertical]);

  // Update isVertical when forceVertical changes
  useEffect(() => {
    setIsVertical(forceVertical);
  }, [forceVertical]);

  const toggleLayout = () => {
    setForceVertical(!forceVertical);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05 }}
      style={{ x, y }}
      className="fixed bottom-4 sm:bottom-8 inset-x-0 mx-auto w-fit z-50 cursor-grab active:cursor-grabbing"
    >
      <div className="relative">
        <div className={cn(
          "absolute inset-0 blur-2xl rounded-2xl",
          isVertical 
            ? "bg-gradient-to-b from-blue-500/20 to-purple-500/20" 
            : "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20"
        )} />
        <div className={cn(
          "absolute inset-0 blur-xl rounded-2xl opacity-50",
          isVertical 
            ? "bg-gradient-to-t from-blue-400/10 to-purple-400/10" 
            : "bg-gradient-to-l from-blue-400/10 via-indigo-400/10 to-purple-400/10"
        )} />
        
        <div className={cn(
          "relative bg-white/80 dark:bg-black/40 backdrop-blur-md border-[1.5px] border-indigo-200/50 dark:border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300",
          "ring-2 ring-blue-500/30 dark:ring-blue-600/30",
          isVertical 
            ? "px-2 py-3" 
            : "px-2 sm:px-4 py-1.5 sm:py-2"
        )}>
          <div className={cn(
            "flex items-center gap-1 sm:gap-2 [&>*]:!text-gray-700 dark:[&>*]:!text-white [&_svg]:!stroke-gray-600 dark:[&_svg]:!stroke-white",
            isVertical ? "flex-col" : "flex-row justify-center"
          )}>
            {/* Reset/Go Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetToWelcome}
              className={cn(
                "transition-colors group",
                isVertical 
                  ? "h-8 w-8 p-0" 
                  : "h-8 px-2 text-xs font-medium",
                referenceGenomeData 
                  ? "bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 [&_svg]:stroke-red-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 [&_svg]:stroke-gray-500"
              )}
            >
              {referenceGenomeData ? (
                <RotateCcw className="h-3.5 w-3.5" />
              ) : (
                <Home className="h-3.5 w-3.5" />
              )}
              {!isVertical && (
                <span className="hidden sm:inline ml-1.5">
                  {referenceGenomeData ? "Go Back" : "Main"}
                </span>
              )}
            </Button>

            {/* Upload Button */}
            <FileUploaderGroup onDataLoad={onDataLoad}>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors group [&_svg]:stroke-blue-500",
                  isVertical 
                    ? "h-8 w-8 p-0" 
                    : "h-8 px-2 text-xs font-medium"
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                {!isVertical && <span className="hidden sm:inline ml-1.5">Upload</span>}
              </Button>
            </FileUploaderGroup>

            {/* Generate Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onGenerateVisualization}
              disabled={!canGenerateVisualization || isLoading}
              className={cn(
                "hover:bg-white/10 hover:text-white transition-colors group",
                isVertical 
                  ? "h-8 w-8 p-0" 
                  : "h-8 px-2 text-xs"
              )}
            >
              {isLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin group-hover:text-blue-400" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 group-hover:text-blue-400" />
              )}
              {!isVertical && !isLoading && (
                <span className="hidden sm:inline ml-1.5">Generate</span>
              )}
            </Button>

            {/* Example Files Button */}
            <ExampleFilesDrawer onLoadExample={onLoadExample}>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "hover:bg-white/10 hover:text-white transition-colors group",
                  isVertical 
                    ? "h-8 w-8 p-0" 
                    : "h-8 px-2 text-xs"
                )}
              >
                <FileText className="h-3.5 w-3.5 group-hover:text-blue-400" />
                {!isVertical && <span className="hidden sm:inline ml-1.5">Examples</span>}
              </Button>
            </ExampleFilesDrawer>

            {/* Filter Button */}
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
                className={cn(
                  "bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/30 transition-colors group [&_svg]:stroke-purple-500",
                  isVertical 
                    ? "h-8 w-8 p-0" 
                    : "h-8 px-2 text-xs font-medium"
                )}
              >
                <TableProperties className="h-3.5 w-3.5" />
                {!isVertical && <span className="hidden sm:inline ml-1.5">Filter</span>}
              </Button>
            </FilterDrawer>

            {/* Separator */}
            {!isVertical && (
              <Separator orientation="vertical" className="h-6 mx-1 bg-white/20 hidden sm:block" />
            )}

            {/* Tooltip Toggle Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleTooltips}
              className={cn(
                "transition-colors group",
                isVertical 
                  ? "h-8 w-8 p-0" 
                  : "h-8 px-2 text-xs font-medium",
                showTooltips 
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 [&_svg]:stroke-emerald-500"
                  : "bg-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/30 [&_svg]:stroke-gray-500"
              )}
            >
              {showTooltips ? (
                <MessageCircle className="h-3.5 w-3.5" />
              ) : (
                <MessageCircleOff className="h-3.5 w-3.5" />
              )}
              {!isVertical && (
                <span className="hidden sm:inline ml-1.5">
                  {showTooltips ? "Hide Tips" : "Show Tips"}
                </span>
              )}
            </Button>

            {/* Guide Button */}
            <GuideSheet>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "hover:bg-white/10 hover:text-white transition-colors group",
                  isVertical 
                    ? "h-8 w-8 p-0" 
                    : "h-8 px-2 text-xs"
                )}
              >
                <BookOpen className="h-3.5 w-3.5 group-hover:text-blue-400" />
                {!isVertical && <span className="hidden sm:inline ml-1.5">Guide</span>}
              </Button>
            </GuideSheet>

            {/* View Data Button */}
            <DataViewerDrawer
              syntenyData={syntenyData as SyntenyData[]} 
              speciesData={speciesData}
              referenceData={referenceGenomeData}
              isVertical={isVertical}
            >
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition-colors group [&_svg]:stroke-amber-500",
                  isVertical 
                    ? "h-8 w-8 p-0" 
                    : "h-8 px-2 text-xs font-medium"
                )}
              >
                <Database className="h-3.5 w-3.5" />
                {!isVertical && <span className="hidden sm:inline ml-1.5">View Data</span>}
              </Button>
            </DataViewerDrawer>

            {/* Layout Toggle Button - Add before Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLayout}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                isVertical ? "h-8 w-8" : "h-8 w-8",
                forceVertical && "bg-accent/50"
              )}
            >
              {isVertical ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <LayoutPanelTop className="h-4 w-4" />
              )}
            </Button>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullScreen}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground",
                isVertical ? "h-8 w-8" : "h-8 w-8"
              )}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Drag Handle */}
            <div className={cn(
              "flex items-center cursor-grab active:cursor-grabbing",
              isVertical ? "pt-1" : "pl-1 pr-0.5"
            )}>
              <GripVertical className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
