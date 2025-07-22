'use client'

import { motion, useMotionValue } from "motion/react";
import React, { useState, useEffect } from "react";
import {
  FileText,
  Table as TableIcon,
  TableProperties,
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
  Database,
  Moon,
  Sun,
  User as UserIcon,
  FileSpreadsheet,
  ChevronRight,


} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilterDrawer } from '@/components/chromoviz/filter-drawer';
import { UserActions } from './user-actions';
import { FileUploaderGroup } from '@/components/chromoviz/file-uploader';
import { ExampleFilesDrawer } from "@/components/chromoviz/example-files-drawer";
import { DataViewerDrawer } from "./data-viewer-drawer";
import { cn } from "@/lib/utils";
import { ChromosomeData, SyntenyData } from "@/app/types";
import { useTheme } from "next-themes";
import { User } from "@supabase/supabase-js";

interface FloatingHUDBarProps {
  user: User | null;
  onLoadExample: (path: string) => void;
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
  onShare: (title: string, isPublic: boolean) => Promise<string | null>;
  isDetailViewOpen: boolean;
  onToggleDetailView: () => void;
  selectedSynteny: SyntenyData[];
  onToggleSelection: (link: SyntenyData) => void;
  onSelectBlock?: (link: SyntenyData) => void;
  currentBlockIndex?: number;
  onExport?: (data: SyntenyData[]) => void;
}

export function FloatingHUDBar({
  user,
  onLoadExample,
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
  onToggleFullScreen = () => { },
  showTooltips,
  onToggleTooltips,
  onResetToWelcome,
  speciesData,
  onShare, // Added onShare
  isDetailViewOpen,
  onToggleDetailView,
  selectedSynteny,
  onToggleSelection,
  onSelectBlock,
  currentBlockIndex = 0,
  onExport,
}: FloatingHUDBarProps) {

  function downloadCSV(data: SyntenyData[], filename: string) {
    const headers = [
      'Reference Species',
      'Reference Chromosome',
      'Reference Start (Mb)',
      'Reference End (Mb)',
      'Query Species',
      'Query Chromosome',
      'Query Start (Mb)',
      'Query End (Mb)',
      'Size (Mb)',
      'Orientation'
    ]

    const rows = data.map(link => [
      link.ref_species,
      link.ref_chr,
      (link.ref_start / 1_000_000).toFixed(2),
      (link.ref_end / 1_000_000).toFixed(2),
      link.query_name,
      link.query_chr,
      (link.query_start / 1_000_000).toFixed(2),
      (link.query_end / 1_000_000).toFixed(2),
      ((link.ref_end - link.ref_start) / 1_000_000).toFixed(2),
      link.query_strand === '+' ? 'Forward' : 'Reverse'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isVertical, setIsVertical] = useState(false);
  const [forceVertical, setForceVertical] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    toast.success("You have been signed out.");
  };

  // Check position relative to window edge
  useEffect(() => {
    const unsubscribeX = x.on("change", (latest) => {
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
      className={cn(
        "fixed bottom-4 sm:bottom-8 inset-x-0 mx-auto w-fit cursor-grab active:cursor-grabbing",
        isFullScreen ? "z-[51]" : "z-50" // Ensure HUD is on top in fullscreen
      )}
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
            {/* User Profile / Sign In Button */}
            <div className="relative">
              <UserActions user={user} onSignOut={handleSignOut} onShare={onShare} isVertical={isVertical} />
            </div>

            {!isVertical && <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />}

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
            <FileUploaderGroup onDataLoad={onDataLoad} user={user}>
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

            {/* Example Files Button */}
            <ExampleFilesDrawer onLoadExample={onLoadExample}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 transition-colors group [&_svg]:stroke-yellow-500",
                  isVertical
                    ? "h-8 w-8 p-0"
                    : "h-8 px-2 text-xs"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
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

            {/* Selected Blocks Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "transition-colors group relative",
                    isVertical
                      ? "h-8 w-8 p-0"
                      : "h-8 px-2 text-xs font-medium",
                    selectedSynteny.length > 0
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 [&_svg]:stroke-blue-500"
                      : "bg-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/30 [&_svg]:stroke-gray-500"
                  )}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  {!isVertical && <span className="hidden sm:inline ml-1.5">Selected</span>}
                  {selectedSynteny.length > 0 && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center rounded-full bg-blue-600 text-white">
                      {selectedSynteny.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-[520px] h-[420px] p-0 bg-white/20 dark:bg-black/20 backdrop-blur-2xl rounded-2xl border-0 shadow-2xl ring-1 ring-white/20 dark:ring-white/10"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-white/10 dark:border-white/5 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <TableIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">Selected Blocks</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedSynteny.length} synteny block{selectedSynteny.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                      </div>
                      {selectedSynteny.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-medium bg-red-50/50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-600"
                            onClick={() => {
                              // Clear all selected blocks
                              selectedSynteny.forEach(link => onToggleSelection(link));
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-2" />
                            Clear All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-medium bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                            onClick={() => {
                              if (onExport) {
                                onExport(selectedSynteny)
                              } else {
                                downloadCSV(
                                  selectedSynteny,
                                  `synteny-blocks-${new Date().toISOString().split('T')[0]}.csv`
                                )
                              }
                            }}
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-auto p-3 space-y-2">
                    {selectedSynteny.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-8">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <TableIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No blocks selected</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click on synteny ribbons to select blocks</p>
                        </div>
                      </div>
                    ) : (
                      selectedSynteny.map((link, index) => (
                        <motion.div
                          key={`${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.ref_end}-${index}`}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          <Card
                            className={cn(
                              "relative group transition-all duration-200",
                              "cursor-pointer",
                              // Base colors based on orientation - removed hover elevation
                              link.query_strand === '+'
                                ? "bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/40 dark:border-blue-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:border-blue-300/60 dark:hover:border-blue-600/60"
                                : "bg-red-50/30 dark:bg-red-950/20 border-red-200/40 dark:border-red-800/40 hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:border-red-300/60 dark:hover:border-red-600/60",
                              // Selected state
                              index === currentBlockIndex && [
                                link.query_strand === '+'
                                  ? "ring-2 ring-blue-500/50 dark:ring-blue-400/50 bg-blue-100/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500"
                                  : "ring-2 ring-red-500/50 dark:ring-red-400/50 bg-red-100/70 dark:bg-red-950/40 border-red-400 dark:border-red-500"
                              ]
                            )}
                            onClick={() => onSelectBlock?.(link)}
                          >
                            <CardContent className="p-3">
                              {/* Remove button */}
                              <div className="absolute -top-1 -right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelection(link);
                                  }}
                                  className="h-6 w-6 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Main content */}
                              <div className="space-y-2">
                                {/* Species and chromosome info */}
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                                    {link.ref_species} {link.ref_chr}
                                  </span>
                                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                                    {link.query_name} {link.query_chr}
                                  </span>
                                </div>

                                {/* Position and size info */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Position:</span>
                                      <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                                        {(link.ref_start / 1_000_000).toFixed(1)}-{(link.ref_end / 1_000_000).toFixed(1)} Mb
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">Size:</span>
                                      <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                                        {((link.ref_end - link.ref_start) / 1_000_000).toFixed(1)} Mb
                                      </span>
                                    </div>
                                  </div>

                                  {/* Orientation badge */}
                                  <Badge variant="secondary" className={cn(
                                    "px-2 py-1 font-semibold text-xs cursor-default",
                                    link.query_strand === '+'
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                                  )}>
                                    {link.query_strand === '+' ? 'Forward ➜' : 'Reverse ⟲'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Chord View Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetailView}
              className={cn(
                "transition-colors group",
                isVertical
                  ? "h-8 w-8 p-0"
                  : "h-8 px-2 text-xs font-medium",
                isDetailViewOpen
                  ? "bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 [&_svg]:stroke-green-500"
                  : "bg-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/30 [&_svg]:stroke-gray-500"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {!isVertical && (
                <span className="hidden sm:inline ml-1.5">
                  {isDetailViewOpen ? "Hide Chord View" : "Show Chord View"}
                </span>
              )}
            </Button>



            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "transition-colors group",
                isVertical
                  ? "h-8 w-8 p-0"
                  : "h-8 w-8 p-0",
                "hover:bg-white/10 hover:text-white"
              )}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 group-hover:text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 group-hover:text-blue-400" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Layout Toggle Button */}
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
                "hover:bg-accent hover:text-accent-foreground bg-blue-500/20 text-blue-600 dark:text-blue-400",
                isVertical ? "h-8 w-8 p-0" : "h-8 px-3 text-xs font-medium min-w-[120px]"
              )}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  {!isVertical && <span className="hidden sm:inline ml-1.5">Exit Full View</span>}
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  {!isVertical && <span className="hidden sm:inline ml-1.5">Full Screen</span>}
                </>
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
