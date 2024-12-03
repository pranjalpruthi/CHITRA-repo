"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface MiniMapProps {
  mainSvgRef: React.RefObject<SVGSVGElement>;
  zoomBehaviorRef: React.RefObject<any>;
  viewportRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  zoom: number;
  isFullscreen?: boolean;
  width?: number;
  height?: number;
}

export function MiniMap({
  mainSvgRef,
  zoomBehaviorRef,
  viewportRect,
  dimensions,
  zoom,
  isFullscreen = false,
  width = 200,
  height = 150,
}: MiniMapProps) {
  const miniMapRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!miniMapRef.current) return;

    const miniMap = d3.select(miniMapRef.current);
    miniMap.selectAll("*").remove();

    const scale = Math.min(
      width / dimensions.width,
      height / dimensions.height
    );

    // Theme-aware colors
    const backgroundColor = theme === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--background))';
    const borderColor = theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))';
    const ribbonOpacity = theme === 'dark' ? 0.2 : 0.3;

    // Create mini-map background
    miniMap.append("rect")
      .attr("width", dimensions.width * scale)
      .attr("height", dimensions.height * scale)
      .attr("fill", backgroundColor)
      .attr("stroke", borderColor)
      .attr("stroke-width", 1);

    // Draw chromosomes in mini-map
    const miniG = miniMap.append("g")
      .attr("transform", `scale(${scale})`);

    // Clone and simplify main visualization for mini-map
    const mainSvg = d3.select(mainSvgRef.current);
    const clone = mainSvg.node()?.cloneNode(true) as SVGElement;
    const simplified = d3.select(clone).select("g");
    
    // Remove unnecessary elements and adjust opacity for theme
    simplified.selectAll("text").remove();
    simplified.selectAll(".synteny-ribbon")
      .attr("opacity", ribbonOpacity)
      .attr("stroke", theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

    // Adjust chromosome colors for theme
    simplified.selectAll(".chromosome")
      .attr("stroke", theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');

    miniG.node()?.appendChild(clone);

    // Update drag behavior
    const dragBehavior = d3.drag()
      .on("drag", (event) => {
        if (!zoomBehaviorRef.current) return;
        
        const x = event.x / scale;
        const y = event.y / scale;
        
        const transform = d3.zoomIdentity
          .translate(-x * zoom, -y * zoom)
          .scale(zoom);

        mainSvg
          .transition()
          .duration(0)
          .call(zoomBehaviorRef.current.transform, transform);
      });

    miniMap.call(dragBehavior as any);

  }, [viewportRect, zoom, dimensions, width, height, mainSvgRef, zoomBehaviorRef, theme]);

  return (
    <div className={cn(
      "absolute bottom-4 right-4",
      isFullscreen && "z-10"
    )}>
      <svg
        ref={miniMapRef}
        width={width}
        height={height}
        className={cn(
          "rounded-lg shadow-lg",
          "border border-border",
          "bg-background/80 backdrop-blur-sm"
        )}
        style={{
          cursor: 'move'
        }}
      />
    </div>
  );
}