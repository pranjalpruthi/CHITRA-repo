"use client";

import * as d3 from "d3";
import { ChromosomeBreakpoint, ChromosomeData, GeneAnnotation, SyntenyData } from "@/app/types";
import { GeneTooltipData } from "./tooltip";
import { 
  CHROMOSOME_CONFIG,
  GENE_ANNOTATION_CONFIG,
  OPTIMIZATION_CONFIG,
  UI_CONFIG
} from "@/config/chromoviz.config";

interface ChromosomeViewProps {
  chromosome: ChromosomeData;
  xOffset: number;
  y: number;
  xScale: d3.ScaleLinear<number, number>;
  speciesColor: string;
  onHover: (event: any, content: string | { type: string; data: GeneTooltipData }) => void;
  onMove: (event: any) => void;
  onLeave: () => void;
  container: d3.Selection<any, unknown, null, undefined>;
  annotations?: GeneAnnotation[];
  showAnnotations?: boolean;
  config?: {
    chromosomeHeight: number;
    chromosomeSpacing: number;
    minVisibleSize: number;
  };
  breakpoints?: ChromosomeBreakpoint[];
  isReferenceChromosome?: boolean;
}

function formatGenomicPosition(position: number): string {
  if (position >= 1_000_000_000) {
    return `${(position / 1_000_000_000).toFixed(2)} Gb`;
  }
  if (position >= 1_000_000) {
    return `${(position / 1_000_000).toFixed(2)} Mb`;
  }
  if (position >= 1_000) {
    return `${(position / 1_000).toFixed(2)} kb`;
  }
  return `${position} bp`;
}

// Update getGeneTooltip to return a string or object based on need
function getGeneTooltip(data: ChromosomeData | GeneAnnotation): GeneTooltipData {
  if ('chr_id' in data) {
    // Handle chromosome data
    return {
      symbol: data.chr_id,
      strand: '+', // Default value for chromosomes
      class: 'chromosome',
      position: `${(data.chr_size_bp / 1_000_000).toFixed(2)} Mb`,
      isCluster: false,
      geneCount: undefined,
      name: data.species_name,
      locus_tag: undefined,
      GeneID: data.chr_id
    };
  }
  
  // Handle gene data
  return {
    symbol: data.symbol || 'Unknown Gene',
    strand: data.strand,
    class: data.class,
    position: `${(data.start / 1_000_000).toFixed(2)}-${(data.end / 1_000_000).toFixed(2)}`,
    isCluster: (data as any).isCluster,
    geneCount: (data as any).geneCount,
    name: data.name,
    locus_tag: data.locus_tag,
    GeneID: data.GeneID
  };
}

// Add this helper function to determine if a point is within a synteny block
function isPointInBlock(point: { x: number; y: number }, block: {
  x: number;
  y: number;
  width: number;
  height: number;
}): boolean {
  return point.x >= block.x &&
         point.x <= block.x + block.width &&
         point.y >= block.y &&
         point.y <= block.y + block.height;
}

// Add this to store block metadata for hover detection
interface SyntenyBlockMetadata {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: SyntenyData;
  size: number; // for z-index calculation
}

interface BreakpointMarkerConfig {
  trackSpacing: number;
  connectorStrokeWidth: number;
  trackHeight: number;
  triangleSize: number;
  dashArray: string;
  colors: {
    connector: string;
    track: string;
    triangle: string;
  };
}

const BREAKPOINT_CONFIG: BreakpointMarkerConfig = {
  trackSpacing: 2,
  connectorStrokeWidth: 0.5,
  trackHeight: 8,
  triangleSize: 2,
  dashArray: "2,2",
  colors: {
    connector: "#ef4444",
    track: "#fee2e2",
    triangle: "#991b1b"
  }
};

export function renderChromosome({
  chromosome: chr,
  xOffset,
  y,
  xScale,
  speciesColor,
  onHover,
  onMove,
  onLeave,
  container,
  config = {
    chromosomeHeight: CHROMOSOME_CONFIG.HEIGHT,
    chromosomeSpacing: CHROMOSOME_CONFIG.SPACING,
    minVisibleSize: OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE,
  },
  breakpoints = [],
  isReferenceChromosome = false,
}: ChromosomeViewProps) {
  const chrWidth = xScale(chr.chr_size_bp);
  const chrPath = d3.path();
  const roundedEnd = config.chromosomeHeight / 2;
  const centromereWidth = config.chromosomeHeight * 0.8;
  const centromereIndent = config.chromosomeHeight * 0.2;

  // Draw chromosome path
  chrPath.moveTo(xOffset + roundedEnd, y);
  
  if (chr.centromere_start && chr.centromere_end) {
    const centromereStart = xOffset + xScale(chr.centromere_start);
    const centromereEnd = xOffset + xScale(chr.centromere_end);
    const centromereMiddle = (centromereStart + centromereEnd) / 2;
    
    chrPath.lineTo(centromereStart, y);
    chrPath.lineTo(centromereMiddle - centromereWidth/2, y + centromereIndent);
    chrPath.lineTo(centromereMiddle + centromereWidth/2, y + centromereIndent);
    chrPath.lineTo(centromereEnd, y);
  }
  
  chrPath.lineTo(xOffset + chrWidth - roundedEnd, y);
  chrPath.arc(
    xOffset + chrWidth - roundedEnd,
    y + roundedEnd,
    roundedEnd,
    -Math.PI/2,
    Math.PI/2
  );
  
  if (chr.centromere_start && chr.centromere_end) {
    const centromereStart = xOffset + xScale(chr.centromere_start);
    const centromereEnd = xOffset + xScale(chr.centromere_end);
    const centromereMiddle = (centromereStart + centromereEnd) / 2;
    
    chrPath.lineTo(centromereEnd, y + config.chromosomeHeight);
    chrPath.lineTo(centromereMiddle + centromereWidth/2, y + config.chromosomeHeight - centromereIndent);
    chrPath.lineTo(centromereMiddle - centromereWidth/2, y + config.chromosomeHeight - centromereIndent);
    chrPath.lineTo(centromereStart, y + config.chromosomeHeight);
  }
  
  chrPath.arc(
    xOffset + roundedEnd,
    y + roundedEnd,
    roundedEnd,
    Math.PI/2,
    -Math.PI/2
  );
  
  chrPath.closePath();

  // Create a group for the chromosome
  const chromosomeGroup = container.append("g");

  // Add the main chromosome body
  const body = chromosomeGroup.append("path")
    .attr("d", chrPath.toString())
    .attr("class", "chromosome-body")
    .attr("data-chr", chr.chr_id)
    .attr("data-species", chr.species_name)
    .attr("fill", speciesColor)
    .attr("stroke", d3.color(speciesColor)?.darker(0.5)?.toString() ?? speciesColor)
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .style("transition", "opacity 0.2s ease-in-out");

  if (body && 'on' in body) {
    (body as d3.Selection<any, unknown, null, undefined>)
      .on("click", (e) => onHover(e, {
        type: 'chromosome',
        data: getGeneTooltip(chr)
      }))
      .on("mousemove", onMove)
      .on("mouseleave", onLeave);
  }

  // Add centromere if present
  if (chr.centromere_start && chr.centromere_end) {
    const centromereStart = xOffset + xScale(chr.centromere_start);
    const centromereEnd = xOffset + xScale(chr.centromere_end);
    const centromereMiddle = (centromereStart + centromereEnd) / 2;

    chromosomeGroup.append("path")
      .attr("d", `M ${centromereStart} ${y} 
          L ${centromereMiddle - centromereWidth/2} ${y + centromereIndent}
          L ${centromereMiddle + centromereWidth/2} ${y + centromereIndent}
          L ${centromereEnd} ${y}
          L ${centromereEnd} ${y + config.chromosomeHeight}
          L ${centromereMiddle + centromereWidth/2} ${y + config.chromosomeHeight - centromereIndent}
          L ${centromereMiddle - centromereWidth/2} ${y + config.chromosomeHeight - centromereIndent}
          L ${centromereStart} ${y + config.chromosomeHeight} Z`)
      .attr("fill", d3.color(speciesColor)?.darker(0.3)?.toString() ?? speciesColor)
      .attr("stroke", "none");
  }

  // Add chromosome label
  chromosomeGroup.append("text")
    .attr("x", xOffset + chrWidth/2)
    .attr("y", y - roundedEnd - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "500")
    .attr("class", "text-foreground")
    .attr("fill", "currentColor")
    .text(chr.chr_id);

  // Enhanced breakpoint visualization
  if (isReferenceChromosome && breakpoints.length > 0) {
    const relevantBreakpoints = breakpoints.filter(bp => bp.ref_chr === chr.chr_id);
    
    if (relevantBreakpoints.length > 0) {
      const trackY = y + config.chromosomeHeight + BREAKPOINT_CONFIG.trackSpacing;

      // Create a group for all breakpoint-related elements
      const breakpointGroup = container.append("g")
        .attr("class", "breakpoint-visualization")
        .attr("transform", `translate(${xOffset}, ${trackY})`);

      // Add main track
      const track = breakpointGroup.append("g")
        .attr("class", "breakpoint-track");

      // Add subtle background track
      track.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", xScale(chr.chr_size_bp))
        .attr("height", BREAKPOINT_CONFIG.trackHeight)
        .attr("fill", BREAKPOINT_CONFIG.colors.track)
        .attr("opacity", 0.3)
        .attr("rx", 1);

      // Group breakpoints that are close to each other
      const groupedBreakpoints = groupCloseBreakpoints(relevantBreakpoints, xScale);

      // Render breakpoint markers
      groupedBreakpoints.forEach((group, groupIndex) => {
        const breakpointMarkers = track.append("g")
          .attr("class", "breakpoint-group");

        group.forEach((bp, index) => {
          // Create start marker
          createBreakpointMarker(
            breakpointMarkers,
            bp.ref_start,
            bp.ref_end,
            xScale,
            BREAKPOINT_CONFIG,
            (event) => {
              const tooltipContent = formatBreakpointTooltip(bp);
              onHover(event, tooltipContent);
            },
            onMove,
            onLeave
          );

          // Add connecting line between start and end
          if (bp.ref_end - bp.ref_start > 1000) { // Only show connector if gap is significant
            breakpointMarkers.append("path")
              .attr("d", createConnectorPath(
                xScale(bp.ref_start),
                xScale(bp.ref_end),
                BREAKPOINT_CONFIG.trackHeight
              ))
              .attr("stroke", BREAKPOINT_CONFIG.colors.connector)
              .attr("stroke-width", BREAKPOINT_CONFIG.connectorStrokeWidth)
              .attr("stroke-dasharray", BREAKPOINT_CONFIG.dashArray)
              .attr("fill", "none")
              .attr("opacity", 0.6);
          }
        });
      });

      // Add minimal label for the first chromosome
      if (chr.chr_id === '1') {
        breakpointGroup.append("text")
          .attr("x", -8)
          .attr("y", BREAKPOINT_CONFIG.trackHeight / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "9px")
          .attr("font-weight", "500")
          .attr("fill", "currentColor")
          .attr("opacity", 0.8)
          .text("BreakPoint");
      }
    }
  }

  return container;
}

// Helper functions
function groupCloseBreakpoints(breakpoints: ChromosomeBreakpoint[], xScale: d3.ScaleLinear<number, number>) {
  const minDistance = 50; // minimum pixels between breakpoints
  const groups: ChromosomeBreakpoint[][] = [];
  let currentGroup: ChromosomeBreakpoint[] = [];

  breakpoints.sort((a, b) => a.ref_start - b.ref_start).forEach(bp => {
    if (currentGroup.length === 0) {
      currentGroup.push(bp);
    } else {
      const lastBp = currentGroup[currentGroup.length - 1];
      if (Math.abs(xScale(bp.ref_start) - xScale(lastBp.ref_end)) < minDistance) {
        currentGroup.push(bp);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [bp];
      }
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function createBreakpointMarker(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  start: number,
  end: number,
  xScale: d3.ScaleLinear<number, number>,
  config: BreakpointMarkerConfig,
  onHover: (event: any) => void,
  onMove: (event: any) => void,
  onLeave: () => void
) {
  const markerGroup = container.append("g")
    .attr("class", "breakpoint-marker");

  // Add start triangle indicator
  markerGroup.append("path")
    .attr("d", `M ${xScale(start)} ${-config.triangleSize}
                L ${xScale(start) - config.triangleSize/2} ${0}
                L ${xScale(start) + config.triangleSize/2} ${0} Z`)
    .attr("fill", config.colors.triangle)
    .attr("opacity", 0.85);

  // Add end triangle indicator if start and end are different
  if (start !== end) {
    markerGroup.append("path")
      .attr("d", `M ${xScale(end)} ${-config.triangleSize}
                  L ${xScale(end) - config.triangleSize/2} ${0}
                  L ${xScale(end) + config.triangleSize/2} ${0} Z`)
      .attr("fill", config.colors.triangle)
      .attr("opacity", 0.85);
  }

  // Add interactive area
  markerGroup.append("rect")
    .attr("x", xScale(start) - 4)
    .attr("y", -config.triangleSize)
    .attr("width", Math.max(8, xScale(end) - xScale(start) + 8))
    .attr("height", config.trackHeight + config.triangleSize)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", onHover)
    .on("mousemove", onMove)
    .on("mouseleave", onLeave);
}

function createConnectorPath(x1: number, x2: number, height: number): string {
  const midY = height / 2;
  // Modified to account for triangles
  return `M ${x1} ${0} 
          L ${x1} ${height}
          M ${x1} ${midY}
          L ${x2} ${midY}
          M ${x2} ${0}
          L ${x2} ${height}`;
}

function formatBreakpointTooltip(bp: ChromosomeBreakpoint): string {
  const size = bp.ref_end - bp.ref_start;
  const sizeStr = formatGenomicPosition(size);
  return `Breakpoint: ${bp.breakpoint}
Location: Chr${bp.ref_chr}:${formatGenomicPosition(bp.ref_start)}-${formatGenomicPosition(bp.ref_end)}
Size: ${sizeStr}
Type: ${size > 1000000 ? 'Large-scale' : size > 10000 ? 'Medium-scale' : 'Small-scale'} breakpoint`;
}