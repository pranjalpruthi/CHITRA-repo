"use client";

import * as d3 from "d3";
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
}

const SYNTENY_COLORS = {
  FORWARD: '#2563eb33',
  REVERSE: '#dc262633',
  BLOCK_FORWARD: '#3b82f6',
  BLOCK_REVERSE: '#ef4444',
  STROKE_WIDTH: {
    SMALL: 1.5,
    MEDIUM: 2.5,
    LARGE: 3.5
  },
  OPACITY: {
    DEFAULT: 0.6,
    HOVER: 0.85,
    SELECTED: 1.0,
    ACTIVE: 1.0
  }
} as const;

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
}: SyntenyRibbonProps) {
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
    .attr("class", `synteny-group ${isSelected ? 'selected' : ''}`)
    .attr("data-synteny-id", syntenyId)
    .attr("data-selected", isSelected ? "true" : "false")
    .attr("data-block-size", width1 * width2) // Store block size for sorting
    .style("pointer-events", "all") // Ensure all events are captured
    .style("user-select", "none")
    .style("-webkit-user-select", "none")
    .style("-moz-user-select", "none")
    .style("-ms-user-select", "none");

  // Set z-index based on block size (smaller blocks on top)
  const zIndex = Math.round(1000000 - (width1 * width2)); // Invert size for z-index
  blockGroup.style("z-index", zIndex);

  // Source block
  const sourceBlock = blockGroup.append("rect")
    .attr("x", x1)
    .attr("y", sourceY)
    .attr("width", width1)
    .attr("height", chromosomeHeight)
    .attr("fill", link.query_strand === '+' ? SYNTENY_COLORS.FORWARD : SYNTENY_COLORS.REVERSE)
    .attr("stroke", link.query_strand === '+' ? SYNTENY_COLORS.BLOCK_FORWARD : SYNTENY_COLORS.BLOCK_REVERSE)
    .attr("stroke-width", 2)
    .attr("class", "matching-block source")
    .attr("opacity", 0.8);

  // Target block
  const targetBlock = blockGroup.append("rect")
    .attr("x", x2)
    .attr("y", targetY)
    .attr("width", width2)
    .attr("height", chromosomeHeight)
    .attr("fill", link.query_strand === '+' ? SYNTENY_COLORS.FORWARD : SYNTENY_COLORS.REVERSE)
    .attr("stroke", link.query_strand === '+' ? SYNTENY_COLORS.BLOCK_FORWARD : SYNTENY_COLORS.BLOCK_REVERSE)
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

  // Get the query species color
  const queryColor = speciesColorScale(targetSpecies);
  
  // Create a more visible gradient with higher opacity
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.5");  // Increased from 0.4

  gradient.append("stop")
    .attr("offset", "15%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.8");  // Increased from 0.7

  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "1.0");  // Increased from 0.9

  gradient.append("stop")
    .attr("offset", "85%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.8");  // Increased from 0.7

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", queryColor)
    .attr("stop-opacity", "0.5");  // Increased from 0.4

  // Draw ribbon
  const path = d3.path();
  const sourceEdgeY = sourceY;
  const targetEdgeY = targetY + chromosomeHeight;

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
    .attr("opacity", isSelected ? SYNTENY_COLORS.OPACITY.SELECTED : SYNTENY_COLORS.OPACITY.DEFAULT)
    .attr("class", `synteny-ribbon ${isSelected ? 'selected' : ''}`)
    .attr("data-synteny-id", syntenyId)
    .attr("stroke", isSelected ? (link.query_strand === '+' ? SYNTENY_COLORS.BLOCK_FORWARD : SYNTENY_COLORS.BLOCK_REVERSE) : 'none')
    .attr("stroke-width", isSelected ? 2 : 0)
    .attr("stroke-opacity", isSelected ? 0.8 : 0)
    .style("transition", "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.2s ease-in-out")
    .style("position", "relative") // Enable stacking context
    .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))");  // Increased shadow intensity

  // Add CSS classes for hover management
  blockGroup.style("position", "relative")
    .style("mix-blend-mode", "normal"); // Changed from multiply for better visibility

  // Initial state setup - Set initial opacities based on selection state
  const setElementStates = (selected: boolean) => {
    ribbon
      .attr("opacity", selected ? SYNTENY_COLORS.OPACITY.SELECTED : SYNTENY_COLORS.OPACITY.DEFAULT)
      .classed("selected", selected)
      .attr("data-selected", selected ? "true" : "false")
      .attr("stroke", selected ? (link.query_strand === '+' ? SYNTENY_COLORS.BLOCK_FORWARD : SYNTENY_COLORS.BLOCK_REVERSE) : 'none')
      .attr("stroke-width", selected ? 2 : 0)
      .attr("stroke-opacity", selected ? 0.8 : 0);

    [sourceBlock, targetBlock].forEach(block => {
      block
        .attr("opacity", selected ? 1 : 0.8)
        .classed("selected", selected)
        .attr("data-selected", selected ? "true" : "false")
        .attr("stroke-width", selected ? 3 : 2);
    });

    blockGroup
      .attr("data-selected", selected ? "true" : "false")
      .classed("selected", selected);
  };

  // Set initial states
  setElementStates(isSelected);

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const svg = d3.select(g.node().parentNode);
    const zoomBehavior = zoomBehaviorRef.current;
    const currentTransform = d3.zoomTransform(svg.node());

    const newSelectedState = !isSelected;
    
    // Update all visual states
    setElementStates(newSelectedState);

    if (newSelectedState) {
      blockGroup.raise();
    }

    // Preserve transform
    if (zoomBehavior) {
      svg
        .transition()
        .duration(0)
        .call(zoomBehavior.transform, currentTransform);
    }
    
    g.attr("transform", currentTransform.toString());
    
    onSelect(link, newSelectedState);
  };

  const handleGroupHover = () => {
    const currentlySelected = blockGroup.attr("data-selected") === "true";
    if (!currentlySelected) {
      const svg = d3.select(g.node().parentNode);
      const currentTransform = d3.zoomTransform(svg.node());

      ribbon.attr("opacity", SYNTENY_COLORS.OPACITY.HOVER);
      [sourceBlock, targetBlock].forEach(block => {
        block
          .attr("opacity", 1)
          .attr("stroke-width", 3);
      });

      blockGroup.raise();
      g.attr("transform", currentTransform.toString());
    }
  };

  const handleGroupLeave = () => {
    const currentlySelected = blockGroup.attr("data-selected") === "true";
    setElementStates(currentlySelected); // Reuse the setElementStates function
    onLeave();
  };

  // Attach events to all elements
  const attachEvents = (element: d3.Selection<any, unknown, null, undefined>) => {
    element
      .on("mouseover.synteny", (event: MouseEvent) => {
        // Get all blocks at the current mouse position
        const mousePoint = d3.pointer(event);
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY)
          .filter(el => el.classList.contains('synteny-group'))
          .map(el => d3.select(el));

        // Find the smallest block that contains the mouse point
        const smallestBlock = elementsAtPoint
          .sort((a, b) => {
            const sizeA = parseFloat(a.attr('data-block-size'));
            const sizeB = parseFloat(b.attr('data-block-size'));
            return sizeA - sizeB;
          })[0];

        // Only trigger hover if this is the smallest block or no other blocks are present
        if (!smallestBlock || smallestBlock.attr('data-synteny-id') === syntenyId) {
          handleGroupHover();
          onHover(event, link);
        }
      })
      .on("mouseout.synteny", (event: MouseEvent) => {
        // Only trigger mouseout if we're not entering another part of the same block
        const toElement = event.relatedTarget as Element;
        if (!toElement || !blockGroup.node()?.contains(toElement)) {
          handleGroupLeave();
        }
      })
      .on("mousemove.synteny", onMove)
      .on("click.synteny", handleClick);
  };

  // Attach events to all elements
  [ribbon, sourceBlock, targetBlock].forEach(attachEvents);

  return blockGroup;
}