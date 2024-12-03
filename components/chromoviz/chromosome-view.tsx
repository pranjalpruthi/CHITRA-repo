"use client";

import * as d3 from "d3";
import { ChromosomeData, GeneAnnotation } from "@/app/types";
import { GeneTooltipData } from "./tooltip";

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
}

const CHROMOSOME_CONFIG = {
  HEIGHT: 24,
  SPACING: 15,
  TELOMERE_RADIUS: 12,
  CENTROMERE_WIDTH: 20,
  CENTROMERE_INDENT: 6,
  ANNOTATION_HEIGHT: 8,
  ANNOTATION_SPACING: 2,
  ANNOTATION_COLORS: {
    transcribed_pseudogene: '#94a3b8', // slate-400
    protein_coding: '#2563eb',         // blue-600
    pseudogene: '#dc2626',            // red-600
    ncRNA: '#16a34a',                 // green-600
    tRNA: '#8b5cf6',                  // violet-500
    rRNA: '#ec4899',                  // pink-500
    default: '#6b7280'                // gray-500
  }
} as const;

const GENE_ANNOTATION_CONFIG = {
  HEIGHT: 6,
  SPACING: 1,
  TRACK_SPACING: 8,
  MAX_TRACKS: 3,
  ARROW_SIZE: 4,
  COLORS: {
    FORWARD: '#dc2626',    // red-600 for forward strand
    REVERSE: '#2563eb',    // blue-600 for reverse strand
    transcribed_pseudogene: '#94a3b8',
    protein_coding: '#dc2626',
    pseudogene: '#dc2626',
    ncRNA: '#16a34a',
    tRNA: '#8b5cf6',
    rRNA: '#ec4899',
    default: '#6b7280'
  }
} as const;

const OPTIMIZATION_CONFIG = {
  MIN_VISIBLE_SIZE: 1,       // Reduced minimum size to show smaller genes
  MAX_VISIBLE_GENES: 10000,  // Increased maximum number of genes
  CLUSTERING_THRESHOLD: 0,   // Disabled clustering by setting threshold to 0
  BUFFER_FACTOR: 1.2        // Keep the same buffer factor
} as const;

function getChromosomeTooltip(chr: ChromosomeData): string {
  const mbSize = (chr.chr_size_bp / 1_000_000).toFixed(2);
  const centromereInfo = chr.centromere_start && chr.centromere_end
    ? `${(chr.centromere_start / 1_000_000).toFixed(2)}-${(chr.centromere_end / 1_000_000).toFixed(2)} Mb`
    : 'Not Available';
  
  return `
    ${chr.species_name} ${chr.chr_id}
    ─────────────────
    Type: ${chr.chr_type || 'Unknown'}
    Length: ${mbSize} Mb
    ${chr.centromere_start ? `Centromere: ${centromereInfo}` : ''}
    ${chr.centromere_start ? `Structure: ${chr.centromere_start ? 'Metacentric/Submetacentric' : 'Acrocentric'}` : ''}
  `.trim();
}

// Add new constants for strand indicators and styling
const STRAND_INDICATORS = {
  FORWARD: '⏩',
  REVERSE: '⏪',
} as const;

const BADGE_STYLES = {
  base: "px-2 py-0.5 rounded-full text-xs font-medium",
  colors: {
    cluster: "bg-blue-100 text-blue-800 border border-blue-200",
    forward: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    reverse: "bg-rose-100 text-rose-800 border border-rose-200",
    default: "bg-gray-100 text-gray-800 border border-gray-200"
  }
} as const;

// Update getGeneTooltip to return a string or object based on need
function getGeneTooltip(gene: GeneAnnotation & { isCluster?: boolean; geneCount?: number }): string | {
  type: 'gene';
  data: GeneTooltipData;
} {
  // For hover events, return a simple string
  if (!gene.isCluster) {
    return `
      ${gene.symbol || 'Unknown Gene'}
      ${gene.strand === '+' ? '→ Forward' : '← Reverse'}
      Type: ${gene.class}
      Position: ${(gene.start / 1_000_000).toFixed(2)}-${(gene.end / 1_000_000).toFixed(2)} Mb
      ${gene.name ? `Name: ${gene.name}` : ''}
      ${gene.locus_tag ? `Locus: ${gene.locus_tag}` : ''}
      ID: ${gene.GeneID}
    `.trim();
  }

  // For click events, return the rich object for the enhanced tooltip
  return {
    type: 'gene',
    data: {
      symbol: gene.symbol || 'Unknown Gene',
      strand: gene.strand,
      class: gene.class,
      position: `${(gene.start / 1_000_000).toFixed(2)}-${(gene.end / 1_000_000).toFixed(2)}`,
      isCluster: (gene as GeneAnnotation & { isCluster?: boolean }).isCluster,
      geneCount: (gene as GeneAnnotation & { geneCount?: number }).geneCount,
      name: gene.name,
      locus_tag: gene.locus_tag,
      GeneID: gene.GeneID
    }
  };
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
  annotations = [],
  showAnnotations = true
}: ChromosomeViewProps) {
  const chrWidth = xScale(chr.chr_size_bp);
  const chrPath = d3.path();
  const roundedEnd = CHROMOSOME_CONFIG.HEIGHT / 2;
  const centromereWidth = CHROMOSOME_CONFIG.HEIGHT * 0.8;
  const centromereIndent = CHROMOSOME_CONFIG.HEIGHT * 0.2;

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
    
    chrPath.lineTo(centromereEnd, y + CHROMOSOME_CONFIG.HEIGHT);
    chrPath.lineTo(centromereMiddle + centromereWidth/2, y + CHROMOSOME_CONFIG.HEIGHT - centromereIndent);
    chrPath.lineTo(centromereMiddle - centromereWidth/2, y + CHROMOSOME_CONFIG.HEIGHT - centromereIndent);
    chrPath.lineTo(centromereStart, y + CHROMOSOME_CONFIG.HEIGHT);
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
      .on("mouseover", (e) => onHover(e, getChromosomeTooltip(chr)))
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
          L ${centromereEnd} ${y + CHROMOSOME_CONFIG.HEIGHT}
          L ${centromereMiddle + centromereWidth/2} ${y + CHROMOSOME_CONFIG.HEIGHT - centromereIndent}
          L ${centromereMiddle - centromereWidth/2} ${y + CHROMOSOME_CONFIG.HEIGHT - centromereIndent}
          L ${centromereStart} ${y + CHROMOSOME_CONFIG.HEIGHT} Z`)
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

  // Only render annotations for reference chromosomes
  if (showAnnotations && annotations.length > 0 && chr.annotations) {
    const annotationGroup = container.append("g")
      .attr("class", "gene-annotations")
      .attr("transform", `translate(0, ${y + CHROMOSOME_CONFIG.HEIGHT + 5})`);

    // Get current view parameters
    const viewportWidth = xScale.range()[1] - xScale.range()[0];
    const domainWidth = xScale.domain()[1] - xScale.domain()[0];
    const bpPerPixel = domainWidth / viewportWidth;

    // Filter and cluster annotations based on visibility
    const visibleAnnotations = annotations
      .filter(gene => {
        const width = xScale(gene.end) - xScale(gene.start);
        return width >= OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE;
      })
      .reduce((clusters: GeneAnnotation[][], gene) => {
        const lastCluster = clusters[clusters.length - 1];
        const lastGene = lastCluster?.[lastCluster.length - 1];
        
        if (!lastGene || 
            (xScale(gene.start) - xScale(lastGene.end)) > OPTIMIZATION_CONFIG.CLUSTERING_THRESHOLD) {
          clusters.push([gene]);
        } else {
          lastCluster.push(gene);
        }
        return clusters;
      }, [])
      .map(cluster => {
        if (cluster.length === 1) return cluster[0];
        
        // Merge cluster into a representative gene
        const start = Math.min(...cluster.map(g => g.start));
        const end = Math.max(...cluster.map(g => g.end));
        return {
          ...cluster[0],
          start,
          end,
          isCluster: true,
          geneCount: cluster.length
        };
      })
      .slice(0, OPTIMIZATION_CONFIG.MAX_VISIBLE_GENES);

    // Track management with optimized algorithm
    const tracks: GeneAnnotation[][] = [];
    
    visibleAnnotations.forEach(gene => {
      let trackIndex = 0;
      while (true) {
        const track = tracks[trackIndex] || [];
        const lastGene = track[track.length - 1];
        
        if (!lastGene || xScale(gene.start) - xScale(lastGene.end) >= OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE) {
          if (!tracks[trackIndex]) tracks[trackIndex] = [];
          tracks[trackIndex].push(gene);
          break;
        }
        trackIndex++;
        if (trackIndex >= GENE_ANNOTATION_CONFIG.MAX_TRACKS) break;
      }
    });

    // Render optimized tracks
    tracks.forEach((track, trackIndex) => {
      track.forEach(gene => {
        const x = xOffset + xScale(gene.start);
        const width = Math.max(xScale(gene.end - gene.start), OPTIMIZATION_CONFIG.MIN_VISIBLE_SIZE);
        const yPos = trackIndex * GENE_ANNOTATION_CONFIG.TRACK_SPACING;

        // Gene body
        const geneGroup = annotationGroup.append("g")
          .attr("class", "gene")
          .attr("transform", `translate(${x}, ${yPos})`);

        // Main rectangle with adaptive sizing
        geneGroup.append("rect")
          .attr("width", width)
          .attr("height", GENE_ANNOTATION_CONFIG.HEIGHT)
          .attr("fill", gene.strand === '+' 
            ? GENE_ANNOTATION_CONFIG.COLORS.FORWARD 
            : GENE_ANNOTATION_CONFIG.COLORS.REVERSE)
          .attr("rx", width > 4 ? 1 : 0)
          .attr("ry", width > 4 ? 1 : 0)
          .style("cursor", "pointer")
          .on("mouseover", (e) => {
            // Always use the rich tooltip format
            const tooltipData: GeneTooltipData = {
              symbol: gene.symbol || 'Unknown Gene',
              strand: gene.strand,
              class: gene.class,
              position: `${(gene.start / 1_000_000).toFixed(2)}-${(gene.end / 1_000_000).toFixed(2)}`,
              isCluster: (gene as GeneAnnotation & { isCluster?: boolean }).isCluster,
              geneCount: (gene as GeneAnnotation & { geneCount?: number }).geneCount,
              name: gene.name,
              locus_tag: gene.locus_tag,
              GeneID: gene.GeneID
            };
            onHover(e, {
              type: 'gene',
              data: tooltipData
            });
          })
          .on("mousemove", onMove)
          .on("mouseleave", onLeave);

        // Only render direction arrows for sufficiently large genes
        if (width > 12) {
          const arrowSize = Math.min(GENE_ANNOTATION_CONFIG.ARROW_SIZE, width / 4);
          const arrowY = GENE_ANNOTATION_CONFIG.HEIGHT / 2;
          
          if (gene.strand === '+') {
            geneGroup.append("path")
              .attr("d", `M ${width - arrowSize * 2} ${arrowY} l ${arrowSize} -${arrowSize} l 0 ${arrowSize * 2} z`)
              .attr("fill", "white")
              .attr("opacity", 0.8);
          } else {
            geneGroup.append("path")
              .attr("d", `M ${arrowSize * 2} ${arrowY} l -${arrowSize} -${arrowSize} l 0 ${arrowSize * 2} z`)
              .attr("fill", "white")
              .attr("opacity", 0.8);
          }
        }
      });
    });
  }

  return container;
}