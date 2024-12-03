"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2, Save, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle } from "lucide-react";
import { ChromosomeData, SyntenyData, ReferenceGenomeData } from "../types";
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
}

// Add biological constants
const CHROMOSOME_CONFIG = {
  HEIGHT: 24,
  SPACING: 15,
  TELOMERE_RADIUS: 12,
  CENTROMERE_WIDTH: 20,
  CENTROMERE_INDENT: 6,
} as const;

// Color configuration for biological meaning
const SYNTENY_COLORS = {
  FORWARD: '#2563eb1a', // Lighter blue with less opacity
  REVERSE: '#dc26261a', // Lighter red with less opacity
  BLOCK_FORWARD: '#2563eb',
  BLOCK_REVERSE: '#dc2626',
  STROKE_WIDTH: {
    SMALL: 1.5,  // For blocks > 10Mb
    MEDIUM: 2.5, // For blocks 5-10Mb
    LARGE: 3.5   // For blocks < 5Mb
  },
  OPACITY: {
    DEFAULT: 0.2,
    HOVER: 0.8,
    ACTIVE: 0.9
  }
} as const;

// First, add these constants near the top with other configurations
const GENE_TYPE_COLORS = {
  gene: '#4ade80',       // Green
  exon: '#2563eb',       // Blue
  CDS: '#f43f5e',        // Red
  pseudogene: '#a855f7'  // Purple
} as const;

// Add these constants near the top with other configurations
const GENE_ANNOTATION_CONFIG = {
  HEIGHT: 8,
  SPACING: 2,
  COLORS: {
    transcribed_pseudogene: '#94a3b8', // slate-400
    protein_coding: '#2563eb',         // blue-600
    pseudogene: '#dc2626',            // red-600
    ncRNA: '#16a34a',                 // green-600
    tRNA: '#8b5cf6',                  // violet-500
    rRNA: '#ec4899',                  // pink-500
    default: '#6b7280'                // gray-500
  }
} as const;

// Add this interface for gene annotations
interface GeneAnnotation {
  chromosome: string;
  genomicAccession: string;
  start: number;
  end: number;
  strand: '+' | '-';  // More specific than just string
  class: GeneClass;   // Use the specific gene classes
  locusTag?: string | null;
  symbol?: string | null;
  name?: string | null;
  geneId: string;
}

// Add this type to ensure proper color mapping
type GeneClass = keyof typeof GENE_ANNOTATION_CONFIG.COLORS;

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

  const filterSyntenyData = (data: SyntenyData[]) => {
    switch (alignmentFilter) {
      case 'forward':
        return data.filter(link => link.query_strand === '+');
      case 'reverse':
        return data.filter(link => link.query_strand === '-');
      default:
        return data;
    }
  };

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
      setDimensions({
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      });
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
        strand: link.query_strand, // Use query_strand from SyntenyData
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
        .attr("stroke-width", 3);
    }
  };

  const handleMouseOut = () => {
    handleElementLeave();
    
    // Reset visual states while respecting selection
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
        .attr("stroke-width", isSelected ? 3 : 2);
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

  // Add pan handlers
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const currentTransform = d3.zoomTransform(svgRef.current);
    const panAmount = 100; // Increased from 50 to 100 for larger movements
    
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
      .duration(300) // Increased from 200 to 300ms
      .ease(d3.easeCubicOut) // Added easing function for smoother motion
      .call(zoomBehaviorRef.current.transform, newTransform);
  }, [svgRef, zoomBehaviorRef]);

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
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

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

      // Draw chromosomes with conditional annotation rendering
      let xOffset = 0;
      speciesData.forEach((chr) => {
        const chrAnnotations = showAnnotations 
          ? referenceGenomeData?.geneAnnotations?.filter(
              gene => gene.chromosome === chr.chr_id
            ) || []
          : []; // Empty array when annotations are disabled

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
          annotations: chrAnnotations, // Pass filtered annotations
          showAnnotations // Pass the flag
        });
        
        xOffset += xScale(chr.chr_size_bp) + CHROMOSOME_CONFIG.SPACING * 2;
      });
    });

    // Modified ribbon drawing code
    const filteredSyntenyData = filterSyntenyData(syntenyData);
    filteredSyntenyData.forEach(link => {
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
    syntenyData, 
    dimensions, 
    alignmentFilter, 
    selectedSynteny, 
    onSyntenySelect,
    referenceGenomeData,
    showAnnotations
  ]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex flex-col",
        isFullscreen && "fixed inset-0 bg-background/95 backdrop-blur-sm z-50"
      )}
    >
      {/* Controls Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-4">
          {/* Alignment Filter Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={alignmentFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setAlignmentFilter('all')}
              className="text-xs h-8"
              size="sm"
            >
              All Alignments
            </Button>
            <Button
              variant={alignmentFilter === 'forward' ? 'default' : 'outline'}
              onClick={() => setAlignmentFilter('forward')}
              className="text-xs h-8"
              size="sm"
            >
              Forward Only
            </Button>
            <Button
              variant={alignmentFilter === 'reverse' ? 'default' : 'outline'}
              onClick={() => setAlignmentFilter('reverse')}
              className="text-xs h-8"
              size="sm"
            >
              Reverse Only
            </Button>
          </div>

          {/* Annotations Switch */}
          <div className="flex items-center gap-2">
            <Switch
              id="annotations-mode"
              checked={showAnnotations}
              onCheckedChange={setShowAnnotations}
            />
            <Label htmlFor="annotations-mode" className="text-sm">
              Show Annotations
            </Label>
          </div>

          <Badge variant="secondary">
            {Math.round(zoom * 100)}%
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsSVG}
            className="h-8 px-3 gap-2"
          >
            <Save className="h-4 w-4" />
            Save SVG
          </Button>
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

      {/* Main Content Area */}
      <div className="relative flex-1 min-h-0">
        <div className={cn(
          "w-full h-full",
          isFullscreen && "h-[calc(100vh-8rem)]"
        )}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox="0 0 1400 800"
            preserveAspectRatio="xMidYMid meet"
            className={cn(
              "w-full h-full",
              isFullscreen && "max-w-[95vw] max-h-[95vh]"
            )}
            style={{ 
              aspectRatio: '16/9'
            }}
          />
          
          <MiniMap
            mainSvgRef={svgRef}
            zoomBehaviorRef={zoomBehaviorRef}
            viewportRect={viewport}
            dimensions={dimensions}
            zoom={zoom}
            isFullscreen={isFullscreen}
          />

          <Tooltip info={debouncedHoverInfo} />

          {hoveredGene && (
            <GeneTooltip
              gene={hoveredGene.gene}
              x={hoveredGene.x}
              y={hoveredGene.y}
            />
          )}
        </div>

        {/* Add Pan Controls */}
        <div className="absolute left-4 bottom-4 z-10">
          <div className="inline-grid w-fit grid-cols-3 gap-1">
            <div></div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Pan camera up"
              onClick={() => handlePan('up')}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Pan camera left"
              onClick={() => handlePan('left')}
              className="h-8 w-8"
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
              onClick={() => handlePan('right')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Pan camera down"
              onClick={() => handlePan('down')}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}