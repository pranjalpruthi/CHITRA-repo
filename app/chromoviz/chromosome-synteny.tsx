"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2, Save, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, ArrowUp, ArrowDown, ArrowUpDown, ArrowLeftRight, ArrowRight, ArrowLeft, Settings2 } from "lucide-react";
import { ChromosomeData, SyntenyData, ReferenceGenomeData, ChromosomeBreakpoint } from "../types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { useEventListener } from "@/hooks/use-event-listener";
import { MiniMap } from "@/components/chromoviz/mini-map";
import { Tooltip } from "@/components/chromoviz/tooltip";
import { renderChromosome } from "@/components/chromoviz/chromosome-view";
import { renderSyntenyRibbon } from "@/components/chromoviz/synteny-ribbon";
import { 
  getChromosomeTooltip, 
  getGeneAnnotationTooltip, 
  getSyntenyTooltip,
  GeneTooltipData 
} from "@/components/chromoviz/tooltip";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from "react";
import { 
  CHROMOSOME_CONFIG,
  SYNTENY_COLORS,
  GENE_TYPE_COLORS,
  GENE_ANNOTATION_CONFIG,
  type GeneAnnotation,
  type GeneClass,
  OPTIMIZATION_CONFIG
} from "@/config/chromoviz.config";
import { SettingsPanel } from "@/components/chromoviz/settings-panel";

// First, add these type definitions at the top
type D3Selection = d3.Selection<SVGSVGElement, unknown, null, undefined>;
type D3Transition = d3.Transition<SVGSVGElement, unknown, null, undefined>;
type D3ZoomBehavior = d3.ZoomBehavior<SVGSVGElement, unknown>;

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TooltipInfo {
  x: number;
  y: number;
  content: string | GeneTooltipData | JSX.Element;
  isOpen: boolean;
  type?: 'gene' | 'synteny' | 'chromosome';
  data?: GeneTooltipData | ChromosomeData;
}

interface ChromosomeSyntenyProps {
  referenceData: ChromosomeData[];
  syntenyData: SyntenyData[];
  referenceGenomeData: ReferenceGenomeData | null;
  selectedSynteny: SyntenyData[];
  onSyntenySelect: (link: SyntenyData, isSelected: boolean) => void;
  width: number | string;
  height: number | string;
  alignmentFilter: 'all' | 'forward' | 'reverse';
  setAlignmentFilter: (filter: 'all' | 'forward' | 'reverse') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  svgRef: React.RefObject<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  zoomBehaviorRef: React.MutableRefObject<any>;
  showAnnotations: boolean;
  setShowAnnotations: (show: boolean) => void;
  selectedChromosomes: string[];
}

// Add this interface for gene annotations
interface GeneAnnotationProps {
  gene: GeneAnnotation;
  xScale: d3.ScaleLinear<number, number>;
  y: number;
  height: number;
  onMouseEnter: (event: React.MouseEvent, gene: GeneAnnotation) => void;
  onMouseLeave: () => void;
}

// Add this component for gene annotation tooltips
function GeneTooltip({ gene, x, y }: { gene: GeneAnnotation; x: number; y: number }) {
  return (
    <div
      className="absolute z-50 p-2 text-sm bg-background border rounded-lg shadow-lg"
      style={{
        left: x + 10,
        top: y - 10,
        maxWidth: '300px'
      }}
    >
      <div className="font-medium">{gene.symbol || gene.locusTag || 'Unknown gene'}</div>
      <div className="text-xs text-muted-foreground">
        <div>{gene.name}</div>
        <div>
          {gene.chromosome}:{gene.start.toLocaleString()}-{gene.end.toLocaleString()}
        </div>
        <div>Strand: {gene.strand}</div>
        <div>Type: {gene.class}</div>
      </div>
    </div>
  );
}

const AlignmentFilterButton = ({ 
  filter, 
  currentFilter, 
  onClick, 
  icon: Icon, 
  label,
  iconOnly = false
}: { 
  filter: 'all' | 'forward' | 'reverse';
  currentFilter: 'all' | 'forward' | 'reverse';
  onClick: (filter: 'all' | 'forward' | 'reverse') => void;
  icon: any;
  label: string;
  iconOnly?: boolean;
}) => {
  return (
    <button
      onClick={() => onClick(filter)}
      className={cn(
        'group relative inline-flex h-8 items-center justify-center overflow-hidden rounded-md',
        'bg-background border transition-all duration-200',
        filter === currentFilter 
          ? 'border-primary text-primary' 
          : 'border-border hover:border-primary/50 text-muted-foreground',
        iconOnly 
          ? 'w-8' 
          : filter === currentFilter 
            ? 'w-24' 
            : 'w-8 hover:w-24'
      )}
    >
      {!iconOnly && (
        <div className={cn(
          'inline-flex whitespace-nowrap transition-all duration-200',
          filter === currentFilter ? '-translate-x-2 opacity-100' : 'opacity-0 group-hover:-translate-x-2 group-hover:opacity-100'
        )}>
          {label}
        </div>
      )}
      <div className={cn(
        "transition-all duration-200",
        iconOnly ? "static" : "absolute right-2"
      )}>
        <Icon className="h-4 w-4" />
      </div>
    </button>
  );
};

// Add this interface for visualization settings
interface VisualizationConfig {
  chromosomeHeight: number;
  chromosomeSpacing: number;
  annotationHeight: number;
  annotationSpacing: number;
  maxTracks: number;
  minVisibleSize: number;
  maxVisibleGenes: number;
  clusteringThreshold: number;
  showAnnotations: boolean;
  geneColors: {
    forward: string;
    reverse: string;
  };
}

// Add to the renderChromosome function parameters
interface RenderChromosomeParams {
  // ... existing params ...
  breakpoints?: ChromosomeBreakpoint[];
}

export function ChromosomeSynteny({
  referenceData,
  syntenyData,
  referenceGenomeData,
  selectedSynteny,
  onSyntenySelect,
  width,
  height,
  alignmentFilter,
  setAlignmentFilter,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  isFullscreen,
  svgRef,
  containerRef,
  zoomBehaviorRef,
  showAnnotations,
  setShowAnnotations,
  selectedChromosomes,
}: ChromosomeSyntenyProps) {
  const [zoom, setZoom] = useState(1);
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
  const [debouncedHoverInfo] = useDebounce(tooltipInfo, 50); // Debounce hover info updates
  const [viewport, setViewport] = useState<Dimensions>({
    x: 0,
    y: 0,
    width: typeof width === 'string' ? parseInt(width) : width,
    height: typeof height === 'string' ? parseInt(height) : height
  });
  const [dimensions, setDimensions] = useState<Dimensions>({
    x: 0,
    y: 0,
    width: typeof width === 'string' ? parseInt(width) : width,
    height: typeof height === 'string' ? parseInt(height) : height
  });
  const [hoveredGene, setHoveredGene] = useState<{
    gene: GeneAnnotation;
    x: number;
    y: number;
  } | null>(null);

  // Add ref for tracking current transform
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Add these refs for handling continuous pan
  const panIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPanningRef = useRef(false);

  // Add state for visualization config
  const [visualConfig, setVisualConfig] = useState({
    chromosomeHeight: CHROMOSOME_CONFIG.HEIGHT,
    chromosomeSpacing: CHROMOSOME_CONFIG.SPACING,
    annotationHeight: GENE_ANNOTATION_CONFIG.HEIGHT,
    annotationSpacing: GENE_ANNOTATION_CONFIG.SPACING,
    maxTracks: GENE_ANNOTATION_CONFIG.MAX_TRACKS,
    minVisibleSize: OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE,
    maxVisibleGenes: OPTIMIZATION_CONFIG.MAX_VISIBLE_GENES,
    clusteringThreshold: OPTIMIZATION_CONFIG.CLUSTERING_THRESHOLD,
    showAnnotations: true,
    geneColors: {
      forward: GENE_ANNOTATION_CONFIG.COLORS.FORWARD,
      reverse: GENE_ANNOTATION_CONFIG.COLORS.REVERSE,
    },
  });

  const handleConfigChange = useCallback((newConfig: Partial<typeof visualConfig>) => {
    setVisualConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  const filterSyntenyData = (data: SyntenyData[]) => {
    // First filter by selected chromosomes
    let filteredData = data;
    
    // Get the selected reference chromosomes (without the 'ref:' prefix)
    const selectedRefChrs = selectedChromosomes
      .filter(chr => chr.startsWith('ref:'))
      .map(chr => chr.replace('ref:', ''));

    // If there are selected reference chromosomes, only show synteny for those
    if (selectedRefChrs.length > 0) {
      filteredData = filteredData.filter(link => 
        selectedRefChrs.includes(link.ref_chr)
      );
    }

    // Then apply strand filter
    switch (alignmentFilter) {
      case 'forward':
        return filteredData.filter(link => link.query_strand === '+');
      case 'reverse':
        return filteredData.filter(link => link.query_strand === '-');
      default:
        return filteredData;
    }
  };

  // Filter synteny data before rendering
  const filteredSyntenyData = React.useMemo(() => {
    return filterSyntenyData(syntenyData);
  }, [syntenyData, selectedChromosomes, alignmentFilter]);

  const handleFullscreenChange = useCallback(() => {
    const isFullscreenNow = Boolean(document.fullscreenElement);
    
    if (isFullscreenNow && containerRef.current) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const aspectRatio = viewport.width / viewport.height;
      let newWidth = screenWidth;
      let newHeight = screenWidth / aspectRatio;
      
      if (newHeight > screenHeight) {
        newHeight = screenHeight;
        newWidth = screenHeight * aspectRatio;
      }
      
      setDimensions({
        x: 0,
        y: 0,
        width: newWidth,
        height: newHeight
      });
    } else {
      // Reset to container dimensions when exiting fullscreen
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height
        });
      }
    }
  }, [viewport, containerRef]);

  const handleResize = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    
    const selection = svg as D3Selection;
    
    if (currentTransformRef.current && zoomBehaviorRef.current) {
      zoomBehaviorRef.current.transform(
        selection,
        currentTransformRef.current
      );
    }
  }, [svgRef, containerRef, zoomBehaviorRef]);

  useEventListener('fullscreenchange' as keyof WindowEventMap, handleFullscreenChange);
  useEventListener('resize', handleResize);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const updateViewportRect = (transform: d3.ZoomTransform) => {
    const scale = transform.k;
    const x = -transform.x / scale;
    const y = -transform.y / scale;
    const viewWidth = dimensions.width / scale;
    const viewHeight = dimensions.height / scale;

    setViewport({
      x,
      y,
      width: viewWidth,
      height: viewHeight
    });
  };

  const handleElementHover = (event: any, content: string | { type: string; data: GeneTooltipData }) => {
    if (typeof content === 'string') {
      setTooltipInfo({
        x: event.clientX,
        y: event.clientY,
        content,
        isOpen: true
      });
    } else if (content.type === 'gene') {
      setTooltipInfo({
        x: event.clientX,
        y: event.clientY,
        content: content.data,
        isOpen: true,
        type: 'gene',
        data: content.data
      });
    } else {
      setTooltipInfo({
        x: event.clientX,
        y: event.clientY,
        content: content.data,
        isOpen: true
      });
    }
  };

  const handleElementLeave = () => {
    setTooltipInfo(prev => prev ? { ...prev, isOpen: false } : null);
  };

  const handleElementMove = (event: any) => {
    if (tooltipInfo) {
      setTooltipInfo(prev => ({
        ...prev!,
        x: event.clientX,
        y: event.clientY,
      }));
    }
  };

  const handleMouseOver = (event: any, link: SyntenyData) => {
    setTooltipInfo({
      x: event.clientX,
      y: event.clientY,
      content: getSyntenyTooltip(link),
      isOpen: true,
      type: 'synteny',
      data: {
        symbol: link.symbol,
        strand: link.query_strand,
        class: link.class,
        position: link.position,
        isCluster: link.isCluster,
        geneCount: link.geneCount,
        name: link.name,
        locus_tag: link.locus_tag,
        GeneID: link.GeneID
      }
    });
    
    const svg = d3.select(svgRef.current);
    const isSelected = selectedSynteny.some(s => 
      s.ref_chr === link.ref_chr && 
      s.query_chr === link.query_chr && 
      s.ref_start === link.ref_start
    );
    
    // Only apply hover effects if not selected
    if (!isSelected) {
      svg.selectAll(`.synteny-ribbon[data-synteny-id="${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}"]`)
        .attr("opacity", SYNTENY_COLORS.OPACITY.HOVER)
        .raise();

      svg.selectAll(`.matching-block[data-synteny-id="${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}"]`)
        .attr("opacity", 1)
        .attr("stroke-width", 1);
    }
  };

  const handleMouseOut = () => {
    handleElementLeave();
    
    const svg = d3.select(svgRef.current);
    
    // Reset ribbons based on selection state
    svg.selectAll(".synteny-ribbon").each(function() {
      const ribbon = d3.select(this);
      const isSelected = ribbon.classed("selected");
      ribbon.attr("opacity", isSelected ? 
        SYNTENY_COLORS.OPACITY.ACTIVE : 
        SYNTENY_COLORS.OPACITY.DEFAULT
      );
    });
    
    // Reset blocks based on selection state
    svg.selectAll(".matching-block").each(function() {
      const block = d3.select(this);
      const isSelected = block.classed("selected");
      block.attr("opacity", isSelected ? 1 : 0.8)
        .attr("stroke-width", isSelected ? 1 : 0.5);
    });
  };

  // Modified selection handler
  const handleSyntenySelection = (link: SyntenyData, isSelected: boolean) => {
    // Store current transform before selection change
    if (svgRef.current && zoomBehaviorRef.current) {
      currentTransformRef.current = d3.zoomTransform(svgRef.current);
    }

    // Call the prop function instead of trying to set state directly
    onSyntenySelect(link, isSelected);

    // Restore transform after selection update
    requestAnimationFrame(() => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(0)
          .call(zoomBehaviorRef.current.transform, currentTransformRef.current);
      }
    });
  };

  // Add this function to handle gene hover events
  const handleGeneHover = (event: React.MouseEvent, gene: GeneAnnotation) => {
    setHoveredGene({
      gene,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleSaveAsSVG = useCallback(() => {
    if (!svgRef.current) return;

    // Get SVG content
    const svgElement = svgRef.current;
    
    // Create a clone of the SVG to modify for export
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Set the background color to match the current theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    clone.style.backgroundColor = isDarkMode ? '#020817' : '#ffffff';
    
    // Ensure viewBox is set correctly
    const bbox = svgElement.getBBox();
    clone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    
    // Add any missing style elements
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .chromosome-body { stroke: ${isDarkMode ? '#ffffff' : '#000000'}; }
      .chromosome-label { fill: ${isDarkMode ? '#ffffff' : '#000000'}; }
      text { fill: ${isDarkMode ? '#ffffff' : '#000000'}; }
    `;
    clone.insertBefore(styleSheet, clone.firstChild);
    
    const svgContent = new XMLSerializer().serializeToString(clone);
    
    // Add XML declaration and SVG namespace
    const svgBlob = new Blob([
      '<?xml version="1.0" standalone="no"?>\r\n',
      svgContent
    ], { type: 'image/svg+xml;charset=utf-8' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = `chromoviz-overview-${new Date().toISOString().split('T')[0]}.svg`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(downloadLink.href);
  }, [svgRef]);

  // Modify the handlePan function to support continuous movement
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const currentTransform = d3.zoomTransform(svgRef.current);
    const panAmount = 50; // Reduced for smoother continuous movement
    
    let newX = currentTransform.x;
    let newY = currentTransform.y;
    
    switch (direction) {
      case 'up':
        newY += panAmount;
        break;
      case 'down':
        newY -= panAmount;
        break;
      case 'left':
        newX += panAmount;
        break;
      case 'right':
        newX -= panAmount;
        break;
    }

    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(currentTransform.k);

    d3.select(svgRef.current)
      .transition()
      .duration(100) // Reduced for smoother continuous movement
      .ease(d3.easeLinear) // Changed to linear for continuous movement
      .call(zoomBehaviorRef.current.transform, newTransform);
  }, [svgRef, zoomBehaviorRef]);

  // Add these handlers for continuous pan
  const startContinuousPan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (isPanningRef.current) return;
    
    isPanningRef.current = true;
    handlePan(direction);
    
    panIntervalRef.current = setInterval(() => {
      handlePan(direction);
    }, 50); // Adjust interval for smooth movement
  }, [handlePan]);

  const stopContinuousPan = useCallback(() => {
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }
    isPanningRef.current = false;
  }, []);

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          handlePan('up');
          break;
        case 'ArrowDown':
          handlePan('down');
          break;
        case 'ArrowLeft':
          handlePan('left');
          break;
        case 'ArrowRight':
          handlePan('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePan]);

  useEffect(() => {
    const handleResize = () => {
      if (!svgRef.current) return;

      const containerWidth = containerRef.current?.offsetWidth || 800;
      const containerHeight = containerRef.current?.offsetHeight || 600;

      setDimensions({
        x: 0,
        y: 0,
        width: containerWidth,
        height: containerHeight
      });

      // Update the SVG viewBox to match the new dimensions
      d3.select(svgRef.current)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set dimensions

    return () => window.removeEventListener('resize', handleResize);
  }, [svgRef, containerRef]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 60, right: 40, bottom: 60, left: 120 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by species
    const speciesGroups = d3.group(referenceData, d => d.species_name);
    const uniqueSpecies = Array.from(speciesGroups.keys());

    // Calculate layout parameters
    const speciesSpacing = innerHeight / (uniqueSpecies.length + 1);
    const chromosomeHeight = 20;
    const chromosomeSpacing = 10;

    // Create color scale for ribbons
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Calculate max chromosome size for scaling
    const maxChrSize = d3.max(referenceData, d => d.chr_size_bp) || 0;
    const xScale = d3.scaleLinear()
      .domain([0, maxChrSize])
      .range([0, innerWidth - 100]); // Leave space for labels

    // Add new color scales for species and chromosomes
    const speciesColorScale = d3.scaleOrdinal(d3.schemeSet3);
    const chromosomeColorScale = d3.scaleLinear<string>()
      .domain([0, 1])
      .range(['#e2e8f0', '#94a3b8']); // Light to darker shade for chromosomes

    // Get reference species from synteny data
    const referenceSpecies = syntenyData.length > 0 ? syntenyData[0].ref_species : '';

    // Draw chromosomes for each species
    uniqueSpecies.forEach((species, speciesIndex) => {
      const speciesColor = speciesColorScale(species);
      const speciesData = referenceData.filter(d => d.species_name === species);
      const y = speciesIndex * speciesSpacing + speciesSpacing;

      // Species label
      g.append("text")
        .attr("x", -10)
        .attr("y", y + CHROMOSOME_CONFIG.HEIGHT/2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "14px")
        .attr("font-family", "var(--font-geist-mono)")
        .attr("class", "text-foreground")
        .attr("fill", "currentColor")
        .text(species.replace("_", " "));

      let xOffset = 0;
      speciesData.forEach((chr) => {
        renderChromosome({
          chromosome: chr,
          xOffset,
          y,
          xScale,
          speciesColor,
          onHover: handleElementHover,
          onMove: handleElementMove,
          onLeave: handleElementLeave,
          container: g,
          annotations: referenceGenomeData?.geneAnnotations,
          showAnnotations,
          breakpoints: referenceGenomeData?.breakpoints,
          config: visualConfig,
          isReferenceChromosome: species === referenceSpecies,
        });
        
        xOffset += xScale(chr.chr_size_bp) + CHROMOSOME_CONFIG.SPACING * 2;
      });
    });

    // Use filtered synteny data
    const filteredData = filteredSyntenyData.filter(link => {
      const refChr = `ref:${link.ref_chr}`;
      const queryChr = `${link.query_name}:${link.query_chr}`;
      
      // If no chromosomes are selected, show all
      if (selectedChromosomes.length === 0) return true;
      
      // Only show ribbons between selected chromosomes
      return selectedChromosomes.includes(refChr) && 
             selectedChromosomes.includes(queryChr);
    });

    // Sort filtered data by block size (largest to smallest)
    const sortedData = filteredData.sort((a, b) => {
      const sizeA = (a.ref_end - a.ref_start) * (a.query_end - a.query_start);
      const sizeB = (b.ref_end - b.ref_start) * (b.query_end - b.query_start);
      return sizeB - sizeA; // Render largest blocks first (they'll be at the bottom)
    });

    // Render filtered ribbons in sorted order
    sortedData.forEach(link => {
      const sourceSpecies = link.ref_species;
      const targetSpecies = link.query_name;
      
      if (!sourceSpecies || !targetSpecies) return;

      const sourceIndex = uniqueSpecies.indexOf(sourceSpecies);
      const targetIndex = uniqueSpecies.indexOf(targetSpecies);
      
      if (sourceIndex === -1 || targetIndex === -1) return;

      const sourceY = sourceIndex * speciesSpacing + speciesSpacing;
      const targetY = targetIndex * speciesSpacing + speciesSpacing;

      renderSyntenyRibbon({
        link,
        sourceSpecies,
        targetSpecies,
        sourceY,
        targetY,
        xScale,
        speciesColorScale,
        referenceData,
        container: g,
        onHover: handleMouseOver,
        onMove: handleElementMove,
        onLeave: handleMouseOut,
        chromosomeSpacing,
        chromosomeHeight: CHROMOSOME_CONFIG.HEIGHT,
        isSelected: selectedSynteny.some(s => 
          s.ref_chr === link.ref_chr && 
          s.query_chr === link.query_chr && 
          s.ref_start === link.ref_start
        ),
        onSelect: onSyntenySelect,
        zoomBehaviorRef,
        selectedChromosomes,
      });
    });

    // Update the chromosome hover events to target the correct elements
    g.selectAll("path.chromosome-body")
      .on("mouseover", (event) => {
        const chr = referenceData.find(c => 
          c.chr_id === event.target.dataset.chr && 
          c.species_name === event.target.dataset.species
        );
        if (chr) {
          setTooltipInfo({
            x: event.clientX,
            y: event.clientY,
            content: getChromosomeTooltip(chr),
            isOpen: true,
            type: 'chromosome',
            data: chr
          });
        }
      })
      .on("mousemove", handleElementMove)
      .on("mouseout", handleElementLeave);

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const g = svg.select("g");
        // Convert the transform object to a string representation
        g.attr("transform", `translate(${event.transform.x}, ${event.transform.y}) scale(${event.transform.k})`);
        setZoom(event.transform.k);
        updateViewportRect(event.transform);
        currentTransformRef.current = event.transform;
      });

    // Safe assignment to mutable ref
    zoomBehaviorRef.current = zoomBehavior;

    // Type assertion for svg.call()
    svg.call(zoomBehavior as any);

    // Add proper typing for the chromosome zoom behavior
    const chromosomeZoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 20])
      .on("zoom", (event) => {
        const transform = event.transform;
        g.selectAll(".chromosome-body")
          .attr("transform", `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
        g.selectAll(".synteny-ribbon")
          .attr("transform", `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
      });

    // Add zoom controls
    const zoomControls = svg.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

    // Update zoom slider with proper typing
    const zoomSlider = zoomControls.append("input")
      .attr("type", "range")
      .attr("min", "1")
      .attr("max", "20")
      .attr("step", "0.1")
      .attr("value", "1")
      .style("width", "100px")
      .on("input", function(this: HTMLInputElement) {
        const scale = parseFloat(this.value);
        // Create a new transform with the desired scale
        const transform = d3.zoomIdentity.scale(scale);
        
        // Apply the transform to the main container
        g.attr("transform", `translate(0,0) scale(${scale})`);
        
        // Update other elements if needed
        g.selectAll(".chromosome-body, .synteny-ribbon")
          .attr("transform", `scale(${scale})`);
      });

  }, [
    referenceData, 
    filteredSyntenyData, 
    dimensions, 
    alignmentFilter, 
    selectedSynteny, 
    onSyntenySelect,
    referenceGenomeData,
    showAnnotations,
    selectedChromosomes,
    visualConfig
  ]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      // Update dimensions based on fullscreen state
      if (document.fullscreenElement) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        const aspectRatio = viewport.width / viewport.height;
        let newWidth = screenWidth;
        let newHeight = screenWidth / aspectRatio;
        
        if (newHeight > screenHeight) {
          newHeight = screenHeight;
          newWidth = screenHeight * aspectRatio;
        }
        
        setDimensions({
          x: 0,
          y: 0,
          width: newWidth,
          height: newHeight
        });
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewport, containerRef]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      <div className={cn(
        "absolute inset-0 transition-opacity duration-200",
        isFullscreen ? "opacity-100 backdrop-blur-md" : "opacity-0"
      )} />

      <div className={cn(
        "relative w-full h-full z-10",
        isFullscreen && "bg-background"
      )}>
        {/* Header Controls */}
        <div className={cn(
          "absolute top-0 left-0 right-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border/20",
          "bg-background/10 backdrop-blur-md z-10"
        )}>
          {/* Left Side Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            {/* Alignment Filter Buttons */}
            <div className="flex items-center gap-1.5">
              <AlignmentFilterButton
                filter="all"
                currentFilter={alignmentFilter}
                onClick={setAlignmentFilter}
                icon={ArrowLeftRight}
                label="All"
                iconOnly={true}
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

            {/* Bottom Controls Row */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <Switch
                  id="annotations-mode"
                  checked={showAnnotations}
                  onCheckedChange={setShowAnnotations}
                  className="scale-75"
                />
                <Label htmlFor="annotations-mode" className="text-xs text-muted-foreground whitespace-nowrap">
                  Annotations
                </Label>
              </div>

              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {Math.round(zoom * 100)}%
              </Badge>
            </div>
          </div>
          
          {/* Right Side Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative">
              <SettingsPanel
                config={visualConfig}
                onConfigChange={handleConfigChange as any}
                isOpen={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAsSVG}
              className="h-8 w-8 p-0"
              title="Save as SVG"
            >
              <Save className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomOut}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 h-[calc(100%)]">
          <div className="w-full h-full">
            <svg
              ref={svgRef}
              className={cn(
                "w-full h-full",
                isFullscreen && "w-screen h-screen"
              )}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
            />
            
            <div className="absolute bottom-20 right-4 z-20">
              <MiniMap
                mainSvgRef={svgRef}
                zoomBehaviorRef={zoomBehaviorRef}
                viewportRect={viewport}
                dimensions={dimensions}
                zoom={zoom}
                isFullscreen={isFullscreen}
              />
            </div>

            <Tooltip info={debouncedHoverInfo} />

            {hoveredGene && (
              <GeneTooltip
                gene={hoveredGene.gene}
                x={hoveredGene.x}
                y={hoveredGene.y}
              />
            )}

            <div className="absolute left-4 bottom-20 z-20">
              <div className="inline-grid w-fit grid-cols-3 gap-1">
                <div></div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Pan camera up"
                  onMouseDown={() => startContinuousPan('up')}
                  onMouseUp={stopContinuousPan}
                  onMouseLeave={stopContinuousPan}
                  onTouchStart={() => startContinuousPan('up')}
                  onTouchEnd={stopContinuousPan}
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Pan camera left"
                  onMouseDown={() => startContinuousPan('left')}
                  onMouseUp={stopContinuousPan}
                  onMouseLeave={stopContinuousPan}
                  onTouchStart={() => startContinuousPan('left')}
                  onTouchEnd={stopContinuousPan}
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center">
                  <Circle className="h-4 w-4 opacity-60" />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Pan camera right"
                  onMouseDown={() => startContinuousPan('right')}
                  onMouseUp={stopContinuousPan}
                  onMouseLeave={stopContinuousPan}
                  onTouchStart={() => startContinuousPan('right')}
                  onTouchEnd={stopContinuousPan}
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Pan camera down"
                  onMouseDown={() => startContinuousPan('down')}
                  onMouseUp={stopContinuousPan}
                  onMouseLeave={stopContinuousPan}
                  onTouchStart={() => startContinuousPan('down')}
                  onTouchEnd={stopContinuousPan}
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}