"use client";

import * as d3 from "d3";
import { throttle } from 'lodash';
import { SyntenyData, ChromosomeData } from "@/app/types";

interface SyntenyRibbonProps {
  link: SyntenyData;
  sourceSpecies: string;
  targetSpecies: string;
  sourceY: number;
  targetY: number;
  xScale: d3.ScaleLinear<number, number>;
  speciesColorScale: d3.ScaleOrdinal<string, string>;
  referenceData: ChromosomeData[];
  container: d3.Selection<any, unknown, null, undefined>;
  onHover: (event: any, link: SyntenyData) => void;
  onMove: (event: any) => void;
  onLeave: () => void;
  chromosomeSpacing: number;
  chromosomeHeight: number;
  onSelect: (link: SyntenyData, isSelected: boolean) => void;
  isSelected?: boolean;
  zoomBehaviorRef: React.RefObject<d3.ZoomBehavior<any, any>>;
  selectedChromosomes: string[];
  mutationType?: MutationType;
  useCustomColors?: boolean;
  customSpeciesColors?: Map<string, string>;
  mutationColors?: Record<string, string>;
}

const SYNTENY_COLORS = {
  FORWARD: '#2563eb66',
  REVERSE: '#dc262666',
  BLOCK_FORWARD: '#2563eb',
  BLOCK_REVERSE: '#dc2626',
  STROKE_WIDTH: {
    SMALL: 1.5,
    MEDIUM: 2.5,
    LARGE: 3.5
  },
  OPACITY: {
    DEFAULT: 0.65, // Increased from 0.45 for better visibility
    HOVER: 0.75,
    SELECTED: 0.9,
    ACTIVE: 1.0
  }
} as const;

// Reduce throttle time for smoother interactions
const THROTTLE_MS = 8; // Reduced from 16ms to 8ms for smoother updates

// Add GPU acceleration and compositing hints
const COMPOSITE_STYLES = {
  transform: 'translate3d(0,0,0)', // Force GPU acceleration
  backfaceVisibility: 'hidden',
  perspective: '1000px',
  willChange: 'transform, opacity' // Hint to browser about expected changes
} as const;

// Add mutation type color mapping
export const MUTATION_COLORS = {
  SYN: '#4ade80',    // Green for syntenic
  INV: '#f87171',    // Red for inversion
  TRANS: '#60a5fa',  // Blue for translocation
  INVTR: '#c084fc',  // Purple for inverted translocation
  DUP: '#fbbf24',    // Yellow for duplication
  INVDP: '#f472b6'   // Pink for inverted duplication
} as const;

export type MutationType = keyof typeof MUTATION_COLORS;

// Add and export this
export const mutationFullNames: Record<string, string> = {
  SYN: "Synteny",
  DUP: "Duplication",
  INV: "Inversion",
  TRANS: "Translocation",
  INVTR: "Inverted Translocation",
  INVDP: "Inverted Duplication"
};

export function renderSyntenyRibbon({
  link,
  sourceSpecies,
  targetSpecies,
  sourceY,
  targetY,
  xScale,
  speciesColorScale,
  referenceData,
  container: g,
  onHover,
  onMove,
  onLeave,
  chromosomeSpacing,
  chromosomeHeight,
  onSelect,
  isSelected = false,
  zoomBehaviorRef,
  selectedChromosomes,
  mutationType,
  useCustomColors = false,
  customSpeciesColors,
  mutationColors = MUTATION_COLORS,
}: SyntenyRibbonProps) {
  const MUTATION_COLOR_VARIANTS = Object.entries(mutationColors).reduce((acc, [key, color]) => ({
    ...acc,
    [key]: {
      DEFAULT: `${color}66`,
      SOLID: color,
    }
  }), {} as Record<MutationType, { DEFAULT: string; SOLID: string }>);

  // Enhanced filtering logic
  const shouldRenderRibbon = () => {
    // If no chromosomes are selected, show all ribbons
    if (selectedChromosomes.length === 0) return true;

    const refChr = `ref:${link.ref_chr}`;
    const queryChr = `${link.query_name}:${link.query_chr}`;

    // Check if reference chromosome is selected
    const isRefSelected = selectedChromosomes.includes(refChr);
    
    // If reference chromosome is selected but no query chromosomes are selected,
    // show all connections to this reference chromosome
    const hasSelectedQueryChrs = selectedChromosomes.some(chr => 
      chr.startsWith(link.query_name + ":")
    );

    if (isRefSelected && !hasSelectedQueryChrs) {
      return true; // Show all connections to selected reference chromosome
    }

    // If both reference and query chromosomes are selected,
    // only show ribbons between selected chromosomes
    return isRefSelected && selectedChromosomes.includes(queryChr);
  };

  // Check if we should render this ribbon
  if (!shouldRenderRibbon()) {
    return null;
  }

  // Check viewport visibility before rendering
  const isInViewport = () => {
    const bounds = g.node()?.getBoundingClientRect();
    if (!bounds) return false;
    return !(bounds.right < 0 || bounds.bottom < 0 || 
            bounds.left > window.innerWidth || 
            bounds.top > window.innerHeight);
  };

  // Skip rendering if not in viewport
  if (!isInViewport()) return null;

  // Get chromosome positions
  const getXPosition = (species: string, chr: string, pos: number) => {
    const speciesChrs = referenceData.filter(d => d.species_name === species);
    let xPos = 0;
    for (const chromosome of speciesChrs) {
      if (chromosome.chr_id === chr) {
        const constrainedPos = Math.min(Math.max(pos, 0), chromosome.chr_size_bp);
        return xPos + xScale(constrainedPos);
      }
      xPos += xScale(chromosome.chr_size_bp) + chromosomeSpacing * 2;
    }
    return 0;
  };

  // Calculate ribbon positions
  const x1 = getXPosition(sourceSpecies, link.ref_chr, link.ref_start);
  const x2 = getXPosition(targetSpecies, link.query_chr, link.query_start);

  // Get chromosome sizes for width constraints
  const sourceChromosome = referenceData.find(c => 
    c.species_name === sourceSpecies && c.chr_id === link.ref_chr
  );
  const targetChromosome = referenceData.find(c => 
    c.species_name === targetSpecies && c.chr_id === link.query_chr
  );

  // Calculate constrained widths
  const width1 = sourceChromosome ? 
    Math.min(
      xScale(link.ref_end - link.ref_start),
      xScale(sourceChromosome.chr_size_bp) - (x1 - getXPosition(sourceSpecies, link.ref_chr, 0))
    ) : 0;

  const width2 = targetChromosome ? 
    Math.min(
      xScale(link.query_end - link.query_start),
      xScale(targetChromosome.chr_size_bp) - (x2 - getXPosition(targetSpecies, link.query_chr, 0))
    ) : 0;

  // Create a unique identifier for this synteny ribbon
  const syntenyId = `synteny-${link.ref_chr}-${link.query_chr}-${link.ref_start}-${link.query_start}`;

  // Create a group for the entire synteny visualization with initial selected state
  const blockGroup = g.append("g")
    .datum(link) // Bind the data to the element
    .attr("class", `synteny-group ${isSelected ? 'selected' : ''}`)
    .attr("data-synteny-id", syntenyId)
    .attr("data-selected", isSelected ? "true" : "false")
    .style("user-select", "none")
    .style("-webkit-user-select", "none");

  // Modify transition timing to be more stable
  const transition = "all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)";

  // Modify the color selection logic
  const getRibbonColors = () => {
    if (useCustomColors && mutationType) {
      return {
        fill: MUTATION_COLOR_VARIANTS[mutationType].DEFAULT,
        stroke: MUTATION_COLOR_VARIANTS[mutationType].SOLID
      };
    }
    return {
      fill: link.query_strand === '+' ? SYNTENY_COLORS.FORWARD : SYNTENY_COLORS.REVERSE,
      stroke: link.query_strand === '+' ? SYNTENY_COLORS.BLOCK_FORWARD : SYNTENY_COLORS.BLOCK_REVERSE
    };
  };

  const colors = getRibbonColors();

  // Source block
  const sourceBlock = blockGroup.append("rect")
    .attr("x", x1)
    .attr("y", sourceY)
    .attr("width", width1)
    .attr("height", chromosomeHeight)
    .attr("fill", colors.fill)
    .attr("stroke", colors.stroke)
    .attr("stroke-width", 2)
    .attr("class", "matching-block source")
    .attr("opacity", 0.8);

  // Target block
  const targetBlock = blockGroup.append("rect")
    .attr("x", x2)
    .attr("y", targetY)
    .attr("width", width2)
    .attr("height", chromosomeHeight)
    .attr("fill", colors.fill)
    .attr("stroke", colors.stroke)
    .attr("stroke-width", 2)
    .attr("class", "matching-block target")
    .attr("opacity", 0.8);

  // Create gradient for ribbon
  const gradientId = `gradient-${link.ref_chr}-${link.query_chr}-${Math.random().toString(36).substr(2, 9)}`;
  const gradient = g.append("defs")
    .append("linearGradient")
    .attr("id", gradientId)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", x1)
    .attr("y1", sourceY)
    .attr("x2", x2)
    .attr("y2", targetY);

  // Get the query species color with custom color support
  const queryColor = customSpeciesColors?.get(targetSpecies) || 
    speciesColorScale(targetSpecies);
  
  // Create a more visible gradient with higher opacity
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.7");  // Option 2: Increased from 0.6

  gradient.append("stop")
    .attr("offset", "15%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "1.0");  // Option 2: Increased from 0.9

  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "1.0");  // Remains 1.0

  gradient.append("stop")
    .attr("offset", "85%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "1.0");  // Option 2: Increased from 0.9

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.7");  // Option 2: Increased from 0.6

  // Use this color in gradient creation
  gradient.selectAll("stop")
    .attr("stop-color", useCustomColors ? colors.stroke : queryColor);

  // Draw ribbon
  const path = d3.path();
  const sourceEdgeY = sourceY < targetY ? sourceY + chromosomeHeight : sourceY;
  const targetEdgeY = sourceY < targetY ? targetY : targetY + chromosomeHeight;

  path.moveTo(x1, sourceEdgeY);
  path.bezierCurveTo(
    x1, (sourceEdgeY + targetEdgeY) / 2,
    x2, (sourceEdgeY + targetEdgeY) / 2,
    x2, targetEdgeY
  );
  path.lineTo(x2 + width2, targetEdgeY);
  path.bezierCurveTo(
    x2 + width2, (sourceEdgeY + targetEdgeY) / 2,
    x1 + width1, (sourceEdgeY + targetEdgeY) / 2,
    x1 + width1, sourceEdgeY
  );
  path.closePath();

  // Add ribbon with events
  const ribbon = blockGroup.append("path")
    .attr("d", path.toString())
    .attr("fill", `url(#${gradientId})`)
    .attr("stroke", "rgba(0,0,0,0.3)") // Add border
    .attr("stroke-width", 0.5)          // Add border width
    .attr("opacity", isSelected ? SYNTENY_COLORS.OPACITY.SELECTED : SYNTENY_COLORS.OPACITY.DEFAULT)
    .attr("class", `synteny-ribbon ${isSelected ? 'selected' : ''}`)
    .attr("data-synteny-id", syntenyId)
    .style("transition", "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)");

  // Add CSS classes for hover management
  blockGroup.style("position", "relative")
    .style("mix-blend-mode", "normal"); // Changed from multiply for better visibility

  blockGroup
    .on("mouseover", (event: MouseEvent) => {
      if (!blockGroup.classed("selected")) {
        ribbon.attr("opacity", SYNTENY_COLORS.OPACITY.HOVER);
        sourceBlock.attr("opacity", 1);
        targetBlock.attr("opacity", 1);
        blockGroup.raise();
      }
      onHover(event, link);
    })
    .on("mouseout", () => {
      if (!blockGroup.classed("selected")) {
        ribbon.attr("opacity", SYNTENY_COLORS.OPACITY.DEFAULT);
        sourceBlock.attr("opacity", 0.8);
        targetBlock.attr("opacity", 0.8);
      }
      onLeave();
    })
    .on("mousemove", (event: MouseEvent) => onMove(event))
    .on("click", (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const currentlySelected = blockGroup.classed("selected");
      onSelect(link, !currentlySelected);
    });

  // Update gradient colors if using mutation type colors
  if (useCustomColors && mutationType) {
    gradient.selectAll("stop")
      .attr("stop-color", colors.stroke);
  }

  return blockGroup;
}
