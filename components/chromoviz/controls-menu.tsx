"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2, Save,
  ArrowLeftRight, ArrowRight, ArrowLeft, MoreVertical, Image, Eye, X
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { SyntenyData, ChromosomeData } from "@/app/types"; // Adjusted path
import { MutationType, MUTATION_COLORS } from "@/components/chromoviz/synteny-ribbon"; // Assuming this is the correct path
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Palette, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlignmentFilterButton } from "@/components/chromoviz/alignment-filter-button";


const MutationTypeSelector = ({ 
  onSelect,
  currentType 
}: { 
  onSelect: (type: MutationType) => void;
  currentType?: MutationType;
}) => {
  // Mapping of mutation type abbreviations to full names
  const mutationFullNames: Record<string, string> = {
    SYN: "Synteny",
    DUP: "Duplication",
    INV: "Inversion",
    TRANS: "Translocation",
    INVTR: "Inverted Translocation",
    INVDP: "Inverted Duplication"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-7 gap-2",
            currentType && `border-${MUTATION_COLORS[currentType]}/50 text-${MUTATION_COLORS[currentType]}`
          )}
        >
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: currentType ? MUTATION_COLORS[currentType] : 'currentColor' }} 
          />
          {currentType ? mutationFullNames[currentType] || currentType : 'Set Mutation Type'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(MUTATION_COLORS).map(([type, color]) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onSelect(type as MutationType)}
            className="gap-2"
          >
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: color }} 
            />
            {mutationFullNames[type] || type}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ControlsMenuProps {
  alignmentFilter: 'all' | 'forward' | 'reverse';
  setAlignmentFilter: (filter: 'all' | 'forward' | 'reverse') => void;
  showAnnotations: boolean;
  setShowAnnotations: (show: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  handleSaveAsSVG: () => void;
  handleExportImage: (format: 'png' | 'jpg') => void;
  selectedSynteny: SyntenyData[];
  selectedMutationTypes: Map<string, MutationType>;
  onMutationTypeSelect: (syntenyId: string, mutationType: MutationType) => void;
  customSpeciesColors: Map<string, string>;
  onSpeciesColorChange: (species: string, color: string) => void;
  speciesData: ChromosomeData[]; // Assuming ChromosomeData contains species_name
  showConnectedOnly: boolean;
  setShowConnectedOnly: (show: boolean) => void;
  zoomLevel: number;
  onViewMutations: () => void;
  fullscreenContainerRef?: React.RefObject<HTMLDivElement>;
}

export const ControlsMenu = ({
  alignmentFilter,
  setAlignmentFilter,
  showAnnotations,
  setShowAnnotations,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  isFullscreen,
  handleSaveAsSVG,
  handleExportImage,
  selectedSynteny,
  selectedMutationTypes,
  onMutationTypeSelect,
  customSpeciesColors,
  onSpeciesColorChange,
  speciesData,
  showConnectedOnly,
  setShowConnectedOnly,
  zoomLevel,
  onViewMutations,
  fullscreenContainerRef,
}: ControlsMenuProps) => {
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showMutationPanel, setShowMutationPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  const desktopControls = (
    <>
      <div className="flex items-center gap-1.5">
        <Switch
          id="show-annotations"
          checked={showAnnotations}
          onCheckedChange={setShowAnnotations}
          className="h-4 w-7"
        />
        <Label htmlFor="show-annotations" className="text-xs">Annotations</Label>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConnectedOnly(!showConnectedOnly)}
        className="h-7 px-2"
        title="Show Connected Links Only"
      >
        <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: showConnectedOnly ? '#22c55e' : '#ef4444' }} />
        <span>Links</span>
      </Button>

      <div className="relative">
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setShowColorPanel(p => !p)}>
          <Palette className="h-4 w-4 mr-1" />
          <span>Colors</span>
        </Button>
        <AnimatePresence>
          {showColorPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 z-[99999]"
            >
              <Card className="w-56 bg-background/80 backdrop-blur-md border-border/50">
                <CardHeader className="p-2 border-b flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Species Colors</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowColorPanel(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-2 max-h-60 overflow-y-auto">
                  {Array.from(new Set(speciesData.map(d => d.species_name))).map(species => (
                    <div key={species} className="flex items-center justify-between gap-2 p-1 rounded hover:bg-accent">
                      <Label htmlFor={`color-${species}`} className="text-sm font-normal flex-1 truncate" title={species}>
                        {species.replace(/_/g, " ")}
                      </Label>
                      <input
                        id={`color-${species}`}
                        type="color"
                        value={customSpeciesColors.get(species) || '#000000'}
                        onChange={(e) => onSpeciesColorChange(species, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedSynteny.length > 0 && (
        <div className="relative">
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setShowMutationPanel(p => !p)}>
            <Palette className="h-4 w-4 mr-1" />
            <span>Mutations</span>
          </Button>
          <AnimatePresence>
            {showMutationPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 z-[99999]"
              >
                <Card className="w-96 bg-background/80 backdrop-blur-md border-border/50">
                  <CardHeader className="p-2 border-b flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Mutation Types</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowMutationPanel(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-2 max-h-[300px] overflow-y-auto">
                    {selectedSynteny.map(link => {
                      const syntenyId = `${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;
                      const currentType = selectedMutationTypes.get(syntenyId);
                      const refPos = link.ref_start >= 1000000 ? `${(link.ref_start / 1000000).toFixed(1)}Mb` : link.ref_start >= 1000 ? `${(link.ref_start / 1000).toFixed(1)}kb` : `${link.ref_start}bp`;
                      const queryPos = link.query_start >= 1000000 ? `${(link.query_start / 1000000).toFixed(1)}Mb` : link.query_start >= 1000 ? `${(link.query_start / 1000).toFixed(1)}kb` : `${link.query_start}bp`;
                      
                      return (
                        <div key={syntenyId} className="flex items-center gap-2 p-1 rounded hover:bg-accent">
                          <div className="flex-1">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1 text-xs font-medium">
                                  <div className="flex items-center gap-1 bg-blue-50 rounded-full px-1.5 py-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[8px] text-blue-700 uppercase tracking-wide">R</span>
                                  </div>
                                  {link.ref_chr}
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <div className="flex items-center gap-1 bg-purple-50 rounded-full px-1.5 py-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                    <span className="text-[8px] text-purple-700 uppercase tracking-wide">Q</span>
                                  </div>
                                  {link.query_chr}
                                </div>
                                <Badge variant="secondary" className="h-4 text-[10px] px-1 font-normal overflow-hidden flex-wrap">
                                  {link.query_name || 'Species 2'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="text-[10px] text-muted-foreground">
                                  {refPos} - {queryPos}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  ({link.query_strand === '+' ? 'Forward' : 'Reverse'})
                                </div>
                              </div>
                            </div>
                          </div>
                          <MutationTypeSelector
                            currentType={currentType}
                            onSelect={(type) => onMutationTypeSelect(syntenyId, type)}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {selectedMutationTypes.size > 0 && (
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={onViewMutations}>
          <Eye className="h-4 w-4 mr-1" />
          <span>View All</span>
        </Button>
      )}

      <div className="relative">
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowExportPanel(p => !p)}>
          <Image className="h-4 w-4 mr-1" />
          <span>Export</span>
        </Button>
        <AnimatePresence>
          {showExportPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 z-[99999]"
            >
              <Card className="w-40 bg-background/80 backdrop-blur-md border-border/50">
                <CardContent className="p-1">
                  <Button variant="ghost" className="w-full justify-start h-8" onClick={() => { handleSaveAsSVG(); setShowExportPanel(false); }}>
                    Save as SVG
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-8" onClick={() => { handleExportImage('png'); setShowExportPanel(false); }}>
                    Export as PNG
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-8" onClick={() => { handleExportImage('jpg'); setShowExportPanel(false); }}>
                    Export as JPG
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Badge variant="secondary" className="text-xs">
        {Math.round(zoomLevel * 100)}%
      </Badge>
    </>
  );

  return (
    <div className="flex items-center justify-between w-full gap-2 p-1 bg-background/10 backdrop-blur-md border-b border-border/20 flex-wrap">
      {/* Left Side: Alignment Filters */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <AlignmentFilterButton
          filter="all"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowLeftRight}
          label="All"
        />
        <AlignmentFilterButton
          filter="forward"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowRight}
          label="Forward"
        />
        <AlignmentFilterButton
          filter="reverse"
          currentFilter={alignmentFilter}
          onClick={setAlignmentFilter}
          icon={ArrowLeft}
          label="Reverse"
        />
      </div>

      {/* Right Side: Main Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 justify-end flex-wrap">
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
          {desktopControls}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-7 px-2">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-7 px-2">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onFullscreen} className="h-7 px-2">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuPortal container={isFullscreen && fullscreenContainerRef?.current ? fullscreenContainerRef.current : undefined}> */}
              <DropdownMenuContent
                align="end"
                className={cn(isFullscreen && "z-[60]")}
              >
                <DropdownMenuLabel>Controls</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="show-annotations-mobile">Annotations</Label>
                <Switch
                  id="show-annotations-mobile"
                  checked={showAnnotations}
                  onCheckedChange={setShowAnnotations}
                  className="h-4 w-7"
                />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowConnectedOnly(!showConnectedOnly)}>
                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: showConnectedOnly ? '#22c55e' : '#ef4444' }} />
                <span>Show Connected Links Only</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Colors</span>
                </DropdownMenuSubTrigger>
                {/* This DropdownMenuPortal is for the SubContent of the Colors SubMenu */}
                {/* <DropdownMenuPortal container={isFullscreen && fullscreenContainerRef?.current ? fullscreenContainerRef.current : undefined}> */}
                  <DropdownMenuSubContent
                    className={cn(
                      "w-56 max-h-60 overflow-y-auto",
                      isFullscreen && "z-[60]" // This z-index is now relative to the fullscreenContainerRef if portalled
                    )}
                  >
                    <DropdownMenuLabel>Customize Species Colors</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Array.from(new Set(speciesData.map(d => d.species_name))).map(species => (
                      <DropdownMenuItem key={species} onSelect={(e) => e.preventDefault()} className="flex items-center justify-between gap-2">
                        <Label htmlFor={`color-${species}-mobile`} className="text-sm font-normal flex-1 truncate" title={species}>
                          {species.replace(/_/g, " ")}
                        </Label>
                        <input
                          id={`color-${species}-mobile`}
                          type="color"
                          value={customSpeciesColors.get(species) || '#000000'}
                          onChange={(e) => onSpeciesColorChange(species, e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                {/* </DropdownMenuPortal> */}
              </DropdownMenuSub>
              {selectedSynteny.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Mutations</span>
                  </DropdownMenuSubTrigger>
                  {/* This DropdownMenuPortal is for the SubContent of the Mutations SubMenu */}
                  {/* <DropdownMenuPortal container={isFullscreen && fullscreenContainerRef?.current ? fullscreenContainerRef.current : undefined}> */}
                    <DropdownMenuSubContent
                      className={cn(
                        "w-96 max-h-[300px] overflow-y-auto",
                        isFullscreen && "z-[60]"
                      )}
                    >
                      <DropdownMenuLabel>Mutation Types</DropdownMenuLabel>
                      {selectedSynteny.map(link => {
                        const syntenyId = `${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;
                        const currentType = selectedMutationTypes.get(syntenyId);
                        const refPos = link.ref_start >= 1000000 ? `${(link.ref_start / 1000000).toFixed(1)}Mb` : link.ref_start >= 1000 ? `${(link.ref_start / 1000).toFixed(1)}kb` : `${link.ref_start}bp`;
                        const queryPos = link.query_start >= 1000000 ? `${(link.query_start / 1000000).toFixed(1)}Mb` : link.query_start >= 1000 ? `${(link.query_start / 1000).toFixed(1)}kb` : `${link.query_start}bp`;
                        
                        return (
                          <DropdownMenuItem
                            key={syntenyId}
                            className="flex items-center gap-2 py-2"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex-1">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <div className="flex items-center gap-1 text-xs font-medium">
                                    <div className="flex items-center gap-1 bg-blue-50 rounded-full px-1.5 py-0.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                      <span className="text-[8px] text-blue-700 uppercase tracking-wide">R</span>
                                    </div>
                                    {link.ref_chr}
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <div className="flex items-center gap-1 bg-purple-50 rounded-full px-1.5 py-0.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                      <span className="text-[8px] text-purple-700 uppercase tracking-wide">Q</span>
                                    </div>
                                    {link.query_chr}
                                  </div>
                                  <Badge variant="secondary" className="h-4 text-[10px] px-1 font-normal overflow-hidden flex-wrap">
                                    {link.query_name || 'Species 2'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <div className="text-[10px] text-muted-foreground">
                                    {refPos} - {queryPos}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    ({link.query_strand === '+' ? 'Forward' : 'Reverse'})
                                  </div>
                                </div>
                              </div>
                            </div>
                            <MutationTypeSelector
                              currentType={currentType}
                              onSelect={(type) => onMutationTypeSelect(syntenyId, type)}
                            />
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  {/* </DropdownMenuPortal> */}
                </DropdownMenuSub>
              )}
              {selectedMutationTypes.size > 0 && (
                <DropdownMenuItem onClick={onViewMutations}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View All Mutations</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Image className="mr-2 h-4 w-4" />
                  <span>Export</span>
                </DropdownMenuSubTrigger>
                {/* This DropdownMenuPortal is for the SubContent of the Export SubMenu */}
                {/* <DropdownMenuPortal container={isFullscreen && fullscreenContainerRef?.current ? fullscreenContainerRef.current : undefined}> */}
                  <DropdownMenuSubContent
                    className={cn(isFullscreen && "z-[60]")}
                  >
                    <DropdownMenuItem onClick={handleSaveAsSVG}>Save as SVG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportImage('png')}>Export as PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportImage('jpg')}>Export as JPG</DropdownMenuItem>
                  </DropdownMenuSubContent>
                {/* </DropdownMenuPortal> */}
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Zoom: {Math.round(zoomLevel * 100)}%
              </DropdownMenuItem>
              </DropdownMenuContent>
            {/* </DropdownMenuPortal> */}
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
