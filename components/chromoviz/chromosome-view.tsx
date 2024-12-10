"use client";

import * as d3 from "d3";
import { ChromosomeData, GeneAnnotation } from "@/app/types";
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
  };
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
  showAnnotations = true,
  config = {
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
  }
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
      .on("mouseover", (e) => onHover(e, {
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

  // Only render annotations for reference chromosomes
  if (showAnnotations && annotations.length > 0 && chr.annotations) {
    const annotationGroup = container.append("g")
      .attr("class", "gene-annotations")
      .attr("transform", `translate(0, ${y + config.chromosomeHeight + 5})`);

    // Get current view parameters
    const viewportWidth = xScale.range()[1] - xScale.range()[0];
    const domainWidth = xScale.domain()[1] - xScale.domain()[0];
    const bpPerPixel = domainWidth / viewportWidth;

    // Filter and cluster annotations based on visibility
    const visibleAnnotations = annotations
      .filter(gene => {
        const width = xScale(gene.end) - xScale(gene.start);
        return width >= config.minVisibleSize;
      })
      .reduce((clusters: GeneAnnotation[][], gene) => {
        const lastCluster = clusters[clusters.length - 1];
        const lastGene = lastCluster?.[lastCluster.length - 1];
        
        if (!lastGene || 
            (xScale(gene.start) - xScale(lastGene.end)) > config.clusteringThreshold) {
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
      .slice(0, config.maxVisibleGenes);

    // Track management with optimized algorithm
    const tracks: GeneAnnotation[][] = [];
    
    visibleAnnotations.forEach(gene => {
      let trackIndex = 0;
      while (trackIndex < config.maxTracks) {
        const track = tracks[trackIndex] || [];
        const lastGene = track[track.length - 1];
        
        if (!lastGene || xScale(gene.start) - xScale(lastGene.end) >= config.minVisibleSize) {
          if (!tracks[trackIndex]) tracks[trackIndex] = [];
          tracks[trackIndex].push(gene);
          break;
        }
        trackIndex++;
      }
    });

    // Render optimized tracks
    tracks.forEach((track, trackIndex) => {
      track.forEach(gene => {
        const x = xOffset + xScale(gene.start);
        const width = Math.max(xScale(gene.end - gene.start), config.minVisibleSize);
        const yPos = trackIndex * config.annotationSpacing;

        // Gene body
        const geneGroup = annotationGroup.append("g")
          .attr("class", "gene")
          .attr("transform", `translate(${x}, ${yPos})`);

        // Main rectangle with adaptive sizing
        geneGroup.append("rect")
          .attr("width", width)
          .attr("height", config.annotationHeight)
          .attr("fill", gene.strand === '+' 
            ? config.geneColors.forward 
            : config.geneColors.reverse)
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