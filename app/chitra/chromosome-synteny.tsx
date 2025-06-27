"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, ArrowUp, ArrowDown, ArrowUpDown, ArrowLeftRight, ArrowRight, ArrowLeft, Settings2, MoreVertical, Image, Palette, ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { ChromosomeData, SyntenyData, ReferenceGenomeData, ChromosomeBreakpoint } from "../types";
import { cn } from "@/lib/utils";
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
import React, { ReactElement } from "react";
import { 
  CHROMOSOME_CONFIG,
  SYNTENY_COLORS,
  GENE_TYPE_COLORS,
  GENE_ANNOTATION_CONFIG,
  type GeneAnnotation,
  type GeneClass,
  OPTIMIZATION_CONFIG
} from "@/config/chromoviz.config";
// import { SettingsPanel } from "@/components/chromoviz/settings-panel"; // No longer needed
import { ChromosomeScrollbar } from "@/components/chromoviz/chromosome-scrollbar";
import { ControlsMenu } from "@/components/chromoviz/controls-menu";
import { MutationTypeDropdown } from "@/components/chromoviz/mutation-type-dropdown";
import { GeneTooltip } from "@/components/chromoviz/gene-tooltip";
import { MutationTypeDataDrawer } from "@/components/chromoviz/mutation-type-data-drawer";
import { MutationType, MUTATION_COLORS } from "@/components/chromoviz/synteny-ribbon";

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

interface SyntenyTooltipData {
  symbol: string;
  strand: '+' | '-';
  class: string;
  position: string;
  isCluster?: boolean;
  geneCount?: number;
  name?: string;
  locus_tag?: string;
  GeneID: string;
}

interface TooltipInfo {
  x: number;
  y: number;
  content: string | GeneTooltipData | ReactElement;
  isOpen: boolean;
  type?: 'gene' | 'synteny' | 'chromosome';
  data?: GeneTooltipData | ChromosomeData | SyntenyTooltipData;
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
  showTooltips: boolean;
  setShowTooltips: (show: boolean) => void;
  selectedMutationTypes: Map<string, MutationType>;
  onMutationTypeSelect: (syntenyId: string, mutationType?: MutationType) => void; // Allow undefined
  customSpeciesColors: Map<string, string>;
  onSpeciesColorChange: (species: string, color: string) => void;
  showConnectedOnly: boolean;
  setShowConnectedOnly: (show: boolean) => void;
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

// GeneTooltip component has been moved to components/chromoviz/gene-tooltip.tsx

// Add this interface for visualization settings
interface VisualConfig {
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

const ZOOM_LEVELS = {
  OVERVIEW: 0.5,    // Show all chromosomes
  CHROMOSOME: 1,    // Show individual chromosome details
  REGION: 2,        // Show gene clusters
  GENE: 3,          // Show individual genes
  SEQUENCE: 4       // Show sequence details
};

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
  showTooltips,
  setShowTooltips,
  selectedMutationTypes = new Map(),
  onMutationTypeSelect,
  customSpeciesColors,
  onSpeciesColorChange,
  showConnectedOnly,
  setShowConnectedOnly
}: ChromosomeSyntenyProps) {
  const [zoom, setZoom] = useState(1);
  const [isMutationDrawerOpen, setIsMutationDrawerOpen] = useState(false);
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

    // If there are selected reference chromosomes and showConnectedOnly is true, only show synteny for those
    if (selectedRefChrs.length > 0 && showConnectedOnly) {
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
  }, [syntenyData, selectedChromosomes, alignmentFilter, showConnectedOnly]);

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
    if (!showTooltips) return; // Early return if tooltips are disabled
    
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

    const margin = { 
      top: 20,
      right: 40,
      bottom: 120,
      left: 120 
    };
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

    // Modify the species color scale to use custom colors
    const speciesColorScale = d3.scaleOrdinal<string>()
      .domain(uniqueSpecies)
      .range(uniqueSpecies.map(species => 
        customSpeciesColors?.get(species) || d3.schemePastel1[uniqueSpecies.indexOf(species) % d3.schemePastel1.length]
      ));

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

      const syntenyId = `${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;
      const mutationType = selectedMutationTypes.get(syntenyId);
      
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
        mutationType,
        useCustomColors: Boolean(mutationType),
      });
    });

    // Update the chromosome hover events to target the correct elements
    g.selectAll("path.chromosome-body")
      .on("mouseover", (event) => {
        if (!showTooltips) return; // Early return if tooltips are disabled
        
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

    // Add single Breakpoint label if breakpoints exist
    if (referenceGenomeData?.breakpoints && referenceGenomeData.breakpoints.length > 0) {
      // Get reference species position (first species in the list)
      const referenceSpecies = syntenyData.length > 0 ? syntenyData[0].ref_species : '';
      const refSpeciesIndex = uniqueSpecies.indexOf(referenceSpecies);
      const refY = refSpeciesIndex * speciesSpacing + speciesSpacing;
      
      // Position the label just below the reference species (add a small offset)
      const labelY = refY + CHROMOSOME_CONFIG.HEIGHT + 20; // 20px offset
      
      // Add single "Breakpoint" label
      g.append("text")
        .attr("x", -10)  // Same x position as species labels
        .attr("y", labelY)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-family", "var(--font-geist-mono)")
        .attr("class", "text-muted-foreground")
        .attr("fill", "currentColor")
        .text("Breakpoint");
    }

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
    visualConfig,
    showTooltips,
    selectedMutationTypes,
    onMutationTypeSelect,
    customSpeciesColors,
    showConnectedOnly
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

  const optimizeChromosomeLayout = (chromosomes: ChromosomeData[]) => {
    // Group chromosomes by size ranges
    const sizeRanges = d3.groups(chromosomes, d => {
      const size = d.chr_size_bp;
      if (size > 1e8) return 'large';
      if (size > 1e7) return 'medium';
      return 'small';
    });

    // Arrange chromosomes in rows based on size
    return sizeRanges.map(([range, chrs]) => ({
      range,
      chromosomes: chrs,
      row: range === 'large' ? 0 : range === 'medium' ? 1 : 2
    }));
  };

  // Update detail level based on zoom
  useEffect(() => {
    const detailLevel = zoom < 1 ? 'overview' 
      : zoom < 2 ? 'chromosome'
      : zoom < 3 ? 'region'
      : zoom < 4 ? 'gene'
      : 'sequence';
    
    // Adjust rendering detail accordingly
  }, [zoom]);

  // Add this function to handle image export
  const handleExportImage = useCallback(async (format: 'png' | 'jpg') => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      const bbox = svgElement.getBBox();
      
      // Add padding (reduced top padding)
      const padding = {
        top: 30,
        right: 50,
        bottom: 50,
        left: 50
      };
      const totalWidth = bbox.width + (padding.left + padding.right);
      const totalHeight = bbox.height + (padding.top + padding.bottom) + 30;
      
      // Check dark mode once at the beginning
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Update clone dimensions with padding
      clone.setAttribute('width', `${totalWidth}`);
      clone.setAttribute('height', `${totalHeight}`);
      clone.setAttribute('viewBox', `${bbox.x - padding.left} ${bbox.y - padding.top} ${totalWidth} ${totalHeight}`);
      
      // Inline styles
      const styles = document.styleSheets;
      let stylesText = '';
      for (let i = 0; i < styles.length; i++) {
        try {
          const rules = styles[i].cssRules || styles[i].rules;
          for (let j = 0; j < rules.length; j++) {
            stylesText += rules[j].cssText + '\n';
          }
        } catch (e) {
          console.warn('Could not read styles', e);
        }
      }
      
      // Add styles with dark mode consideration
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        ${stylesText}
        ${isDarkMode ? `
          text, .text-foreground { 
            fill: #ffffff !important;
            color: #ffffff !important;
          }
          .text-muted-foreground {
            fill: #a1a1aa !important;
            color: #a1a1aa !important;
          }
        ` : ''}
      `;
      clone.insertBefore(styleElement, clone.firstChild);

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([
        '<?xml version="1.0" standalone="no"?>\r\n',
        svgData
      ], { type: 'image/svg+xml;charset=utf-8' });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      const scale2x = 2;
      canvas.width = totalWidth * scale2x;
      canvas.height = totalHeight * scale2x;
      
      // Use the same isDarkMode value for background
      ctx.fillStyle = isDarkMode ? '#020817' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const url = URL.createObjectURL(svgBlob);
      const img = document.createElement('img') as HTMLImageElement;
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.scale(scale2x, scale2x);
          ctx.drawImage(img, 0, 0, totalWidth, totalHeight);
          
          // Add credits with same isDarkMode value
          ctx.scale(0.5, 0.5);
          ctx.fillStyle = isDarkMode ? '#a1a1aa' : '#94a3b8';
          ctx.font = '24px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('© 2025 CHITRA', totalWidth * 2 - 20, totalHeight * 2 - 20);
          
          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const quality = format === 'png' ? 1 : 0.95;
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `chromoviz-full-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(downloadLink.href);
            URL.revokeObjectURL(url);
            resolve(true);
          }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  }, [svgRef]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative select-none"
      style={{
        overflow: isFullscreen ? 'visible' : 'auto',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div className={cn(
        "absolute inset-0 transition-opacity duration-200 pointer-events-none",
        isFullscreen ? "opacity-100" : "opacity-0"
      )} />

      <div className={cn(
        "relative w-full h-full z-30",
        isFullscreen && "bg-background"
      )}>
        {/* Header Controls */}
        <div className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-between gap-2 p-1",
          "border-b border-border/20",
          "bg-background/10 z-[55]"
        )}>
          <ControlsMenu
            alignmentFilter={alignmentFilter}
            setAlignmentFilter={setAlignmentFilter}
            showAnnotations={showAnnotations}
            setShowAnnotations={setShowAnnotations}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onReset={onReset}
            onFullscreen={onFullscreen}
            isFullscreen={isFullscreen}
            handleSaveAsSVG={handleSaveAsSVG}
            handleExportImage={handleExportImage}
            selectedSynteny={selectedSynteny}
            selectedMutationTypes={selectedMutationTypes}
            onMutationTypeSelect={onMutationTypeSelect}
            customSpeciesColors={customSpeciesColors}
            onSpeciesColorChange={onSpeciesColorChange}
            speciesData={referenceData}
            showConnectedOnly={showConnectedOnly}
            setShowConnectedOnly={setShowConnectedOnly}
            zoomLevel={zoom}
            onViewMutations={() => setIsMutationDrawerOpen(true)}
            fullscreenContainerRef={containerRef}
          />
        </div>

        <MutationTypeDataDrawer
          isOpen={isMutationDrawerOpen}
          onClose={() => setIsMutationDrawerOpen(false)}
          selectedSynteny={selectedSynteny}
          selectedMutationTypes={selectedMutationTypes}
        />

        {/* Main Content Area */}
        <div className="relative flex-1 h-full">
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
            
            <div className="absolute bottom-16 right-4 z-20 hidden md:block scale-90">
              <MiniMap
                mainSvgRef={svgRef}
                zoomBehaviorRef={zoomBehaviorRef}
                viewportRect={viewport}
                dimensions={dimensions}
                zoom={zoom}
                isFullscreen={isFullscreen}
              />
            </div>

            {showTooltips && (
              <>
                <Tooltip info={debouncedHoverInfo} />
                {hoveredGene && (
                  <GeneTooltip
                    gene={hoveredGene.gene}
                    x={hoveredGene.x}
                    y={hoveredGene.y}
                  />
                )}
              </>
            )}

            <div className="absolute left-4 bottom-16 z-20 hidden md:block scale-90">
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
                    "h-7 w-7 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
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
                    "h-7 w-7 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
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
                    "h-7 w-7 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
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
                    "h-7 w-7 transition-colors",
                    isPanningRef.current && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Add this component */}
        <ChromosomeScrollbar
          svgRef={svgRef}
          containerRef={containerRef}
          zoomBehaviorRef={zoomBehaviorRef}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
      {/* SettingsPanel removed as functionality is now in ControlsMenu */}
    </div>
  );
}
