"use client";

import * as d3 from "d3";
import React from "react";
import { ChromosomeBreakpoint, ChromosomeData, SyntenyData } from "@/app/types";
import { GeneTooltipData, getBreakpointTooltip } from "./tooltip";
import { 
  GeneAnnotation,
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
  onHover: (event: any, content: string | { type: string; data: GeneTooltipData | React.ReactElement }) => void;
  onMove: (event: any) => void;
  onLeave: () => void;
  container: d3.Selection<any, unknown, null, undefined>;
  annotations?: GeneAnnotation[];
  showAnnotations?: boolean;
  onGeneHover: (event: any, gene: GeneAnnotation) => void;
  onGeneLeave: () => void;
  config?: {
    chromosomeHeight: number;
    chromosomeSpacing: number;
    minVisibleSize: number;
    annotationHeight: number;
    annotationSpacing: number;
    maxTracks: number;
    geneColors: {
      forward: string;
      reverse: string;
    };
  };
  breakpoints?: ChromosomeBreakpoint[];
  isReferenceChromosome?: boolean;
  useStandardPalette?: boolean; // Added for distinct default colors
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
  annotations,
  onGeneHover,
  onGeneLeave,
  config = {
    chromosomeHeight: CHROMOSOME_CONFIG.HEIGHT,
    chromosomeSpacing: CHROMOSOME_CONFIG.SPACING,
    minVisibleSize: OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE,
    annotationHeight: GENE_ANNOTATION_CONFIG.HEIGHT,
    annotationSpacing: GENE_ANNOTATION_CONFIG.SPACING,
    maxTracks: GENE_ANNOTATION_CONFIG.MAX_TRACKS,
    geneColors: {
      forward: GENE_ANNOTATION_CONFIG.COLORS.FORWARD,
      reverse: GENE_ANNOTATION_CONFIG.COLORS.REVERSE,
    },
  },
  breakpoints = [],
  showAnnotations = false,
  isReferenceChromosome = false,
  useStandardPalette = false, // Added prop with default
}: ChromosomeViewProps) {
  const chrWidth = xScale(chr.chr_size_bp);

  // Determine the effective color for the chromosome
  let effectiveColor = speciesColor;
  if (useStandardPalette) {
    const colorPalette = d3.scaleOrdinal(d3.schemeCategory10);
    effectiveColor = colorPalette(chr.chr_id);
  }

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
    .attr("fill", effectiveColor) // Use effectiveColor
    .attr("stroke", d3.color(effectiveColor)?.darker(0.5)?.toString() ?? effectiveColor) // Use effectiveColor
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .style("transition", "opacity 0.2s ease-in-out");

  if (body && 'on' in body) {
    (body as d3.Selection<any, unknown, null, undefined>)
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
      .attr("fill", d3.color(effectiveColor)?.darker(0.3)?.toString() ?? effectiveColor) // Use effectiveColor
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

  // Render gene annotations if available and enabled
  if (showAnnotations && annotations && annotations.length > 0) {
    const relevantAnnotations = annotations.filter(
      (ann: GeneAnnotation) => ann.chromosome === chr.chr_id
    );

    // Simple track-laying algorithm
    const tracks: { end: number }[][] = Array.from(
      { length: config.maxTracks },
      () => []
    );

    relevantAnnotations.forEach((gene: GeneAnnotation) => {
      let placed = false;
      for (let i = 0; i < config.maxTracks; i++) {
        const lastGeneInTrack = tracks[i][tracks[i].length - 1];
        if (!lastGeneInTrack || gene.start > lastGeneInTrack.end) {
          tracks[i].push({ end: gene.end });

          const geneX = xOffset + xScale(gene.start);
          const geneWidth = Math.max(1, xScale(gene.end) - xScale(gene.start));
          const geneY =
            y +
            config.chromosomeHeight +
            5 +
            i * (config.annotationHeight + config.annotationSpacing);

          const geneColor =
            gene.strand === "+"
              ? config.geneColors.forward
              : config.geneColors.reverse;

          const geneGroup = container.append("g").attr("class", "gene-annotation");

          geneGroup
            .append("rect")
            .attr("x", geneX)
            .attr("y", geneY)
            .attr("width", geneWidth)
            .attr("height", config.annotationHeight)
            .attr("fill", geneColor)
            .attr("rx", 1)
            .style("cursor", "pointer")
            .on("mouseover", (event) => onGeneHover(event, gene))
            .on("mousemove", (event) => onGeneHover(event, gene))
            .on("mouseleave", onGeneLeave);

          // Add arrow for strand direction if gene is large enough
          if (geneWidth > 5) {
            const arrowSize = Math.min(config.annotationHeight / 2, geneWidth / 3);
            const arrowY = geneY + config.annotationHeight / 2;
            const arrowPath = d3.path();

            if (gene.strand === "+") {
              const arrowX = geneX + geneWidth - arrowSize;
              arrowPath.moveTo(arrowX, arrowY - arrowSize);
              arrowPath.lineTo(arrowX + arrowSize, arrowY);
              arrowPath.lineTo(arrowX, arrowY + arrowSize);
            } else {
              const arrowX = geneX + arrowSize;
              arrowPath.moveTo(arrowX, arrowY - arrowSize);
              arrowPath.lineTo(arrowX - arrowSize, arrowY);
              arrowPath.lineTo(arrowX, arrowY + arrowSize);
            }
            arrowPath.closePath();

            geneGroup
              .append("path")
              .attr("d", arrowPath.toString())
              .attr("fill", "white")
              .attr("opacity", 0.7);
          }

          placed = true;
          break;
        }
      }
    });
  }

  // Enhanced breakpoint visualization: Mirrored chromosome approach
  if (isReferenceChromosome && breakpoints.length > 0) {
    const relevantBreakpoints = breakpoints.filter(bp => bp.ref_chr === chr.chr_id);
    
    if (relevantBreakpoints.length > 0) {
      const mirroredChrY = y + config.chromosomeHeight + 10; // 10px spacing below original

      // Draw a mirrored, "ghost" chromosome below the main one
      container.append("rect")
        .attr("x", xOffset)
        .attr("y", mirroredChrY)
        .attr("width", chrWidth)
        .attr("height", config.chromosomeHeight)
        .attr("rx", config.chromosomeHeight / 2)
        .attr("ry", config.chromosomeHeight / 2)
        .attr("fill", "hsl(var(--muted-foreground))")
        .attr("opacity", 0.2);

      // Draw breakpoints as colored segments on the mirrored chromosome
      const breakpointMarkers = container.append("g").attr("class", "breakpoint-markers");
      
      relevantBreakpoints.forEach(bp => {
        const bpStart = xOffset + xScale(bp.ref_start);
        const bpEnd = xOffset + xScale(bp.ref_end);
        // Ensure a minimum width for visibility of small breakpoints
        const bpWidth = Math.max(1, bpEnd - bpStart);

        breakpointMarkers.append("rect")
          .attr("x", bpStart)
          .attr("y", mirroredChrY)
          .attr("width", bpWidth)
          .attr("height", config.chromosomeHeight)
          .attr("fill", "#ef4444") // Directly use the color for breakpoints
          .attr("stroke", "hsl(var(--background))") // Add a border to separate breakpoints
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.8)
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            const tooltipContent = getBreakpointTooltip(bp);
            onHover(event, { type: 'breakpoint', data: tooltipContent });
          })
          .on("mousemove", onMove)
          .on("mouseleave", onLeave);
      });
    }
  }

  return container;
}
