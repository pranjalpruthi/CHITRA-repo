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
  width = 160,
  height = 120,
}: MiniMapProps) {
  const miniMapRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!miniMapRef.current || !mainSvgRef.current) return;

    const miniMap = d3.select(miniMapRef.current);
    miniMap.selectAll("*").remove();

    // Calculate proper scaling that maintains aspect ratio
    const mainAspectRatio = dimensions.width / dimensions.height;
    const miniMapAspectRatio = width / height;
    
    let scale: number;
    let translationX = 0;
    let translationY = 0;
    
    if (mainAspectRatio > miniMapAspectRatio) {
      scale = width / dimensions.width;
      translationY = (height - dimensions.height * scale) / 2;
    } else {
      scale = height / dimensions.height;
      translationX = (width - dimensions.width * scale) / 2;
    }

    // Theme-aware colors with more subtle styling
    const backgroundColor = theme === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--background))';
    const borderColor = theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))';
    const viewportColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    const ribbonOpacity = theme === 'dark' ? 0.12 : 0.2;

    const container = miniMap.append("g")
      .attr("transform", `translate(${translationX}, ${translationY})`);

    container.append("rect")
      .attr("width", dimensions.width * scale)
      .attr("height", dimensions.height * scale)
      .attr("fill", backgroundColor)
      .attr("stroke", borderColor)
      .attr("stroke-width", 0.5);

    const miniG = container.append("g")
      .attr("transform", `scale(${scale})`);

    const mainContent = mainSvgRef.current.querySelector("g");
    if (mainContent) {
      const clone = mainContent.cloneNode(true) as SVGGElement;
      
      d3.select(clone)
        .selectAll("text, .gene-annotation, .tooltip")
        .remove();
      
      d3.select(clone)
        .selectAll(".synteny-ribbon")
        .attr("opacity", ribbonOpacity)
        .attr("stroke-width", 0.25);

      d3.select(clone)
        .selectAll(".chromosome")
        .attr("stroke-width", 0.25)
        .attr("stroke", theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');

      miniG.node()?.appendChild(clone);
    }

    container.append("rect")
      .attr("class", "viewport-rect")
      .attr("width", viewportRect.width * scale)
      .attr("height", viewportRect.height * scale)
      .attr("x", viewportRect.x * scale)
      .attr("y", viewportRect.y * scale)
      .attr("fill", "none")
      .attr("stroke", viewportColor)
      .attr("stroke-width", 0.5)
      .style("pointer-events", "none");

    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on("drag", (event) => {
        if (!zoomBehaviorRef.current) return;
        
        const x = (event.x - translationX) / scale;
        const y = (event.y - translationY) / scale;
        
        const boundedX = Math.max(0, Math.min(x, dimensions.width - viewportRect.width));
        const boundedY = Math.max(0, Math.min(y, dimensions.height - viewportRect.height));
        
        const transform = d3.zoomIdentity
          .translate(-boundedX * zoom, -boundedY * zoom)
          .scale(zoom);

        d3.select(mainSvgRef.current)
          .transition()
          .duration(0)
          .call(zoomBehaviorRef.current.transform, transform);
      });

    miniMap.call(dragBehavior);
  }, [viewportRect, zoom, dimensions, width, height, mainSvgRef, zoomBehaviorRef, theme]);

  return (
    <div className={cn(
      "absolute bottom-3 right-3",
      isFullscreen && "z-10"
    )}>
      <svg
        ref={miniMapRef}
        width={width}
        height={height}
        className={cn(
          "rounded-md",
          "shadow-md",
          "border border-border/50",
          "bg-background/70 backdrop-blur-sm",
          "hover:bg-background/80 transition-colors"
        )}
        style={{
          cursor: 'move'
        }}
      />
    </div>
  );
}